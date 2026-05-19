export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-slate-900">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-primary">Privacy Policy</p>
          <h1 className="text-4xl font-semibold">How hulucars protects your personal data</h1>
          <p className="text-base text-slate-600">
            At hulucars, we design every feature around trust and transparency. This Privacy Policy explains what information we collect, how we use it, and what rights you have.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 p-8">
          <div>
            <h2 className="text-2xl font-semibold">1. Information we gather</h2>
            <p className="mt-3 text-slate-600">When you register, save a favourite, request a test drive, or contact support, we may collect:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>Name, email address, phone number, and account credentials.</li>
              <li>Vehicle preferences, saved searches, and browsing history on our site.</li>
              <li>Location details only when you choose features that require them.</li>
              <li>Communications and messages submitted through forms, chat, or email.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">2. Why we use your information</h2>
            <p className="mt-3 text-slate-600">Your data is used to make hulucars work better for you:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>Deliver personalized vehicle recommendations and search results.</li>
              <li>Manage your account, bookings, and request history.</li>
              <li>Send service updates, appointment reminders, and offers you opted into.</li>
              <li>Help us maintain and improve site performance and user experience.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">3. Cookies and tracking technologies</h2>
            <p className="mt-3 text-slate-600">We use cookies, local storage, and analytics tools to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>Remember your preferences and recent searches.</li>
              <li>Understand how people interact with our site.</li>
              <li>Measure performance and identify technical issues.</li>
            </ul>
            <p className="mt-3 text-slate-600">You can manage cookie settings through your browser. Disabling non-essential cookies may affect site functionality.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">4. Data sharing and disclosure</h2>
            <p className="mt-3 text-slate-600">We do not sell your personal data. We may share it with:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>Service providers who help us operate the website and send notifications.</li>
              <li>Third-party partners when required to complete a booking or transaction.</li>
              <li>Authorities when required by law or to protect our rights and customers.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">5. Data security and retention</h2>
            <p className="mt-3 text-slate-600">We use industry-standard safeguards to protect your data. We retain information only as long as necessary to provide our services and comply with legal obligations.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">6. Your rights</h2>
            <p className="mt-3 text-slate-600">You can request access to your personal information, ask for corrections, or request deletion where applicable. To exercise these rights, contact us at info@hulucars.com.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">7. Contact information</h2>
            <p className="mt-3 text-slate-600">If you have questions about this policy or your data, please email us at <strong>info@hulucars.com</strong>.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
