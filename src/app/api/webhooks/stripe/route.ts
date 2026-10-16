import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import type { Database, SubscriptionStatus } from '@/types/database';

let supabaseAdmin: SupabaseClient<Database> | null = null;

function getSupabaseAdmin(): SupabaseClient<Database> {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Missing Supabase admin environment variables.');
    }
    // Use service role client to bypass RLS for webhook backend writes
    supabaseAdmin = createClient<Database>(url, key);
  }
  return supabaseAdmin;
}

function toIsoDate(unixSeconds: number | null | undefined): string | null {
  if (unixSeconds == null) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

type SubscriptionPeriodFields = {
  current_period_start: number;
  current_period_end: number;
};

function getSubscriptionPeriods(subscription: Stripe.Subscription): {
  current_period_start: string;
  current_period_end: string;
} {
  const withPeriods = subscription as Stripe.Subscription & SubscriptionPeriodFields;
  return {
    current_period_start: toIsoDate(withPeriods.current_period_start)!,
    current_period_end: toIsoDate(withPeriods.current_period_end)!,
  };
}

async function upsertSubscription(
  subscription: Stripe.Subscription,
  userId: string
) {
  const item = subscription.items.data[0];
  const periods = getSubscriptionPeriods(subscription);
  const admin = getSupabaseAdmin();

  const { error } = await admin.from('subscriptions').upsert({
    id: subscription.id,
    user_id: userId,
    status: subscription.status as SubscriptionStatus,
    price_id: item.price.id,
    quantity: item.quantity ?? 1,
    cancel_at_period_end: subscription.cancel_at_period_end,
    current_period_start: periods.current_period_start,
    current_period_end: periods.current_period_end,
    ended_at: toIsoDate(subscription.ended_at),
    cancel_at: toIsoDate(subscription.cancel_at),
    canceled_at: toIsoDate(subscription.canceled_at),
    trial_start: toIsoDate(subscription.trial_start),
    trial_end: toIsoDate(subscription.trial_end),
    metadata: subscription.metadata,
  });

  if (error) {
    throw new Error(`Failed to upsert subscription: ${error.message}`);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature');

  if (!signature) {
    return new NextResponse('Missing Stripe-Signature header', { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${message}`);
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription.id;

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId =
            session.client_reference_id || session.metadata?.supabase_user_id;

          if (!userId) {
            throw new Error(
              'No user ID found on checkout session reference or metadata.'
            );
          }

          await upsertSubscription(subscription, userId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const admin = getSupabaseAdmin();

        let userId: string | undefined =
          subscription.metadata?.supabase_user_id;

        if (!userId) {
          const { data: existing } = await admin
            .from('subscriptions')
            .select('user_id')
            .eq('id', subscription.id)
            .single();

          userId = existing?.user_id ?? undefined;
        }

        if (!userId) {
          throw new Error(
            `No user ID found for subscription ${subscription.id}`
          );
        }

        await upsertSubscription(subscription, userId);
        break;
      }
      default:
        console.warn(`Unhandled event type ${event.type}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Webhook handler failed for ${event.type}:`, message);
    return new NextResponse('Webhook handler failed', { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
