import Link from 'next/link';

// Phase 10 Milestone 5. Draft content, not a substitute for actual legal
// review -- an AI coding assistant cannot provide the legal review
// Security_Architecture.md §19's "Privacy policy | Legally reviewed" row
// calls for, so this is explicitly, visibly marked as a draft rather than
// silently presented as finished. See PROJECT_STATUS.md for this
// deliberately deferred item.
export default function PrivacyPolicyPage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 rounded-lg border border-border bg-surface-elevated p-4 text-sm text-text-secondary">
        <strong className="text-text-primary">Draft — not yet legally reviewed.</strong> This page
        describes ViralScopes&apos;s current data practices as implemented. It has not been reviewed
        by counsel and should not be treated as a final, binding policy.
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Privacy Policy</h1>

      <div className="flex flex-col gap-6 text-sm text-text-secondary">
        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">What we collect</h2>
          <p>
            Account information you provide directly (email, name), content you add to the service
            (watchlists, alert rules), and technical data needed to operate the service (session
            metadata such as IP address and browser, used only for account security).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Why we collect it</h2>
          <p>
            To provide the service you&apos;ve signed up for (contract) and to keep your account
            secure (legitimate interest). Data collected for content analysis is not used for
            advertising, and we do not sell personal data to anyone.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Where it&apos;s processed</h2>
          <p>
            Account data is stored in the EU. Some processing (AI-assisted content analysis, payment
            processing, email delivery) is carried out by third-party providers based in the US,
            under their own data processing agreements and standard contractual clauses.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Your rights</h2>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong className="text-text-primary">Access:</strong> download a copy of your data at
              any time from{' '}
              <Link href="/settings/profile" className="text-text-link hover:underline">
                Settings → Profile
              </Link>
              .
            </li>
            <li>
              <strong className="text-text-primary">Deletion:</strong> delete your account and
              personal data from the same page. Personal data is removed from your account
              immediately; the empty account record is fully removed within 30 days.
            </li>
            <li>
              <strong className="text-text-primary">Rectification:</strong> update your name, email,
              or other account details at any time in Settings.
            </li>
            <li>
              <strong className="text-text-primary">Portability:</strong> your data export is
              provided in machine-readable JSON format.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Cookies</h2>
          <p>
            We use two strictly necessary cookies to keep you signed in and to protect your account
            from cross-site request forgery. We record your cookie-consent choice in a third,
            functional cookie. We do not use analytics or advertising cookies today.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Contact</h2>
          <p>
            Questions about this policy or your data can be sent to{' '}
            <a href="mailto:privacy@viralscopes.io" className="text-text-link hover:underline">
              privacy@viralscopes.io
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
