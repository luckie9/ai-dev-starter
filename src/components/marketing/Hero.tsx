import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DashboardMockup } from '@/components/marketing/DashboardMockup';

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
        <DashboardMockup />
      </div>
    </section>
  );
}
