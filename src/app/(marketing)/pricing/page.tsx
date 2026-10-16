import type { Metadata } from 'next';
import { PricingTable } from '@/components/marketing/PricingTable';

export const metadata: Metadata = {
  title: 'Pricing',
};

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-muted">
          Start free. Upgrade when you need more power.
        </p>
      </div>
      <div className="mt-12">
        <PricingTable />
      </div>
    </section>
  );
}
