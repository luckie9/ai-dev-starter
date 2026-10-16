import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    description: 'For exploring the boilerplate and building your MVP.',
    features: ['Auth & profiles', 'Dashboard shell', 'Community support'],
    cta: 'Start free',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For launching with Stripe subscriptions and production tooling.',
    features: [
      'Everything in Starter',
      'Stripe checkout & webhooks',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    href: '/register',
    highlighted: true,
  },
];

export function PricingTable() {
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={
            plan.highlighted
              ? 'border-accent ring-1 ring-accent'
              : undefined
          }
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {plan.price}
            <span className="text-base font-normal text-muted">/mo</span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="text-accent">✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Link href={plan.href}>
              <Button
                className="w-full"
                variant={plan.highlighted ? 'primary' : 'secondary'}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
