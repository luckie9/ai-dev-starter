/**
 * Creates a new $29/month price on the existing "Pro Plan" product (or creates
 * the product if missing), then writes NEXT_PUBLIC_STRIPE_PRICE_ID to
 * .env.local and .env.production.
 *
 * Usage:
 *   node --env-file=.env.local scripts/update-stripe-pro-price.mjs
 *   npm run stripe:update-pro-price
 */

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Stripe from 'stripe';

const PRICE_ENV_KEY = 'NEXT_PUBLIC_STRIPE_PRICE_ID';
const UNIT_AMOUNT = 2900;
const PRODUCT_NAME = 'Pro Plan';
const ENV_FILES = [
  resolve(process.cwd(), '.env.local'),
  resolve(process.cwd(), '.env.production'),
];

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

async function findOrCreateProProduct(stripe) {
  const existingPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID?.trim();

  if (existingPriceId && existingPriceId.startsWith('price_')) {
    try {
      const existingPrice = await stripe.prices.retrieve(existingPriceId);
      const productId =
        typeof existingPrice.product === 'string'
          ? existingPrice.product
          : existingPrice.product.id;
      const product = await stripe.products.retrieve(productId);
      return product;
    } catch {
      // fall through to search/create
    }
  }

  const listed = await stripe.products.list({ limit: 100, active: true });
  const match = listed.data.find((product) => product.name === PRODUCT_NAME);
  if (match) return match;

  return stripe.products.create({
    name: PRODUCT_NAME,
    description: 'Pro subscription plan billed monthly.',
  });
}

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('...')) {
    throw new Error(
      'Missing a real STRIPE_SECRET_KEY. Set it in .env.local, then re-run.',
    );
  }

  const stripe = new Stripe(secretKey);
  const product = await findOrCreateProProduct(stripe);

  // Archive prior default prices on this product so $29 becomes the active offer.
  const priorPrices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: UNIT_AMOUNT,
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Pro Plan $29/mo',
  });

  await stripe.products.update(product.id, {
    default_price: price.id,
    name: PRODUCT_NAME,
    description: 'Pro subscription plan billed monthly at $29.',
  });

  for (const prior of priorPrices.data) {
    if (prior.id !== price.id && prior.unit_amount !== UNIT_AMOUNT) {
      await stripe.prices.update(prior.id, { active: false });
    }
  }

  for (const envPath of ENV_FILES) {
    const action = upsertEnvVar(envPath, PRICE_ENV_KEY, price.id);
    console.log(
      `${action === 'created' ? 'Created' : action === 'updated' ? 'Updated' : 'Appended'} ${PRICE_ENV_KEY} in ${envPath}`,
    );
  }

  console.log('Created $29/month Pro Plan price:');
  console.log(`  PRODUCT_ID: ${product.id}`);
  console.log(`  PRICE_ID:   ${price.id}`);
  console.log(`  AMOUNT:     $29.00 / month`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
