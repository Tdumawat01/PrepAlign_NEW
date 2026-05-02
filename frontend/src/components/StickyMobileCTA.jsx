import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Ticket } from "lucide-react";
import { WHATSAPP_URL } from "../lib/constants";

export default function StickyMobileCTA() {
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 grid grid-cols-2 border-t border-neutral-200 bg-white"
      data-testid="sticky-mobile-cta"
    >
      <Link
        to="/webinar"
        className="flex items-center justify-center gap-2 bg-neutral-950 text-white py-3.5 text-sm font-bold"
        data-testid="sticky-webinar-btn"
      >
        <Ticket className="w-4 h-4" /> Join Webinar
      </Link>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[#25D366] text-black py-3.5 text-sm font-bold"
        data-testid="sticky-whatsapp-btn"
      >
        <MessageCircle className="w-4 h-4" /> WhatsApp
      </a>
    </div>
  );
}
