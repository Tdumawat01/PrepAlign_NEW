import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StickyMobileCTA from "./StickyMobileCTA";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-950">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
