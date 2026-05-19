export default function AppTermsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 text-slate-900">
      <section className="space-y-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.24em] text-primary">App Terms & Conditions</p>
          <h1 className="text-4xl font-semibold">Terms for using the hulucars app</h1>
          <p className="text-base text-slate-600">
            These app-specific terms explain how you may use hulucars mobile and desktop applications, what we expect from users, and the limits of our responsibility.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">1. App eligibility and access</h2>
            <p className="mt-3 text-slate-600">The app is available to users who are at least 18 years old or of legal age in their jurisdiction. We may restrict or terminate access if you violate these terms.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">2. Account responsibility</h2>
            <p className="mt-3 text-slate-600">If you sign in to the app, you are responsible for accurate account information and protecting your login credentials. Notify us immediately if you suspect unauthorized access.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">3. App usage rules</h2>
            <p className="mt-3 text-slate-600">You agree to use the app lawfully and not to engage in prohibited behavior such as tampering, reverse engineering, or distributing malicious content.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">4. Updates and maintenance</h2>
            <p className="mt-3 text-slate-600">We may update the app regularly to add features, fix bugs, and improve security. By continuing to use the app after updates, you accept the new version and terms.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">5. Service availability</h2>
            <p className="mt-3 text-slate-600">The app may occasionally be unavailable due to maintenance, updates, or network issues. We do not guarantee uninterrupted service and are not responsible for temporary outages.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">6. Third-party integrations</h2>
            <p className="mt-3 text-slate-600">The app may integrate with third-party services such as payment processors or notification providers. Those services may have their own terms and privacy policies.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">7. Warranty disclaimer</h2>
            <p className="mt-3 text-slate-600">The app is provided "as is," without warranties. We disclaim liability for issues caused by your device, network conditions, or third-party software.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">8. Limitation of liability</h2>
            <p className="mt-3 text-slate-600">Except where prohibited by law, hulucars is not liable for indirect, incidental, or consequential damages resulting from your use of the app.</p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">9. Contact</h2>
            <p className="mt-3 text-slate-600">For questions about these app terms, email <strong>info@hulucars.com</strong>. We are here to help with any app-related concerns.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
