/**
 * Creates a "Pro Plan" subscription product ($19/month) in Stripe
 * and writes NEXT_PUBLIC_STRIPE_PRICE_ID to .env.production.
 *
 * Usage:
 *   node --env-file=.env.local scripts/create-stripe-pro-plan.mjs
 *   npm run stripe:create-pro-plan
 */

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Stripe from 'stripe';

const ENV_PRODUCTION_PATH = resolve(process.cwd(), '.env.production');
const PRICE_ENV_KEY = 'NEXT_PUBLIC_STRIPE_PRICE_ID';

function upsertEnvVar(filePath, key, value) {
  const line = `${key}=${value}`;

  if (!existsSync(filePath)) {
    writeFileSync(filePath, `${line}\n`, 'utf8');
    return 'created';
  }

  const current = readFileSync(filePath, 'utf8');
  const pattern = new RegExp(`^${key}=.*$`, 'm');

  if (pattern.test(current)) {
    writeFileSync(filePath, current.replace(pattern, line), 'utf8');
    return 'updated';
  }

  const suffix = current.endsWith('\n') || current.length === 0 ? '' : '\n';
  appendFileSync(filePath, `${suffix}${line}\n`, 'utf8');
  return 'appended';
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || secretKey.includes('...')) {
    throw new Error(
      'Missing a real STRIPE_SECRET_KEY. Set it in .env.local, then re-run.',
    );
  }

  const stripe = new Stripe(secretKey);

  const product = await stripe.products.create({
    name: 'Pro Plan',
    description: 'Pro subscription plan billed monthly.',
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 1900,
    currency: 'usd',
    recurring: { interval: 'month' },
  });

  const action = upsertEnvVar(ENV_PRODUCTION_PATH, PRICE_ENV_KEY, price.id);

  console.log('Created Stripe product and price:');
  console.log(`  PRODUCT_ID: ${product.id}`);
  console.log(`  PRICE_ID:   ${price.id}`);
  console.log(
    `${action === 'created' ? 'Created' : action === 'updated' ? 'Updated' : 'Appended'} ${PRICE_ENV_KEY} in .env.production`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
