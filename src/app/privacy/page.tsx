import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Privacy Policy' };

const LAST_UPDATED = 'June 2026';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface pt-28 pb-20 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-3xl mx-auto">
        <p className="text-label-caps font-label-caps text-outline mb-2">LEGAL</p>
        <h1 className="text-display-sm font-display-sm text-primary mb-2">Privacy Policy</h1>
        <p className="text-body-sm text-outline mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-10 text-body-sm text-on-surface-variant leading-relaxed">

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">1. Who We Are</h2>
            <p>
              Mayank Global Exports (&quot;MGE&quot;, &quot;we&quot;, &quot;us&quot;) operates a B2B
              platform for catalytic converter recycling and precious metal trading, based in New Delhi,
              India. This Privacy Policy explains how we collect, use, and protect your personal
              information when you use our Platform.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">2. Information We Collect</h2>
            <p className="font-semibold text-on-surface mb-1">Account Information</p>
            <p>
              When you register or sign in (including via Google OAuth), we collect your name, email
              address, and profile picture. If you register directly, we also store a securely hashed
              password.
            </p>
            <p className="font-semibold text-on-surface mt-4 mb-1">Quote Requests</p>
            <p>
              When you submit an inquiry, we collect your full name, company name, phone number, email,
              and the details of the catalog entry you are enquiring about.
            </p>
            <p className="font-semibold text-on-surface mt-4 mb-1">Usage Data</p>
            <p>
              We automatically collect standard server logs including IP address, browser type, pages
              visited, and timestamps. We do not use third-party analytics trackers.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>To create and manage your account</li>
              <li>To process and respond to quote requests</li>
              <li>To send transactional emails related to your inquiries</li>
              <li>To improve and secure the Platform</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-2">
              We do not sell, rent, or share your personal information with third parties for marketing
              purposes.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">4. Data Storage & Security</h2>
            <p>
              Your data is stored on secured servers. Passwords are hashed using industry-standard
              algorithms. Authentication tokens (JWT) are transmitted over HTTPS and stored securely in
              the browser. We implement reasonable technical and organizational measures to protect your
              data against unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">5. Cookies & Local Storage</h2>
            <p>
              The Platform uses browser local storage to persist your authentication session. We do not
              use tracking cookies. Essential cookies may be set by the server for security purposes
              (e.g., CSRF protection).
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">6. Third-Party Services</h2>
            <p>
              We use Google OAuth for optional sign-in. When you authenticate via Google, their privacy
              policy applies to the data they process. We only receive your name, email, and profile
              picture from Google.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing where applicable</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, visit our{' '}
              <Link href="/about#contact" className="text-primary hover:underline font-semibold">Contact page</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">8. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Quote request data is
              retained for business records and legal compliance. You may request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated revision date. Continued use of the Platform constitutes acceptance of
              the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-headline-sm font-headline-sm text-on-surface mb-3">10. Contact</h2>
            <p>
              For privacy-related inquiries, visit our{' '}
              <Link href="/about#contact" className="text-primary hover:underline font-semibold">Contact page</Link>.
            </p>
          </section>

        </div>
      </div>
    </main>
  );
}
