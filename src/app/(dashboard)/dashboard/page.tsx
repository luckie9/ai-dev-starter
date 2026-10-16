import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user!.id)
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="mt-1 text-muted">
        Here&apos;s an overview of your account.
      </p>
      <div className="mt-8">
        <SubscriptionCard subscription={subscription} />
      </div>
    </div>
  );
}
