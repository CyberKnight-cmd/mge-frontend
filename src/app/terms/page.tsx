import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Terms of Trade' };

const LAST_UPDATED = 'June 2026';

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="bg-surface-container border border-outline-variant px-4 py-3 text-[11px] text-outline flex items-center gap-2 mt-3">
      <span className="bg-secondary-container text-on-secondary-container text-[9px] font-bold px-1.5 py-0.5">COMING SOON</span>
      {label}
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-surface pt-28 pb-20 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-3xl mx-auto">
        <p className="text-label-caps font-label-caps text-outline mb-2">LEGAL</p>
        <h1 className="text-display-sm font-display-sm text-primary mb-2">Terms of Trade</h1>
        <p className="text-body-sm text-outline mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-body-sm text-on-surface-variant leading-relaxed">

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">1. Scope & Definitions</h2>
            <p>
              These Terms of Trade (&quot;Terms&quot;) govern the use of the Mayank Global Exports platform
              (&quot;Platform&quot;) and all interactions between Mayank Global Exports (&quot;MGE&quot;,
              &quot;we&quot;, &quot;us&quot;), located in New Delhi, India, and any buyer, seller, or user
              (&quot;you&quot;, &quot;User&quot;) who accesses the Platform.
            </p>
            <p className="mt-2">
              &quot;Catalytic converter material&quot; refers to spent automotive catalytic converters,
              diesel particulate filters (DPF), and related substrates containing platinum-group metals
              (Pt, Pd, Rh).
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">2. Pricing & Terms Rate</h2>
            <p>
              All valuations displayed on the Platform are indicative and based on current LBMA spot
              prices for Platinum, Palladium, and Rhodium multiplied by the applicable &quot;Terms&quot;
              recovery rate (expressed as a percentage). The default Terms rate is 70%, but may vary
              per catalog entry at MGE&apos;s discretion.
            </p>
            <p className="mt-2">
              Published valuations do not constitute a binding offer. Final transaction prices are
              confirmed only upon physical inspection, assay verification, and mutual agreement between
              the parties.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">3. Payment Terms</h2>
            <p>
              Payment terms, settlement timelines, and accepted payment methods will be defined on a
              per-transaction basis and confirmed in writing prior to any trade.
            </p>
            <ComingSoon label="Detailed payment terms, net-day policies, and escrow options will be published here." />
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">4. Bidding & Marketplace</h2>
            <p>
              The Platform currently operates as a catalog and inquiry-based system. There is no live
              bidding, auction, or automated trading functionality at this time.
            </p>
            <ComingSoon label="Bidding and marketplace features are under development." />
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">5. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. Any
              activity under your account is your responsibility. MGE reserves the right to suspend or
              terminate accounts that violate these Terms or engage in fraudulent activity.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">6. Intellectual Property</h2>
            <p>
              All catalog data, valuations, images, and proprietary content on the Platform are the
              property of Mayank Global Exports. Reproduction, distribution, or commercial use without
              prior written consent is prohibited.
            </p>
          </section>

          <section id="liability">
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">7. Limitation of Liability</h2>
            <p>
              MGE provides catalog and pricing data on an &quot;as-is&quot; basis. We make no warranties,
              express or implied, regarding the accuracy of PPM values, weight data, or computed
              valuations. In no event shall MGE be liable for indirect, incidental, or consequential
              damages arising from the use of this Platform or reliance on its data.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">8. Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of India. Dispute resolution procedures will be
              established as the Platform&apos;s trading capabilities expand.
            </p>
            <ComingSoon label="Formal dispute resolution and jurisdiction clauses will be added here." />
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">9. Amendments</h2>
            <p>
              MGE reserves the right to update these Terms at any time. Continued use of the Platform
              after changes are posted constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">10. Contact</h2>
            <p>
              For questions regarding these Terms, visit our{' '}
              <Link href="/about#contact" className="text-primary hover:underline font-semibold">Contact page</Link>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
