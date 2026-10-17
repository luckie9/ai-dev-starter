import Link from 'next/link';
import { Button } from '@/components/ui/Button';

function CursorIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
    >
      <path
        d="M5.5 3.2 18.8 12.1c.55.37.35 1.22-.32 1.3l-5.2.62 2.2 5.7c.22.58-.35 1.12-.9.86l-2.55-1.2-2.35 2.55c-.45.5-1.28.2-1.35-.48L5.5 3.2Z"
        fill="white"
        stroke="#0f172a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-400/30 via-cyan-200/20 to-slate-300/40 blur-2xl"
      />
      <div className="hero-dashboard relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-2xl shadow-sky-900/10 ring-1 ring-black/5">
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
                { label: 'Overview', active: true, hotspot: false },
                { label: 'Billing', active: false, hotspot: true },
                { label: 'Customers', active: false, hotspot: false },
                { label: 'Settings', active: false, hotspot: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={[
                    item.active
                      ? 'rounded-lg bg-sky-500/20 px-2.5 py-2 text-[11px] font-medium text-sky-200 sm:text-xs'
                      : 'rounded-lg px-2.5 py-2 text-[11px] text-slate-400 sm:text-xs',
                    item.hotspot ? 'hero-hotspot hero-hotspot-sidebar' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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
                {
                  label: 'MRR',
                  value: '$12.4k',
                  tone: 'text-sky-300',
                  hotspot: true,
                },
                {
                  label: 'Active',
                  value: '482',
                  tone: 'text-white',
                  hotspot: false,
                },
                {
                  label: 'Churn',
                  value: '1.8%',
                  tone: 'text-emerald-300',
                  hotspot: false,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={[
                    'rounded-xl border border-white/10 bg-white/[0.04] p-2.5 sm:p-3',
                    stat.hotspot ? 'hero-hotspot hero-hotspot-revenue' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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
                  hotspot: true,
                },
                {
                  title: 'Webhook delivered',
                  meta: 'checkout.session.completed',
                  status: '200 OK',
                  hotspot: false,
                },
              ].map((row) => (
                <div
                  key={row.title}
                  className={[
                    'flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2',
                    row.hotspot ? 'hero-hotspot hero-hotspot-activity' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
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

        {/* Simulated cursor — CSS-only ~8s loop.
            Full-size layer so translate(%) is relative to the dashboard. */}
        <div
          aria-hidden
          className="hero-cursor pointer-events-none absolute inset-0 z-20"
        >
          <div className="hero-cursor-click relative w-fit">
            <span className="hero-cursor-ring absolute -left-2 -top-2 h-6 w-6 rounded-full border border-sky-300/70 bg-sky-400/20" />
            <CursorIcon />
          </div>
        </div>
      </div>

      <style>{`
        .hero-dashboard {
          --hero-loop: 8s;
        }

        .hero-cursor {
          animation: hero-cursor-travel var(--hero-loop) cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
          will-change: transform;
        }

        .hero-cursor-click {
          animation: hero-cursor-press var(--hero-loop) ease-in-out infinite;
          transform-origin: 4px 2px;
          will-change: transform;
        }

        .hero-cursor-ring {
          animation: hero-cursor-ring var(--hero-loop) ease-out infinite;
          opacity: 0;
          will-change: transform, opacity;
        }

        .hero-hotspot {
          will-change: transform, box-shadow;
        }

        .hero-hotspot-sidebar {
          animation: hero-pulse-sidebar var(--hero-loop) ease-in-out infinite;
        }

        .hero-hotspot-revenue {
          animation: hero-pulse-revenue var(--hero-loop) ease-in-out infinite;
        }

        .hero-hotspot-activity {
          animation: hero-pulse-activity var(--hero-loop) ease-in-out infinite;
        }

        /* Path: sidebar Billing → MRR card → first activity row → loop */
        @keyframes hero-cursor-travel {
          0%   { transform: translate(12%, 38%); }
          12%  { transform: translate(8%, 34%); }    /* sidebar */
          20%  { transform: translate(8%, 34%); }
          38%  { transform: translate(42%, 28%); }   /* revenue */
          48%  { transform: translate(42%, 28%); }
          68%  { transform: translate(52%, 78%); }   /* activity */
          78%  { transform: translate(52%, 78%); }
          92%  { transform: translate(30%, 55%); }
          100% { transform: translate(12%, 38%); }
        }

        @keyframes hero-cursor-press {
          0%, 12%, 20%, 38%, 48%, 68%, 78%, 100% { transform: scale(1); }
          15%, 42%, 72% { transform: scale(0.84); }
          17%, 44%, 74% { transform: scale(1.06); }
        }

        @keyframes hero-cursor-ring {
          0%, 13%, 20%, 39%, 48%, 69%, 78%, 100% {
            opacity: 0;
            transform: scale(0.35);
          }
          15%, 42%, 72% {
            opacity: 0.9;
            transform: scale(1);
          }
          18%, 45%, 75% {
            opacity: 0;
            transform: scale(1.75);
          }
        }

        @keyframes hero-pulse-sidebar {
          0%, 12%, 22%, 100% {
            transform: scale(1);
            box-shadow: none;
            background-color: transparent;
          }
          15%, 18% {
            transform: scale(1.04);
            box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.55), 0 0 18px rgba(56, 189, 248, 0.25);
            background-color: rgba(14, 165, 233, 0.22);
          }
        }

        @keyframes hero-pulse-revenue {
          0%, 38%, 50%, 100% {
            transform: scale(1);
            box-shadow: none;
            border-color: rgba(255, 255, 255, 0.1);
          }
          42%, 45% {
            transform: scale(1.03);
            box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.5), 0 8px 24px rgba(14, 165, 233, 0.2);
            border-color: rgba(56, 189, 248, 0.45);
          }
        }

        @keyframes hero-pulse-activity {
          0%, 68%, 80%, 100% {
            transform: scale(1);
            box-shadow: none;
            border-color: rgba(255, 255, 255, 0.1);
          }
          72%, 75% {
            transform: scale(1.02);
            box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.45), 0 6px 18px rgba(14, 165, 233, 0.18);
            border-color: rgba(56, 189, 248, 0.4);
          }
        }

        @media (max-width: 639px) {
          @keyframes hero-cursor-travel {
            0%   { transform: translate(10%, 40%); }
            12%  { transform: translate(6%, 36%); }
            20%  { transform: translate(6%, 36%); }
            38%  { transform: translate(38%, 30%); }
            48%  { transform: translate(38%, 30%); }
            68%  { transform: translate(48%, 80%); }
            78%  { transform: translate(48%, 80%); }
            92%  { transform: translate(28%, 58%); }
            100% { transform: translate(10%, 40%); }
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-cursor,
          .hero-cursor-click,
          .hero-cursor-ring,
          .hero-hotspot-sidebar,
          .hero-hotspot-revenue,
          .hero-hotspot-activity {
            animation: none !important;
          }
          .hero-cursor {
            display: none;
          }
        }
      `}</style>
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
