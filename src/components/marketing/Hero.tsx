import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-slate-50 via-white to-sky-100">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            Next.js · Supabase · Stripe
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Ship your SaaS faster with a production-ready starter
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Auth, billing, and dashboard scaffolding out of the box — so you can
            focus on the product, not the plumbing.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">Get started</Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="secondary">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-[4/3] rounded-2xl border border-border bg-gradient-to-br from-sky-500/20 via-white to-slate-200 shadow-inner" />
          <div className="absolute inset-6 rounded-xl border border-white/60 bg-white/70 p-6 backdrop-blur">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-4 space-y-2">
              <div className="h-2 w-full rounded bg-slate-100" />
              <div className="h-2 w-5/6 rounded bg-slate-100" />
              <div className="h-2 w-4/6 rounded bg-slate-100" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="h-16 rounded-lg bg-sky-100" />
              <div className="h-16 rounded-lg bg-slate-100" />
              <div className="h-16 rounded-lg bg-emerald-100" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
