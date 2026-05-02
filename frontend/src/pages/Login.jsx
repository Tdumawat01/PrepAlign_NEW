import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowUpRight } from "lucide-react";

export default function Login() {
  const { user } = useAuth();

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div data-testid="page-login" className="mx-auto max-w-md px-5 sm:px-8 py-20 md:py-28">
      <p className="label-eyebrow mb-5">Sign in</p>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.95]">
        Welcome back.
      </h1>
      <p className="mt-4 text-neutral-600">
        Sign in to save your registrations and access mentor follow-ups.
      </p>

      {user ? (
        <div className="mt-10 border-2 border-neutral-950 p-6" data-testid="already-signed-in">
          <p className="font-semibold">Signed in as {user.name}</p>
          <p className="text-sm text-neutral-500">{user.email}</p>
          <Link to="/dashboard" className="mt-4 inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-3 font-bold">
            Go to dashboard <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <button
          onClick={handleGoogle}
          className="mt-10 w-full border-2 border-neutral-950 bg-white py-4 px-4 font-bold hover:bg-neutral-950 hover:text-white transition-colors flex items-center justify-center gap-3 hard-shadow"
          data-testid="google-signin-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M21.6 12.23c0-.79-.07-1.54-.2-2.27H12v4.3h5.42a4.63 4.63 0 0 1-2.01 3.03v2.52h3.24c1.9-1.75 2.99-4.33 2.99-7.58z"/>
            <path fill="currentColor" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.24-2.52c-.9.6-2.05.96-3.37.96-2.6 0-4.79-1.75-5.58-4.1H3.07v2.58A9.99 9.99 0 0 0 12 22z"/>
            <path fill="currentColor" d="M6.42 13.91a5.99 5.99 0 0 1 0-3.82V7.51H3.07a10 10 0 0 0 0 8.98l3.35-2.58z"/>
            <path fill="currentColor" d="M12 6.08c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.95 3.13 14.7 2.2 12 2.2A9.99 9.99 0 0 0 3.07 7.51l3.35 2.58C7.21 7.83 9.4 6.08 12 6.08z"/>
          </svg>
          Continue with Google
        </button>
      )}

      <p className="mt-6 text-xs text-neutral-500">
        By continuing, you agree to our <Link to="/terms" className="underline">Terms</Link> and{" "}
        <Link to="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
