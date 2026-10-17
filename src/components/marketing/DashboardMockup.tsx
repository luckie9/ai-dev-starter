'use client';

import { useEffect, useReducer, useRef } from 'react';

type TabId = 'overview' | 'billing' | 'customers' | 'settings';
type Preview = 'none' | 'mrr' | 'activity';

type DemoState = {
  tab: TabId;
  preview: Preview;
  clicking: boolean;
  pulse: 'none' | TabId | 'mrr' | 'activity';
  cursor: { x: number; y: number };
  reduceMotion: boolean;
};

type Sample = Omit<DemoState, 'reduceMotion'>;

type DemoAction =
  | { type: 'tick'; sample: Sample }
  | { type: 'reduce-motion'; enabled: boolean };

const LOOP_MS = 8000;

/** Waypoints + interaction cues for one 8s loop. */
const WAYPOINTS: Array<{
  t: number;
  x: number;
  y: number;
  tab?: TabId;
  preview?: Preview;
  pulse?: DemoState['pulse'];
  click?: boolean;
}> = [
  { t: 0.0, x: 14, y: 42 },
  { t: 0.1, x: 9, y: 34, tab: 'overview' },
  { t: 0.14, x: 9, y: 34, tab: 'billing', pulse: 'billing', click: true },
  { t: 0.2, x: 9, y: 34, tab: 'billing', preview: 'none', pulse: 'none' },
  { t: 0.28, x: 9, y: 52 },
  { t: 0.32, x: 9, y: 52, tab: 'settings', pulse: 'settings', click: true },
  { t: 0.38, x: 9, y: 52, tab: 'settings', pulse: 'none' },
  { t: 0.46, x: 9, y: 28 },
  { t: 0.5, x: 9, y: 28, tab: 'overview', pulse: 'overview', click: true },
  { t: 0.56, x: 9, y: 28, tab: 'overview', pulse: 'none' },
  { t: 0.62, x: 42, y: 30 },
  { t: 0.66, x: 42, y: 30, preview: 'mrr', pulse: 'mrr', click: true },
  { t: 0.74, x: 42, y: 30, preview: 'mrr', pulse: 'none' },
  { t: 0.78, x: 54, y: 78, preview: 'none' },
  { t: 0.82, x: 54, y: 78, preview: 'activity', pulse: 'activity', click: true },
  { t: 0.9, x: 54, y: 78, preview: 'activity', pulse: 'none' },
  { t: 0.96, x: 30, y: 55, preview: 'none' },
  { t: 1.0, x: 14, y: 42, preview: 'none', pulse: 'none' },
];

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'billing', label: 'Billing' },
  { id: 'customers', label: 'Customers' },
  { id: 'settings', label: 'Settings' },
];

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

function sampleAt(phase: number): Sample {
  let tab: TabId = 'overview';
  let preview: Preview = 'none';
  let pulse: DemoState['pulse'] = 'none';

  for (const point of WAYPOINTS) {
    if (point.t <= phase) {
      if (point.tab) tab = point.tab;
      if (point.preview !== undefined) preview = point.preview;
      if (point.pulse !== undefined) pulse = point.pulse;
    }
  }

  let clicking = false;
  for (const point of WAYPOINTS) {
    if (
      point.click &&
      phase >= point.t &&
      phase < point.t + 0.03
    ) {
      clicking = true;
      if (point.pulse) pulse = point.pulse;
    }
  }

  let i = 0;
  while (i < WAYPOINTS.length - 1 && WAYPOINTS[i + 1].t < phase) i += 1;
  const a = WAYPOINTS[i];
  const b = WAYPOINTS[Math.min(i + 1, WAYPOINTS.length - 1)];
  const span = Math.max(b.t - a.t, 0.0001);
  const local = easeInOut(Math.min(Math.max((phase - a.t) / span, 0), 1));

  return {
    cursor: {
      x: a.x + (b.x - a.x) * local,
      y: a.y + (b.y - a.y) * local,
    },
    tab,
    preview,
    pulse,
    clicking,
  };
}

function demoReducer(state: DemoState, action: DemoAction): DemoState {
  if (action.type === 'reduce-motion') {
    return { ...state, reduceMotion: action.enabled };
  }
  return { ...state, ...action.sample };
}

const initialState: DemoState = {
  ...sampleAt(0),
  reduceMotion: false,
};

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

