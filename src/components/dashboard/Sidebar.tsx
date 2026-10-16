'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/settings', label: 'Settings' },
];

type SidebarProps = {
  email: string;
};

export function Sidebar({ email }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-4 py-5">
        <Link href="/dashboard" className="text-sm font-semibold text-foreground">
          AI Dev Starter
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-sky-50 text-accent'
                : 'text-muted hover:bg-slate-50 hover:text-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <p className="truncate text-xs text-muted">{email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start px-0"
          onClick={handleSignOut}
        >
          Sign out
        </Button>
      </div>
    </aside>
  );
}
