// Phase 10 Milestone 5. Draft content -- see privacy/page.tsx's own note;
// the same "not a substitute for legal review" caveat applies here.
export default function TermsOfServicePage(): React.ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 rounded-lg border border-border bg-surface-elevated p-4 text-sm text-text-secondary">
        <strong className="text-text-primary">Draft — not yet legally reviewed.</strong> This page
        has not been reviewed by counsel and should not be treated as a final, binding agreement.
      </div>

      <h1 className="mb-6 text-2xl font-semibold text-text-primary">Terms of Service</h1>

      <div className="flex flex-col gap-6 text-sm text-text-secondary">
        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">The service</h2>
          <p>
            ViralScopes provides content-intelligence tooling — trend discovery, watchlists, alerts,
            and AI-assisted analysis — for creators, agencies, and media teams. Features available
            to your account depend on your subscription plan.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Your account</h2>
          <p>
            You&apos;re responsible for keeping your account credentials confidential and for all
            activity under your account. Notify us immediately if you suspect unauthorised access.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Acceptable use</h2>
          <p>
            Don&apos;t use the service to violate applicable law, infringe third-party rights, or
            attempt to circumvent rate limits, quotas, or access controls.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Billing</h2>
          <p>
            Paid plans are billed in advance on a recurring basis via our payment processor.
            Cancelling stops future billing; access continues until the end of the current billing
            period.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Termination</h2>
          <p>
            You may delete your account at any time from Settings. We may suspend or terminate
            accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Disclaimer</h2>
          <p>
            The service is provided &quot;as is&quot;, without warranties of any kind, to the
            fullest extent permitted by law.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-medium text-text-primary">Contact</h2>
          <p>
            Questions about these terms can be sent to{' '}
            <a href="mailto:legal@viralscopes.io" className="text-text-link hover:underline">
              legal@viralscopes.io
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
