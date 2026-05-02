import React from "react";
import { Link } from "react-router-dom";
import { WHATSAPP_URL } from "../lib/constants";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white mt-24" data-testid="site-footer">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <p className="label-eyebrow text-neutral-500 mb-6">Ready?</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
              Your first startup<br /> job is one step away.
            </h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/webinar"
                className="inline-flex items-center gap-2 bg-white text-neutral-950 px-6 py-3 font-bold hover:bg-neutral-200"
                data-testid="footer-webinar-btn"
              >
                Join Free Webinar <ArrowUpRight className="w-4 h-4" />
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-black px-6 py-3 font-bold hover:brightness-95"
                data-testid="footer-whatsapp-btn"
              >
                WhatsApp Community <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="label-eyebrow text-neutral-500 mb-4">Product</p>
              <ul className="space-y-3">
                <li><Link to="/webinar" className="hover:underline">Webinar</Link></li>
                <li><Link to="/mentorship" className="hover:underline">Mentorship</Link></li>
                <li><Link to="/about" className="hover:underline">About</Link></li>
              </ul>
            </div>
            <div>
              <p className="label-eyebrow text-neutral-500 mb-4">Legal</p>
              <ul className="space-y-3">
                <li><Link to="/privacy" className="hover:underline">Privacy</Link></li>
                <li><Link to="/terms" className="hover:underline">Terms</Link></li>
                <li><Link to="/login" className="hover:underline">Sign in</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-neutral-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} StartupPath. Built for Tier 2 & Tier 3 India.</p>
          <p>No code. Just career.</p>
        </div>
      </div>
    </footer>
  );
}
