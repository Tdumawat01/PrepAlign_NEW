import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StickyMobileCTA from "./StickyMobileCTA";
import PageTransition from "./PageTransition";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--pa-surface)] text-[var(--pa-ink)]">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
