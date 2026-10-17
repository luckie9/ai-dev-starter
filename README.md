# AI Dev Starter

**Next.js 16 + Supabase + Stripe SaaS boilerplate** for shipping production-ready apps fast.

Open-source starter kit with authentication, PostgreSQL Row Level Security, Stripe subscriptions, and a marketing/dashboard UI — built for founders and indie hackers launching AI/SaaS products.

> **Ship faster with Pro — $29/month**  
> Unlock Stripe Checkout wiring, webhook sync, and production billing flows used by the live demo.  
> **[View Pro pricing →](https://ai-dev-starter-seven.vercel.app/pricing)** · **[Open live sandbox →](https://ai-dev-starter-seven.vercel.app)**

**Keywords:** Next.js boilerplate, Supabase auth, Stripe subscriptions, SaaS starter, App Router, TypeScript, Tailwind CSS, freemium template.

## Why this SaaS boilerplate?

- **Next.js 16 App Router** with Server Components by default
- **Supabase Auth + Postgres RLS** for secure multi-tenant data
- **Stripe billing** ready for Checkout + webhook → subscription sync
- **Marketing + dashboard shells** so you can focus on product, not plumbing
- **TypeScript strict** + **Tailwind CSS 4**

## Live demo

Interactive sandbox (hero dashboard + auth/billing shell):  
**https://ai-dev-starter-seven.vercel.app**

## Stack

| Layer | Tech |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components) |
| Auth & DB | Supabase (Auth + PostgreSQL + RLS) |
| Payments | Stripe (Checkout subscriptions + webhooks) |
| Styling | Tailwind CSS 4 |
| Language | TypeScript (strict) |

## Getting started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env.local
```

Fill in your Supabase and Stripe keys. For Pro billing, set `NEXT_PUBLIC_STRIPE_PRICE_ID` to your `$29/month` price.

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

## Features

- Email/password auth (login + register) with session middleware
- Authenticated dashboard and settings routes
- Landing page, pricing table, and Pro plan CTA
- Stripe webhook handler that upserts subscriptions in Supabase
- SQL migration for `products`, `subscriptions`, and `users` profiles
- Launch announcement pack + weekly docs sync workflow

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

## Freemium vs Pro

| Included in free repo | Pro ($29/mo) |
| --- | --- |
| Auth, profiles, dashboard shell | Hosted sandbox + production billing path |
| Schema + RLS starter | Stripe Checkout + webhook sync to Supabase |
| Marketing/pricing UI | Priority setup for live `NEXT_PUBLIC_STRIPE_PRICE_ID` |

Upgrade: **[https://ai-dev-starter-seven.vercel.app/pricing](https://ai-dev-starter-seven.vercel.app/pricing)**

## Deploy

This repo is wired for **Vercel** production deploys from `main`.  
Production URL: https://ai-dev-starter-seven.vercel.app

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_STRIPE_PRICE_ID` in the Vercel project environment.

## Notes

- Auth gating lives in `src/middleware.ts` + `src/lib/supabase/middleware.ts`.
- Stripe webhook writes use the Supabase **secret / service role** key (bypasses RLS).
- Attach `supabase_user_id` in Checkout Session `client_reference_id` or `metadata` so subscriptions map to users.

## Topics

`nextjs` · `supabase` · `stripe` · `saas` · `boilerplate` · `typescript` · `tailwindcss` · `app-router` · `authentication` · `subscriptions`

## License

Private/source available via this repository. Track updates on GitHub: [luckie9/ai-dev-starter](https://github.com/luckie9/ai-dev-starter).
