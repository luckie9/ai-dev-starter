import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/dashboard/ProfileForm';

export const metadata: Metadata = {
  title: 'Settings',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Settings
      </h1>
      <p className="mt-1 text-muted">Manage your profile and account details.</p>
      <div className="mt-8 max-w-lg">
        <ProfileForm
          profile={{
            full_name: profile?.full_name ?? '',
            email: profile?.email ?? user!.email ?? '',
          }}
        />
      </div>
    </div>
  );
}
