import Link from 'next/link'

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-sans bg-parchment min-h-screen">
      <Link href="/" className="text-amber hover:underline text-sm font-medium">
        ← Back to home
      </Link>
      <h1 className="font-serif text-3xl font-bold text-ink-blue mt-6 mb-2">Terms of Service</h1>
      <p className="text-ink-muted text-sm mb-10">Last updated: April 17, 2026</p>

      <div className="space-y-8 text-ink-muted leading-relaxed">
        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ThreadKey (threadkey.co), a service provided by Ashward Group LLC
            (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">2. Service Description</h2>
          <p>
            ThreadKey provides AI-powered series bible and continuity tools for fiction authors.
            The service enables users to upload manuscripts, automatically generate structured series
            bibles, query story details in natural language, and check new chapters for continuity
            errors against previously uploaded books.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">3. Subscription and Billing</h2>
          <p>
            ThreadKey is offered on a monthly subscription basis. Subscriptions renew automatically
            each month on your billing anniversary date unless cancelled. You may cancel at any time
            from your account settings page. No refunds are provided for partial billing periods.
            All fees are stated in U.S. dollars.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">4. Your Content</h2>
          <p>
            You retain full ownership of all manuscripts, story content, and documents you upload
            to ThreadKey. You grant Ashward Group LLC a limited license to store and process your
            content solely to provide the service. We do not claim ownership of your creative work.
            Your manuscripts are never shared with other users or used to train AI models.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">5. Acceptable Use</h2>
          <p>
            You may use ThreadKey only for lawful purposes. You may not upload content that infringes
            third-party copyrights, contains malware, or violates any applicable law. You are
            responsible for ensuring you have the right to upload any content you submit to the service.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">6. AI-Generated Content</h2>
          <p>
            ThreadKey uses AI technology (Anthropic Claude) to analyze manuscripts and generate
            series bible content. AI-generated summaries and continuity analysis are provided as
            tools to assist your writing process. You are responsible for reviewing all AI output
            and making your own editorial judgments.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">7. Disclaimer of Warranties</h2>
          <p>
            ThreadKey is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
            We do not warrant that the service will catch all continuity errors, be uninterrupted,
            or be error-free.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">8. Limitation of Liability</h2>
          <p>
            Ashward Group LLC shall not be liable for any indirect, incidental, consequential, or
            punitive damages arising from your use of ThreadKey. Our total liability shall not exceed
            the amount you paid in the 12 months preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of Oregon, without regard to conflict
            of law principles. Any disputes shall be resolved in the courts of Oregon.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of ThreadKey after changes
            are posted constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-ink-blue mb-2">11. Contact</h2>
          <p>
            Questions about these Terms? Contact Ashward Group LLC at{' '}
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
