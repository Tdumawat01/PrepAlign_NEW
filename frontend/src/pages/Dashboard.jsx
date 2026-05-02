import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API } from "../lib/constants";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: ctxUser, setUser } = useAuth();
  const [user, setLocalUser] = useState(location.state?.user || ctxUser || null);
  const [checking, setChecking] = useState(!user);

  useEffect(() => {
    if (user) return;
    (async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setLocalUser(res.data);
        setUser(res.data);
      } catch {
        navigate("/login", { replace: true });
      } finally {
        setChecking(false);
      }
    })();
  }, [user, navigate, setUser]);

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div data-testid="page-dashboard" className="mx-auto max-w-4xl px-5 sm:px-8 py-16 md:py-24">
      <p className="label-eyebrow mb-4">Signed in</p>
      <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
        Hi {user.name?.split(" ")[0] || "there"}.
      </h1>
      <p className="mt-4 text-neutral-600 max-w-xl">
        You’re signed in as <span className="font-semibold">{user.email}</span>. Next up: register for the webinar and join the WhatsApp group.
      </p>
      <div className="mt-10 grid sm:grid-cols-2 gap-0 border-t border-l border-neutral-200">
        <Link to="/webinar" className="border-r border-b border-neutral-200 p-8 hover:bg-neutral-50 transition-colors" data-testid="dashboard-webinar-card">
          <p className="label-eyebrow">Action</p>
          <p className="mt-3 text-2xl font-black tracking-tight">Reserve webinar seat →</p>
        </Link>
        <Link to="/mentorship" className="border-r border-b border-neutral-200 p-8 hover:bg-neutral-50 transition-colors" data-testid="dashboard-mentorship-card">
          <p className="label-eyebrow">Action</p>
          <p className="mt-3 text-2xl font-black tracking-tight">Request 1:1 mentorship →</p>
        </Link>
      </div>
    </div>
  );
}
