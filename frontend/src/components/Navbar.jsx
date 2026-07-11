import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, MessageCircle, ChevronDown, UserRound, LayoutDashboard, LogOut } from "lucide-react";
import { WHATSAPP_URL } from "../lib/constants";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/career-gps", label: "Career GPS" },
  { to: "/webinar", label: "Webinar" },
  { to: "/jobs", label: "Jobs" },
  { to: "/mentorship", label: "Mentorship" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [userMenuOpen]);

  const initials = (user?.name || user?.email || "U")
    .split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join("");

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
                `nav-underline text-sm font-semibold tracking-tight ${
                  isActive ? "is-active text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
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
            <div className="relative ml-2" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 border border-neutral-200 hover:border-neutral-950 px-2.5 py-1.5 text-sm font-bold transition-colors"
                data-testid="nav-user-menu-btn"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <span className="w-6 h-6 bg-neutral-950 text-white text-[10px] font-black flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden lg:inline max-w-[120px] truncate">
                  {user.name?.split(" ")[0] || user.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {userMenuOpen ? (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border-2 border-neutral-950 hard-shadow-sm py-1 z-50"
                  data-testid="nav-user-menu"
                  role="menu"
                >
                  <div className="px-4 py-2.5 border-b border-neutral-200">
                    <p className="text-sm font-bold tracking-tight truncate">{user.name || "—"}</p>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50"
                    data-testid="nav-menu-profile"
                    role="menuitem"
                  >
                    <UserRound className="w-4 h-4" /> Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-50"
                    data-testid="nav-menu-dashboard"
                    role="menuitem"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950"
                    data-testid="nav-menu-logout"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              ) : null}
            </div>
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
            {user ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="text-base font-semibold" data-testid="nav-mobile-profile">
                  Profile
                </Link>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-base font-semibold" data-testid="nav-mobile-dashboard">
                  Dashboard
                </Link>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="text-base font-semibold text-neutral-500 text-left"
                  data-testid="nav-mobile-auth"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-base font-semibold text-neutral-500" data-testid="nav-mobile-auth">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
