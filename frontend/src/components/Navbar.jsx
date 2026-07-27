import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

const navLinks = [
  { href: "#home", id: "home", label: "Home" },
  { href: "#about", id: "about", label: "About" },
  { href: "#early-access", id: "early-access", label: "Early Access" },
  { href: "#faq", id: "faq", label: "FAQ" },
];

function scrollToHash(hash) {
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const onHome = location.pathname === "/";
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return undefined;

    const ids = navLinks.map((l) => l.id);
    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.08, 0.2, 0.4] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [onHome, location.hash]);

  const handleNav = (e, href) => {
    e.preventDefault();
    setDrawerOpen(false);
    const id = href.replace("#", "");
    setActiveId(id);
    if (onHome) {
      scrollToHash(href);
      window.history.replaceState(null, "", href);
    } else {
      window.location.href = `/${href}`;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-[background,border-color,box-shadow] duration-[var(--pa-duration)] ease-[var(--pa-ease)] ${
        scrolled
          ? "bg-[rgba(238,244,240,0.9)] border-b border-[var(--pa-border)] shadow-[var(--pa-shadow-sm)] backdrop-blur-xl"
          : "bg-[rgba(238,244,240,0.72)] border-b border-transparent backdrop-blur-lg"
      }`}
      data-testid="main-navbar"
    >
      <div className="apple-page h-14 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 min-w-0 shrink"
          data-testid="nav-logo"
          onClick={(e) => {
            if (onHome) {
              e.preventDefault();
              scrollToHash("#home");
              setActiveId("home");
              window.history.replaceState(null, "", "#home");
            }
          }}
        >
          <span className="font-semibold tracking-tight text-[15px] text-[var(--pa-ink)] truncate">
            PrepAlign
          </span>
        </Link>

        {/* Soft pill tray for desktop links */}
        <nav
          className="hidden md:flex items-center p-1 rounded-full border border-[var(--pa-border)] bg-[var(--pa-panel)]/70 shadow-[var(--pa-shadow-sm)]"
          aria-label="Primary"
        >
          {navLinks.map((l) => {
            const active = onHome && activeId === l.id;
            return (
              <a
                key={l.href}
                href={onHome ? l.href : `/${l.href}`}
                onClick={(e) => handleNav(e, l.href)}
                className={`relative px-3.5 lg:px-4 py-1.5 text-[13px] font-medium tracking-tight rounded-full transition-colors duration-[var(--pa-duration)] ${
                  active
                    ? "text-[var(--pa-ink)]"
                    : "text-[var(--pa-muted)] hover:text-[var(--pa-ink-soft)]"
                }`}
                aria-current={active ? "true" : undefined}
                data-testid={`nav-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {active && !reduce && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-[var(--pa-surface-2)] border border-[var(--pa-border)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {active && reduce && (
                  <span className="absolute inset-0 rounded-full bg-[var(--pa-surface-2)] border border-[var(--pa-border)]" />
                )}
                <span className="relative z-[1]">{l.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a
            href={onHome ? "#waitlist" : "/#waitlist"}
            onClick={(e) => handleNav(e, "#waitlist")}
            className="group inline-flex items-center gap-1.5 rounded-full bg-pa-brand text-pa-on-brand pl-3.5 pr-3 py-1.5 text-[13px] font-semibold tracking-tight transition-[box-shadow,transform] duration-[var(--pa-duration)] ease-[var(--pa-ease)] hover:shadow-[var(--pa-shadow-brand)] hover:-translate-y-px active:translate-y-0"
            data-testid="nav-waitlist-btn"
          >
            Join Waitlist
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-[var(--pa-duration)] group-hover:translate-x-0.5"
              strokeWidth={2.25}
            />
          </a>
        </div>

        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <button
              className="md:hidden p-2 -mr-1 min-h-11 min-w-11 inline-flex items-center justify-center rounded-full border border-[var(--pa-border)] bg-[var(--pa-panel)]/80"
              aria-label="Open menu"
              data-testid="nav-mobile-toggle"
            >
              <Menu className="pa-icon text-[var(--pa-ink)]" strokeWidth={1.75} />
            </button>
          </DrawerTrigger>
          <DrawerContent className="md:hidden" data-testid="nav-mobile-menu">
            <DrawerHeader>
              <DrawerTitle className="text-left font-semibold tracking-tight text-[var(--pa-ink)]">
                PrepAlign
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8 flex flex-col gap-1">
              {navLinks.map((l) => {
                const active = onHome && activeId === l.id;
                return (
                  <DrawerClose asChild key={l.href}>
                    <a
                      href={onHome ? l.href : `/${l.href}`}
                      onClick={(e) => handleNav(e, l.href)}
                      className={`rounded-[var(--pa-r-lg)] px-3 py-3 text-base font-medium min-h-11 transition-colors ${
                        active
                          ? "bg-[var(--pa-surface-2)] text-[var(--pa-ink)] border border-[var(--pa-border)]"
                          : "text-[var(--pa-ink)] hover:bg-[var(--pa-surface)]"
                      }`}
                    >
                      {l.label}
                    </a>
                  </DrawerClose>
                );
              })}
              <div className="mt-4">
                <DrawerClose asChild>
                  <a
                    href={onHome ? "#waitlist" : "/#waitlist"}
                    onClick={(e) => handleNav(e, "#waitlist")}
                    className="apple-btn apple-btn-whatsapp w-full justify-center"
                    data-testid="nav-mobile-waitlist"
                  >
                    Join Waitlist <ArrowRight className="pa-icon" strokeWidth={1.75} />
                  </a>
                </DrawerClose>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </header>
  );
}
