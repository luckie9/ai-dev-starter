import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-sky-50 px-4">
      <Link
        href="/"
        className="mb-8 text-lg font-semibold tracking-tight text-foreground"
      >
        AI Dev Starter
      </Link>
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
