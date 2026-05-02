import React from "react";

export default function Privacy() {
  return (
    <div data-testid="page-privacy" className="mx-auto max-w-3xl px-5 sm:px-8 py-16 md:py-24">
      <p className="label-eyebrow mb-5">Policy</p>
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">Privacy Policy</h1>
      <p className="mt-6 text-sm text-neutral-500">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8 text-neutral-700 leading-relaxed">
        <section>
          <h2 className="text-2xl font-black tracking-tight mb-3">1. What we collect</h2>
          <p>We collect only what you voluntarily submit: your name, email address, phone number, college / current status, and the role you’re interested in.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black tracking-tight mb-3">2. Why we collect it</h2>
          <p>To communicate webinar details, send mentorship follow-ups, and share relevant career resources. That’s it.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black tracking-tight mb-3">3. We do not sell your data</h2>
          <p>Your data is never sold, rented, or shared with third-party advertisers. We use trusted infrastructure providers only for delivery (email/WhatsApp).</p>
        </section>
        <section>
          <h2 className="text-2xl font-black tracking-tight mb-3">4. Opt out, anytime</h2>
          <p>Reply “STOP” on any message or email us to have your data removed from our systems within 7 days.</p>
        </section>
        <section>
          <h2 className="text-2xl font-black tracking-tight mb-3">5. Contact</h2>
          <p>For privacy-related questions, reach us at <span className="font-semibold">hello@startuppath.in</span>.</p>
        </section>
      </div>
    </div>
  );
}
