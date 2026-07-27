import React from "react";

export default function Terms() {
  return (
    <div data-testid="page-terms" className="bg-[var(--pa-surface)]">
      <div className="apple-page apple-page-y text-left">
        <div className="max-w-3xl">
          <p className="apple-eyebrow mb-5">Legal</p>
          <h1 className="apple-headline">Terms & Conditions</h1>
          <p className="mt-6 pa-caption">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-10 space-y-8 pa-body">
            <section>
              <h2 className="pa-title mb-3">1. Educational platform</h2>
              <p>PrepAlign is an educational community. Content, webinars, and mentorship are provided to help you build career-ready skills.</p>
            </section>
            <section>
              <h2 className="pa-title mb-3">2. No job guarantee</h2>
              <p>We do not guarantee jobs, interviews, offers, or any specific career outcomes. Results depend on your effort, consistency, and market conditions.</p>
            </section>
            <section>
              <h2 className="pa-title mb-3">3. Community conduct</h2>
              <p>Respectful, professional behavior is required in our WhatsApp groups, meetups, and mentorship sessions. Harassment, spam, or abusive language leads to immediate removal.</p>
            </section>
            <section>
              <h2 className="pa-title mb-3">4. Payments (future scope)</h2>
              <p>Some future programs may be paid. Pricing, refunds, and cancellation policies will be clearly communicated at the point of purchase.</p>
            </section>
            <section>
              <h2 className="pa-title mb-3">5. Updates</h2>
              <p>These terms may be updated periodically. Continued use of our services indicates acceptance of the latest version.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
