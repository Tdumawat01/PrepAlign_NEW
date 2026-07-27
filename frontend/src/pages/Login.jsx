import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../components/Reveal";

export default function Login() {
  const { user } = useAuth();

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div data-testid="page-login" className="apple-band min-h-[70vh] flex items-center">
      <div className="apple-page apple-page-y w-full">
        <div className="max-w-md mx-auto w-full">
        <Reveal>
          <div className="apple-panel">
            <p className="apple-eyebrow mb-4">Sign in</p>
            <h1 className="apple-headline text-[2rem] md:text-[2.5rem]">Welcome back.</h1>
            <p className="mt-3 text-neutral-600 text-[0.95rem] leading-relaxed">
              Sign in to save your registrations and access mentor follow-ups.
            </p>

            {user ? (
              <div className="mt-8 rounded-2xl bg-[#f5f5f7] p-5" data-testid="already-signed-in">
                <p className="font-medium text-[#1d1d1f] break-words">Signed in as {user.name}</p>
                <p className="text-sm text-neutral-500 mt-1 break-all">{user.email}</p>
                <Link to="/dashboard" className="apple-btn apple-btn-dark mt-5 w-full sm:w-auto">
                  Go to dashboard <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleGoogle}
                className="apple-btn apple-btn-dark mt-8 w-full justify-center"
                data-testid="google-signin-btn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
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
        </Reveal>
        </div>
      </div>
    </div>
  );
}
