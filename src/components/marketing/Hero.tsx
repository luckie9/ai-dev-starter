import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function DashboardMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-400/30 via-cyan-200/20 to-slate-300/40 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-2xl shadow-sky-900/10 ring-1 ring-black/5">
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/90 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-[11px] text-slate-400">
            app.ai-dev-starter.dev/dashboard
          </div>
        </div>

        <div className="grid min-h-[280px] grid-cols-[72px_1fr] sm:min-h-[320px] sm:grid-cols-[148px_1fr]">
          {/* Sidebar */}
          <aside className="border-r border-white/10 bg-slate-900/80 p-3 sm:p-4">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-[10px] font-bold text-white">
                AD
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">AI Dev</p>
                <p className="text-[10px] text-slate-400">Pro workspace</p>
              </div>
            </div>
            <nav className="space-y-1">
              {[
                { label: 'Overview', active: true },
                { label: 'Billing', active: false },
                { label: 'Customers', active: false },
                { label: 'Settings', active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={
                    item.active
                      ? 'rounded-lg bg-sky-500/20 px-2.5 py-2 text-[11px] font-medium text-sky-200 sm:text-xs'
                      : 'rounded-lg px-2.5 py-2 text-[11px] text-slate-400 sm:text-xs'
                  }
                >
                  <span className="sm:hidden">{item.label.slice(0, 1)}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main panel */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-3 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  This month
                </p>
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  Revenue overview
                </h2>
              </div>
              <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                +18.4%
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'MRR', value: '$12.4k', tone: 'text-sky-300' },
                { label: 'Active', value: '482', tone: 'text-white' },
                { label: 'Churn', value: '1.8%', tone: 'text-emerald-300' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3"
                >
                  <p className="text-[10px] text-slate-400">{stat.label}</p>
                  <p
                    className={`mt-1 text-sm font-semibold tracking-tight sm:text-lg ${stat.tone}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Chart mock */}
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:mt-4 sm:p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-medium text-slate-300">
                  Subscription growth
                </p>
                <p className="text-[10px] text-slate-500">Last 8 weeks</p>
              </div>
              <div className="flex h-20 items-end gap-1.5 sm:h-24 sm:gap-2">
                {[36, 44, 40, 58, 52, 70, 66, 84].map((height, index) => (
                  <div
                    key={index}
                    className="relative flex-1 rounded-t-md bg-gradient-to-t from-sky-600 to-cyan-300/90"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="mt-3 space-y-2 sm:mt-4">
              {[
                {
                  title: 'Checkout completed',
                  meta: 'Pro Plan · $29/mo',
                  status: 'Synced',
                },
                {
                  title: 'Webhook delivered',
                  meta: 'checkout.session.completed',
                  status: '200 OK',
                },
              ].map((row) => (
                <div
                  key={row.title}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-slate-200">
                      {row.title}
                    </p>
                    <p className="truncate text-[10px] text-slate-500">
                      {row.meta}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300">
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
