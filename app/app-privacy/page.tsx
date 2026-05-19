export default function AppPrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-slate-900">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-primary">App Privacy Policy</p>
          <h1 className="text-4xl font-semibold">How we protect your app data</h1>
          <p className="text-base text-slate-600">
            hulucars app privacy is designed to protect your information while delivering seamless mobile and desktop experiences. This policy explains the app-specific data practices and controls available to you.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">1. Data collected by the app</h2>
            <p className="mt-3 text-slate-600">When you use the hulucars app, we may collect:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>Account information provided at signup, including name, email, and phone number.</li>
              <li>Device identifiers, operating system details, and app version.</li>
              <li>Usage data such as features used, pages visited, and search queries.</li>
              <li>Location information only if you grant permission and use location-based features.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">2. Purpose of app data processing</h2>
            <p className="mt-3 text-slate-600">The app data is used to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>Provide personalized recommendations and saved favorites.</li>
              <li>Enable push notifications for updates, alerts, and offers.</li>
              <li>Improve app performance and troubleshoot technical issues.</li>
              <li>Support location-based services such as nearby listings and test drive scheduling.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">3. Permissions and controls</h2>
            <p className="mt-3 text-slate-600">You decide which app permissions to allow. Common permissions include:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>Location access for nearby search results and booking convenience.</li>
              <li>Notifications for reminders and service updates.</li>
              <li>Storage access only when you explicitly upload files or images.</li>
            </ul>
            <p className="mt-3 text-slate-600">If you deny permissions, the app will still work, but some features may be limited.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">4. Third-party services</h2>
            <p className="mt-3 text-slate-600">We may use third-party services for analytics, crash reporting, and push notifications. Those providers may process device and usage data under strict confidentiality agreements.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">5. Security and retention</h2>
            <p className="mt-3 text-slate-600">We use encryption and technical safeguards to protect app data in transit and at rest. Data is stored only as long as needed to support your account and comply with legal obligations.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">6. Your rights and choices</h2>
            <p className="mt-3 text-slate-600">You can access and update your app profile, manage permissions through your device settings, and request deletion of your account data at any time.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">7. Contact us</h2>
            <p className="mt-3 text-slate-600">For questions about app privacy, please email <strong>info@hulucars.com</strong> and include "App Privacy" in the subject line.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
