import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "../lib/constants";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/webinar", label: "Webinar" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white border-b border-neutral-200"
      data-testid="main-navbar"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
          <div className="w-7 h-7 bg-neutral-950 flex items-center justify-center">
            <span className="text-white text-[11px] font-black tracking-tighter">PA</span>
          </div>
          <span className="font-black tracking-tight text-lg">PrepAlign</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-semibold tracking-tight ${
                  isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
                }`
              }
              data-testid={`nav-link-${l.label.toLowerCase()}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-neutral-950 bg-white text-neutral-950 px-4 py-2 text-sm font-bold hover:bg-neutral-950 hover:text-white transition-colors"
            data-testid="nav-whatsapp-btn"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <Link
            to="/webinar"
            className="inline-flex items-center bg-neutral-950 text-white px-4 py-2 text-sm font-bold hover:bg-neutral-800"
            data-testid="nav-webinar-btn"
          >
            Reserve Your Free Spot
          </Link>
          {user ? (
            <button
              onClick={logout}
              className="text-sm font-semibold text-neutral-500 hover:text-neutral-950 ml-2"
              data-testid="nav-logout-btn"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-neutral-500 hover:text-neutral-950 ml-2"
              data-testid="nav-login-btn"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          data-testid="nav-mobile-toggle"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-200 bg-white" data-testid="nav-mobile-menu">
          <div className="px-5 py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className="text-base font-semibold"
                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
              >
                {l.label}
              </NavLink>
            ))}
            <Link
              to={user ? "#" : "/login"}
              onClick={() => { setOpen(false); if (user) logout(); }}
              className="text-base font-semibold text-neutral-500"
              data-testid="nav-mobile-auth"
            >
              {user ? "Logout" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
