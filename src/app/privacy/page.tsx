import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-sans bg-parchment min-h-screen">
      <Link href="/" className="text-amber hover:underline text-sm font-medium">
        ← Back to home
      </Link>
      <h1 className="font-serif text-3xl font-bold text-ink-blue mt-6 mb-2">Privacy Policy</h1>
      <p className="text-ink-muted text-sm mb-10">Last updated: April 17, 2026</p>

      <div className="space-y-8 text-ink-muted leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">1. Introduction</h2>
          <p>
            Ashward Group LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates ThreadKey
            (threadkey.co). This Privacy Policy explains how we collect, use, and protect your
            information when you use our fiction series management service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">2. Information We Collect</h2>
          <p className="mb-3">We collect the following categories of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account information:</strong> Email address and password when you create an account.
            </li>
            <li>
              <strong>Story and manuscript content:</strong> The text of manuscripts, series details,
              character information, and any other story content you upload or enter into the service.
            </li>
            <li>
              <strong>AI analysis:</strong> Manuscript content is sent to Anthropic&apos;s Claude API
              to generate series bible entries, character profiles, and continuity analysis.
            </li>
            <li>
              <strong>Usage data:</strong> Basic activity logs to maintain service performance and security.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">3. How We Use Your Information</h2>
          <p className="mb-3">Your information is used to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and operate the ThreadKey service</li>
            <li>Generate AI-powered series bibles and continuity analysis</li>
            <li>Store and display your manuscript data and series bible</li>
            <li>Process subscription payments</li>
            <li>Send service-related communications</li>
          </ul>
          <p className="mt-3">
            We do not sell your data or use your manuscript content to train AI models.
            Your creative work is yours.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">4. Third-Party Services</h2>
          <p className="mb-3">
            We share data with the following third-party services only as necessary to operate ThreadKey:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase:</strong> Database storage and user authentication. Your manuscript data
              and account information are stored on Supabase&apos;s infrastructure with row-level security.
            </li>
            <li>
              <strong>Stripe:</strong> Payment processing. We do not store credit card numbers directly —
              all payment data is handled by Stripe.
            </li>
            <li>
              <strong>Anthropic (Claude):</strong> AI analysis of manuscript content. Text from your
              manuscripts may be sent to Anthropic&apos;s API to generate series bible entries and
              continuity analysis. Anthropic&apos;s privacy policy governs their handling of this data.
            </li>
            <li>
              <strong>OpenAI:</strong> Used for document embedding and semantic search across your
              manuscript library.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">5. Data Retention</h2>
          <p>
            Your manuscripts, series bible data, and account information are retained while your
            account is active. You may request deletion of your data at any time by contacting us.
            Upon account cancellation, your data will be deleted within 30 days unless retention
            is required by law.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">6. Data Security</h2>
          <p>
            All data is encrypted in transit using HTTPS. Data at rest is protected using
            industry-standard encryption provided by our infrastructure partners. Row-level security
            ensures your manuscript data is accessible only to your account.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">7. Your Rights</h2>
          <p>
            You may access, update, or request deletion of your personal data at any time by
            contacting us at the email below. We will respond to all requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated policy
            on this page with a revised &ldquo;Last updated&rdquo; date. Continued use of ThreadKey after
            changes are posted constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">9. Contact</h2>
          <p>
            Questions about this Privacy Policy? Contact Ashward Group LLC at{' '}
            <a href="mailto:joel@ashwardgroup.com" className="text-amber hover:underline">
              joel@ashwardgroup.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