function OverviewPanel({
  pulse,
  preview,
}: {
  pulse: DemoState['pulse'];
  preview: Preview;
}) {
  return (
    <>
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
            id: 'mrr' as const,
            label: 'MRR',
            value: '$12.4k',
            tone: 'text-sky-300',
          },
          {
            id: 'active' as const,
            label: 'Active',
            value: '482',
            tone: 'text-white',
          },
          {
            id: 'churn' as const,
            label: 'Churn',
            value: '1.8%',
            tone: 'text-emerald-300',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={[
              'relative rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition duration-200 sm:p-3',
              pulse === 'mrr' && stat.id === 'mrr'
                ? 'scale-[1.03] border-sky-400/50 shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_8px_24px_rgba(14,165,233,0.2)]'
                : '',
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

            {stat.id === 'mrr' && preview === 'mrr' && (
              <div className="absolute left-1/2 top-[calc(100%+6px)] z-10 w-40 -translate-x-1/2 rounded-lg border border-sky-400/30 bg-slate-900/95 p-2.5 shadow-xl shadow-sky-950/40 backdrop-blur">
                <p className="text-[10px] font-medium text-sky-300">
                  MRR breakdown
                </p>
                <div className="mt-1.5 space-y-1 text-[10px] text-slate-300">
                  <div className="flex justify-between gap-3">
                    <span>Pro Plan</span>
                    <span>$29 × 318</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Annual</span>
                    <span>$3.2k</span>
                  </div>
                </div>
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-sky-400/30 bg-slate-900" />
              </div>
            )}
          </div>
        ))}
      </div>

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

      <div className="mt-3 space-y-2 sm:mt-4">
        {[
          {
            id: 'checkout' as const,
            title: 'Checkout completed',
            meta: 'Pro Plan · $29/mo',
            status: 'Synced',
          },
          {
            id: 'webhook' as const,
            title: 'Webhook delivered',
            meta: 'checkout.session.completed',
            status: '200 OK',
          },
        ].map((row) => (
          <div
            key={row.title}
            className={[
              'relative flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 transition duration-200',
              pulse === 'activity' && row.id === 'checkout'
                ? 'scale-[1.02] border-sky-400/45 shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_6px_18px_rgba(14,165,233,0.18)]'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium text-slate-200">
                {row.title}
              </p>
              <p className="truncate text-[10px] text-slate-500">{row.meta}</p>
            </div>
            <span className="shrink-0 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300">
              {row.status}
            </span>

            {row.id === 'checkout' && preview === 'activity' && (
              <div className="absolute bottom-[calc(100%+8px)] left-0 z-10 w-52 rounded-lg border border-sky-400/30 bg-slate-900/95 p-2.5 shadow-xl shadow-sky-950/40 backdrop-blur">
                <p className="text-[10px] font-medium text-sky-300">
                  Checkout preview
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-300">
                  Customer upgraded to Pro. Subscription{' '}
                  <span className="text-white">trialing → active</span> synced
                  to Supabase.
                </p>
                <div className="absolute -bottom-1 left-6 h-2 w-2 rotate-45 border-b border-r border-sky-400/30 bg-slate-900" />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function BillingPanel() {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
          Billing
        </p>
        <h2 className="text-sm font-semibold text-white sm:text-base">
          Pro Plan · $29/mo
        </h2>
      </div>
      <div className="rounded-xl border border-sky-400/30 bg-sky-500/10 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium text-sky-200">Current plan</p>
            <p className="text-[10px] text-slate-400">Renews Oct 20, 2026</p>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            Active
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { label: 'Stripe price', value: 'price_…828JMG' },
          { label: 'Payment method', value: 'Visa ···· 4242' },
          { label: 'Next invoice', value: '$29.00' },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
          >
            <span className="text-[10px] text-slate-400">{row.label}</span>
            <span className="text-[11px] font-medium text-slate-200">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
          Settings
        </p>
        <h2 className="text-sm font-semibold text-white sm:text-base">
          Workspace preferences
        </h2>
      </div>
      {[
        { label: 'Team name', value: 'AI Dev Starter' },
        { label: 'Webhook endpoint', value: '/api/webhooks/stripe' },
        { label: 'Env', value: 'Production' },
      ].map((row) => (
        <div
          key={row.label}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
        >
          <p className="text-[10px] text-slate-500">{row.label}</p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-200">
            {row.value}
          </p>
        </div>
      ))}
      <div className="rounded-lg border border-dashed border-white/15 px-2.5 py-3 text-center text-[10px] text-slate-500">
        Notifications · API keys · Members
      </div>
    </div>
  );
}

function CustomersPanel() {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
          Customers
        </p>
        <h2 className="text-sm font-semibold text-white sm:text-base">
          Latest signups
        </h2>
      </div>
      {['Nora Chen', 'Sam Rivera', 'Alex Kim'].map((name, index) => (
        <div
          key={name}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-semibold text-sky-200">
              {name
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </div>
            <span className="text-[11px] text-slate-200">{name}</span>
          </div>
          <span className="text-[10px] text-slate-500">
            {index === 0 ? '2m ago' : `${index + 1}h ago`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DashboardMockup() {
  const [state, dispatch] = useReducer(demoReducer, initialState);
  const startRef = useRef<number | null>(null);
  const lastSampleRef = useRef<Sample | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () =>
      dispatch({ type: 'reduce-motion', enabled: media.matches });
    syncMotion();
    media.addEventListener('change', syncMotion);

    if (media.matches) {
      return () => media.removeEventListener('change', syncMotion);
    }

    let frame = 0;
    const tick = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const phase = ((now - startRef.current) % LOOP_MS) / LOOP_MS;
      const sample = sampleAt(phase);
      const prev = lastSampleRef.current;
      const moved =
        !prev ||
        Math.abs(prev.cursor.x - sample.cursor.x) > 0.25 ||
        Math.abs(prev.cursor.y - sample.cursor.y) > 0.25 ||
        prev.tab !== sample.tab ||
        prev.preview !== sample.preview ||
        prev.pulse !== sample.pulse ||
        prev.clicking !== sample.clicking;

      if (moved) {
        lastSampleRef.current = sample;
        dispatch({ type: 'tick', sample });
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => {
      media.removeEventListener('change', syncMotion);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-400/30 via-cyan-200/20 to-slate-300/40 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-2xl shadow-sky-900/10 ring-1 ring-black/5">
        <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/90 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
          <div className="ml-3 flex-1 rounded-md bg-white/5 px-3 py-1 text-[11px] text-slate-400">
            app.ai-dev-starter.dev/{state.tab}
          </div>
        </div>

        <div className="grid min-h-[280px] grid-cols-[72px_1fr] sm:min-h-[320px] sm:grid-cols-[148px_1fr]">
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
              {TABS.map((item) => {
                const active = state.tab === item.id;
                const pulsed = state.pulse === item.id;
                return (
                  <div
                    key={item.id}
                    className={[
                      'rounded-lg px-2.5 py-2 text-[11px] transition duration-200 sm:text-xs',
                      active
                        ? 'bg-sky-500/20 font-medium text-sky-200'
                        : 'text-slate-400',
                      pulsed
                        ? 'scale-[1.04] bg-sky-500/25 shadow-[0_0_0_1px_rgba(56,189,248,0.55),0_0_18px_rgba(56,189,248,0.25)]'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="sm:hidden">{item.label.slice(0, 1)}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </aside>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-3 sm:p-5">
            <div key={state.tab} className="hero-panel-fade">
              {state.tab === 'overview' && (
                <OverviewPanel pulse={state.pulse} preview={state.preview} />
              )}
              {state.tab === 'billing' && <BillingPanel />}
              {state.tab === 'settings' && <SettingsPanel />}
              {state.tab === 'customers' && <CustomersPanel />}
            </div>
          </div>
        </div>

        {!state.reduceMotion && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20"
          >
            <div
              className="absolute will-change-transform"
              style={{
                left: `${state.cursor.x}%`,
                top: `${state.cursor.y}%`,
                transform: `translate(-10%, -10%) scale(${state.clicking ? 0.86 : 1})`,
              }}
            >
              <div className="relative">
                {state.clicking && (
                  <span className="absolute -left-2 -top-2 h-6 w-6 animate-ping rounded-full border border-sky-300/60 bg-sky-400/20" />
                )}
                <CursorIcon />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .hero-panel-fade {
          animation: hero-panel-in 280ms ease-out;
        }
        @keyframes hero-panel-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-panel-fade { animation: none; }
        }
      `}</style>
    </div>
  );
}
