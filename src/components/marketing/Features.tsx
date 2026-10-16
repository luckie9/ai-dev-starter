const features = [
  {
    title: 'Supabase Auth',
    description:
      'Email/password auth with session refresh middleware and RLS-backed profiles.',
  },
  {
    title: 'Stripe Billing',
    description:
      'Webhook-synced subscriptions so your database stays in lockstep with Stripe.',
  },
  {
    title: 'App Router Ready',
    description:
      'Route groups for marketing, auth, and dashboard — Server Components by default.',
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Everything you need to launch
        </h2>
        <p className="mt-3 text-muted">
          Opinionated defaults for auth, payments, and a clean TypeScript codebase.
        </p>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title}>
            <h3 className="text-lg font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
