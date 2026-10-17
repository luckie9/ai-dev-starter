/**
 * Simulates a signed Stripe `checkout.session.completed` webhook and verifies
 * Supabase subscriptions / user access were updated.
 *
 * Usage:
 *   node --env-file=.env.local scripts/test-checkout-webhook.mjs
 *   npm run test:checkout-webhook
 *
 * Env:
 *   WEBHOOK_URL   — override target (default: local, then production)
 *   DEMO_URL      — production base used as fallback
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const LOCAL_WEBHOOK =
  process.env.WEBHOOK_URL?.trim() ||
  'http://localhost:3000/api/webhooks/stripe';
const LIVE_WEBHOOK = `${(
  process.env.DEMO_URL || 'https://ai-dev-starter-seven.vercel.app'
).replace(/\/$/, '')}/api/webhooks/stripe`;

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.includes('...')) {
    throw new Error(`Missing or placeholder env: ${name}`);
  }
  return value;
}

async function resolveWebhookUrl() {
  if (process.env.WEBHOOK_URL?.trim()) {
    return process.env.WEBHOOK_URL.trim();
  }

  try {
    const probe = await fetch(LOCAL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(2500),
    });
    // Any HTTP response means the local server is up.
    if (probe.status > 0) return LOCAL_WEBHOOK;
  } catch {
    // fall through
  }

  console.log('Local webhook unavailable; using production endpoint.');
  return LIVE_WEBHOOK;
}

async function assertSchemaReady(supabase) {
  const { error } = await supabase.from('products').select('id').limit(1);
  if (!error) return;

  const missing =
    error.message.includes("Could not find the table") ||
    error.code === 'PGRST205' ||
    error.code === '42P01';

  if (missing) {
    throw new Error(
      'Supabase schema is missing public.products / public.subscriptions. ' +
        'Run supabase/migrations/001_initial_schema.sql in the Supabase SQL Editor, then re-run this test.',
    );
  }

  throw new Error(`Supabase schema check failed: ${error.message}`);
}

async function ensureTestUser(supabase) {
  const email = `webhook-test-${Date.now()}@example.com`;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: `TestAccess-${Date.now()}!`,
    email_confirm: true,
    user_metadata: { full_name: 'Webhook Test User' },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create Supabase auth user: ${error?.message}`);
  }

  return data.user;
}

async function ensureProductRow(supabase, priceId, productName) {
  const { error } = await supabase.from('products').upsert({
    id: priceId,
    active: true,
    name: productName,
    description: 'Seeded for checkout.session.completed webhook test',
    metadata: { source: 'test-checkout-webhook' },
  });

  if (error) {
    throw new Error(`Failed to upsert products row: ${error.message}`);
  }
}

async function createTrialSubscription(stripe, priceId, userId) {
  const customer = await stripe.customers.create({
    email: `stripe-webhook-test-${Date.now()}@example.com`,
    metadata: { supabase_user_id: userId, purpose: 'webhook-test' },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    trial_period_days: 3,
    metadata: { supabase_user_id: userId, purpose: 'webhook-test' },
  });

  return { customer, subscription };
}

function buildCheckoutCompletedEvent(subscription, userId) {
  const now = Math.floor(Date.now() / 1000);
  return {
    id: `evt_test_checkout_${now}`,
    object: 'event',
    api_version: '2025-04-30.basil',
    created: now,
    livemode: true,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `cs_test_${now}`,
        object: 'checkout.session',
        mode: 'subscription',
        status: 'complete',
        payment_status: 'paid',
        customer: subscription.customer,
        subscription: subscription.id,
        client_reference_id: userId,
        metadata: { supabase_user_id: userId },
      },
    },
  };
}

async function postSignedWebhook(webhookUrl, payload, secret) {
  const body = JSON.stringify(payload);
  const signature = Stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
    },
    body,
  });

  const text = await response.text();
  return { status: response.status, text };
}

async function verifySupabaseAccess(supabase, userId, subscriptionId) {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, status, price_id, current_period_end')
    .eq('id', subscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase subscription query failed: ${error.message}`);
  }

  if (!subscription) {
    return {
      ok: false,
      reason: 'No subscription row found after webhook',
      subscription: null,
    };
  }

  if (subscription.user_id !== userId) {
    return {
      ok: false,
      reason: `user_id mismatch (expected ${userId}, got ${subscription.user_id})`,
      subscription,
    };
  }

  const accessStatuses = new Set(['trialing', 'active']);
  if (!accessStatuses.has(subscription.status)) {
    return {
      ok: false,
      reason: `Unexpected status "${subscription.status}" (want trialing|active)`,
      subscription,
    };
  }

  return { ok: true, reason: 'Subscription grants user access', subscription };
}

async function cleanup(stripe, supabase, { customerId, subscriptionId, userId }) {
  const notes = [];

  if (subscriptionId) {
    try {
      await stripe.subscriptions.cancel(subscriptionId);
      notes.push(`canceled Stripe subscription ${subscriptionId}`);
    } catch (error) {
      notes.push(
        `subscription cleanup skipped: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (customerId) {
    try {
      await stripe.customers.del(customerId);
      notes.push(`deleted Stripe customer ${customerId}`);
    } catch (error) {
      notes.push(
        `customer cleanup skipped: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (userId) {
    try {
      await supabase.from('subscriptions').delete().eq('user_id', userId);
      await supabase.auth.admin.deleteUser(userId);
      notes.push(`deleted Supabase test user ${userId}`);
    } catch (error) {
      notes.push(
        `supabase cleanup skipped: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return notes;
}

async function main() {
  const stripeSecret = requireEnv('STRIPE_SECRET_KEY');
  const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');
  const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseKey) {
    throw new Error('Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)');
  }
  const priceId = requireEnv('NEXT_PUBLIC_STRIPE_PRICE_ID');

  const stripe = new Stripe(stripeSecret);
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const webhookUrl = await resolveWebhookUrl();
  console.log(`Target webhook: ${webhookUrl}`);

  await assertSchemaReady(supabase);
  console.log('Supabase schema ready (products/subscriptions present).');

  let customerId;
  let subscriptionId;
  let userId;
  let keepFixtures = process.env.KEEP_FIXTURES === '1';

  try {
    const user = await ensureTestUser(supabase);
    userId = user.id;
    console.log(`Created Supabase user: ${userId} (${user.email})`);

    await ensureProductRow(supabase, priceId, 'Pro Plan');
    console.log(`Ensured products row for price: ${priceId}`);

    const { customer, subscription } = await createTrialSubscription(
      stripe,
      priceId,
      userId,
    );
    customerId = customer.id;
    subscriptionId = subscription.id;
    console.log(
      `Created Stripe subscription: ${subscriptionId} (${subscription.status})`,
    );

    const event = buildCheckoutCompletedEvent(subscription, userId);
    const { status, text } = await postSignedWebhook(
      webhookUrl,
      event,
      webhookSecret,
    );

    console.log(`Webhook response: HTTP ${status}`);
    console.log(`Webhook body: ${text}`);

    if (status !== 200) {
      throw new Error(
        `Webhook endpoint did not accept the event (HTTP ${status}). ` +
          'For production, STRIPE_WEBHOOK_SECRET in this environment must match the deployed secret.',
      );
    }

    // Allow a brief window for DB write visibility.
    await new Promise((resolve) => setTimeout(resolve, 750));

    const verification = await verifySupabaseAccess(
      supabase,
      userId,
      subscriptionId,
    );

    console.log('');
    console.log('Supabase verification:');
    console.log(`  ok: ${verification.ok}`);
    console.log(`  detail: ${verification.reason}`);
    if (verification.subscription) {
      console.log(`  subscription: ${JSON.stringify(verification.subscription)}`);
    }

    if (!verification.ok) {
      keepFixtures = true;
      throw new Error('Webhook accepted but Supabase access was not updated.');
    }

    console.log('');
    console.log('SUCCESS: checkout.session.completed updated user access in Supabase.');
  } finally {
    if (keepFixtures) {
      console.log('KEEP_FIXTURES set or verification failed — skipping cleanup.');
    } else {
      const notes = await cleanup(stripe, supabase, {
        customerId,
        subscriptionId,
        userId,
      });
      if (notes.length) {
        console.log('Cleanup:');
        for (const note of notes) console.log(`  - ${note}`);
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
