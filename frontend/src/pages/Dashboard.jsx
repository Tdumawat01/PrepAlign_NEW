import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API } from "../lib/constants";
import { useAuth } from "../context/AuthContext";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { Skeleton } from "../components/Skeleton";

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
      <div className="apple-page apple-page-y space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div data-testid="page-dashboard" className="apple-page apple-page-y text-left">
      <Reveal>
        <p className="apple-eyebrow mb-4">Signed in</p>
        <h1 className="apple-headline">
          Hi {user.name?.split(" ")[0] || "there"}.
        </h1>
        <p className="apple-subhead mt-4">
          You’re signed in as <span className="font-medium text-[#1d1d1f]">{user.email}</span>. Next up: register for the webinar and join the WhatsApp group.
        </p>
      </Reveal>

      <Stagger className="mt-10 grid sm:grid-cols-2 gap-4" stagger={0.08}>
        <StaggerItem>
          <Link to="/webinar" className="apple-tile block min-h-0 bg-[#f5f5f7] hover:bg-[#ececef]" data-testid="dashboard-webinar-card">
            <p className="apple-eyebrow">Action</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-[#1d1d1f]">Reserve webinar seat →</p>
          </Link>
        </StaggerItem>
        <StaggerItem>
          <Link to="/mentorship" className="apple-tile block min-h-0 bg-[#f5f5f7] hover:bg-[#ececef]" data-testid="dashboard-mentorship-card">
            <p className="apple-eyebrow">Action</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-[#1d1d1f]">Request 1:1 mentorship →</p>
          </Link>
        </StaggerItem>
        {user.is_admin ? (
          <StaggerItem className="sm:col-span-2">
            <Link to="/admin" className="apple-tile block min-h-0 bg-[#1d1d1f] text-white hover:bg-neutral-800" data-testid="dashboard-admin-card">
              <p className="apple-eyebrow text-white/50">Admin</p>
              <p className="mt-3 text-xl font-semibold tracking-tight">Open admin dashboard →</p>
            </Link>
          </StaggerItem>
        ) : null}
      </Stagger>
    </div>
  );
}
