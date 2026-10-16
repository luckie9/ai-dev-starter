# AI Dev Starter

Next.js 16 App Router boilerplate with Supabase Auth, PostgreSQL (RLS), and Stripe billing.

## Stack

- **Next.js 16** (App Router, Server Components)
- **Supabase** (Auth + Postgres + RLS)
- **Stripe** (Checkout subscriptions + webhooks)
- **Tailwind CSS 4**
- **TypeScript** (strict)

## Getting started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env.local
```

Fill in your Supabase and Stripe keys.

3. **Apply the database schema**

Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor (or via the Supabase CLI).

4. **Start the dev server**

```bash
npm run dev
```

5. **Forward Stripe webhooks** (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Login & register
│   ├── (dashboard)/     # Authenticated app shell
│   ├── (marketing)/     # Landing & pricing
│   └── api/webhooks/stripe/
├── components/
│   ├── ui/
│   ├── marketing/
│   └── dashboard/
├── lib/
│   ├── supabase/
│   ├── stripe.ts
│   └── utils.ts
└── middleware.ts
```

## Notes

- Auth gating lives in `src/middleware.ts` + `src/lib/supabase/middleware.ts`.
- Stripe webhook writes use the Supabase **service role** key (bypasses RLS).
- Attach `supabase_user_id` in Checkout Session `client_reference_id` or `metadata` so subscriptions map to users.
