import Link from 'next/link';
import type { Tables } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

type SubscriptionCardProps = {
  subscription: Tables<'subscriptions'> | null;
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const isActive =
    subscription?.status === 'active' || subscription?.status === 'trialing';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>
          Your current billing status synced from Stripe.
        </CardDescription>
      </CardHeader>
      {isActive && subscription ? (
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted">Status:</span>{' '}
            <span className="font-medium capitalize text-foreground">
              {subscription.status}
            </span>
          </p>
          <p>
            <span className="text-muted">Current period ends:</span>{' '}
            <span className="font-medium text-foreground">
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          </p>
          {subscription.cancel_at_period_end && (
            <p className="text-amber-700">
              Cancels at the end of the current period.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            You don&apos;t have an active subscription yet.
          </p>
          <Link href="/pricing">
            <Button>View plans</Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
