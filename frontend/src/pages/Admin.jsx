import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { API } from "../lib/constants";
import { useAuth } from "../context/AuthContext";
import { Download, ShieldAlert, Ticket, UserRoundSearch, TrendingUp, LogOut, RefreshCw, Sparkles } from "lucide-react";

function StatCard({ label, value, sub, testid }) {
  return (
    <div className="apple-tile min-h-0 bg-[#f5f5f7]" data-testid={testid}>
      <p className="apple-eyebrow">{label}</p>
      <p className="text-4xl font-semibold tracking-tight mt-3 text-[#1d1d1f]">{value}</p>
      {sub ? <p className="text-xs text-neutral-500 mt-1">{sub}</p> : null}
    </div>
  );
}

function toCsv(rows, columns) {
  if (!rows.length) return "";
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows
    .map((r) =>
      columns
        .map((c) => {
          const v = r[c.key];
          const s = v === null || v === undefined ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const WEBINAR_COLS = [
  { key: "created_at",      label: "Date" },
  { key: "full_name",       label: "Full Name" },
  { key: "email",           label: "Email" },
  { key: "phone",           label: "Phone" },
  { key: "college",         label: "College / Status" },
  { key: "interested_role", label: "Role" },
  { key: "referral_source", label: "Referral" },
  { key: "utm_source",      label: "UTM Source" },
  { key: "utm_medium",      label: "UTM Medium" },
  { key: "utm_campaign",    label: "UTM Campaign" },
];

const MENTORSHIP_COLS = [
  { key: "created_at",        label: "Date" },
  { key: "name",              label: "Name" },
  { key: "email",             label: "Email" },
  { key: "phone",             label: "Phone" },
  { key: "current_status",    label: "Status" },
  { key: "target_role",       label: "Target Role" },
  { key: "help_needed",       label: "Help Needed" },
  { key: "biggest_challenge", label: "Challenge" },
  { key: "referral_source",   label: "Referral" },
  { key: "utm_source",        label: "UTM Source" },
];

const WAITLIST_COLS = [
  { key: "created_at",         label: "Date" },
  { key: "waitlist_id",        label: "Waitlist ID" },
  { key: "full_name",          label: "Full Name" },
  { key: "email",              label: "Email" },
  { key: "phone",              label: "Phone" },
  { key: "linkedin_url",       label: "LinkedIn" },
  { key: "current_role",       label: "Current Role" },
  { key: "target_role",        label: "Target Role" },
  { key: "biggest_challenge",  label: "Challenge" },
  { key: "comments",           label: "Comments" },
  { key: "status",             label: "Status" },
  { key: "source",             label: "Source" },
  { key: "utm_campaign",       label: "UTM Campaign" },
];

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  } catch { return iso; }
}

function DataTable({ rows, columns, testid }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(needle))
    );
  }, [rows, columns, q]);

  return (
    <div data-testid={testid}>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone, role, UTM…"
          className="border border-neutral-950 rounded-none px-3 h-10 text-sm w-full sm:max-w-sm focus:outline-none"
          data-testid={`${testid}-search`}
        />
        <p className="text-sm text-neutral-500">
          Showing <span className="font-semibold text-neutral-950">{filtered.length}</span> of {rows.length}
        </p>
      </div>
      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="text-left font-bold uppercase tracking-wider text-[11px] px-4 py-3 whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center text-neutral-500 py-10">No records yet.</td></tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={r.id || i} className="border-b border-neutral-100 hover:bg-neutral-50">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-top whitespace-nowrap max-w-[280px] overflow-hidden text-ellipsis">
                      {c.key === "created_at" ? formatDate(r[c.key]) : (r[c.key] ?? <span className="text-neutral-300">-</span>)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("waitlist");
  const [stats, setStats] = useState(null);
  const [webinars, setWebinars] = useState([]);
  const [mentorships, setMentorships] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [refreshingJobs, setRefreshingJobs] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (!user.is_admin) { setForbidden(true); setFetching(false); return; }

    (async () => {
      try {
        const [s, w, m, wl] = await Promise.all([
          axios.get(`${API}/admin/stats`, { withCredentials: true }),
          axios.get(`${API}/webinar/registrations`, { withCredentials: true }),
          axios.get(`${API}/mentorship/requests`, { withCredentials: true }),
          axios.get(`${API}/waitlist/signups`, { withCredentials: true }),
        ]);
        setStats(s.data);
        setWebinars(w.data);
        setMentorships(m.data);
        setWaitlist(wl.data);
      } catch (err) {
        if (err?.response?.status === 403) setForbidden(true);
        else toast.error("Failed to load admin data");
      } finally {
        setFetching(false);
      }
    })();
  }, [user, loading, navigate]);

  if (loading || fetching) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-neutral-500">Loading admin…</div>;
  }

  if (forbidden) {
    return (
      <div className="apple-page apple-page-y text-center max-w-md" data-testid="admin-forbidden">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-950 text-white mb-6">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin only.</h1>
        <p className="mt-3 text-neutral-600">
          Your account ({user?.email}) isn’t authorized to view this page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="underline text-sm">Back home</Link>
          <button onClick={logout} className="text-sm underline" data-testid="admin-forbidden-logout">Sign out</button>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    if (tab === "waitlist") {
      downloadCsv(`waitlist-signups-${Date.now()}.csv`, toCsv(waitlist, WAITLIST_COLS));
    } else if (tab === "webinar") {
      downloadCsv(`webinar-registrations-${Date.now()}.csv`, toCsv(webinars, WEBINAR_COLS));
    } else {
      downloadCsv(`mentorship-requests-${Date.now()}.csv`, toCsv(mentorships, MENTORSHIP_COLS));
    }
  };

  const handleRefreshJobs = async () => {
    if (refreshingJobs) return;
    setRefreshingJobs(true);
    const t = toast.loading("Refreshing job board. This can take up to a minute…");
    try {
      const res = await axios.post(`${API}/jobs/refresh`, {}, { withCredentials: true, timeout: 120000 });
      toast.success(`Job board refreshed. ${res.data.count} openings cached.`, { id: t });
    } catch (err) {
      const msg = err?.response?.status === 403 ? "Admin access required." : "Refresh failed. Try again.";
      toast.error(msg, { id: t });
    } finally {
      setRefreshingJobs(false);
    }
  };

  return (
    <div className="apple-page apple-page-y" data-testid="page-admin">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="apple-eyebrow mb-3">Admin</p>
          <h1 className="apple-headline">
            Leads &amp; Registrations
          </h1>
          <p className="mt-2 text-sm text-neutral-500">Signed in as {user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefreshJobs}
            disabled={refreshingJobs}
            className="apple-btn border border-[#d2d2d7] bg-white text-sm disabled:opacity-60"
            data-testid="admin-refresh-jobs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingJobs ? "animate-spin" : ""}`} />
            {refreshingJobs ? "Refreshing…" : "Refresh Jobs"}
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 border-2 border-neutral-950 px-4 py-2 font-bold text-sm hover:bg-neutral-950 hover:text-white"
            data-testid="admin-export-csv"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 font-bold text-sm text-neutral-500 hover:text-neutral-950"
            data-testid="admin-logout"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <StatCard label="Waitlist total" value={stats.waitlist?.total ?? 0} sub={`+${stats.waitlist?.today ?? 0} today · ${stats.waitlist?.last_7_days ?? 0} this week`} testid="stat-waitlist-total" />
          <StatCard label="Webinar total" value={stats.webinar.total} sub={`+${stats.webinar.today} today · ${stats.webinar.last_7_days} this week`} testid="stat-webinar-total" />
          <StatCard label="Mentorship total" value={stats.mentorship.total} sub={`+${stats.mentorship.today} today · ${stats.mentorship.last_7_days} this week`} testid="stat-mentorship-total" />
          <StatCard
            label="Top UTM source"
            value={stats.top_utm_sources?.[0]?.source || "-"}
            sub={stats.top_utm_sources?.[0] ? `${stats.top_utm_sources[0].count} regs` : "no UTM yet"}
            testid="stat-top-utm"
          />
        </div>
      ) : null}

      <div className="flex items-center gap-1 border-b border-neutral-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setTab("waitlist")}
          className={`px-4 py-3 text-sm font-semibold tracking-tight border-b-2 -mb-px inline-flex items-center gap-2 whitespace-nowrap ${
            tab === "waitlist" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-500 hover:text-neutral-950"
          }`}
          data-testid="admin-tab-waitlist"
        >
          <Sparkles className="w-4 h-4" /> Waitlist ({waitlist.length})
        </button>
        <button
          onClick={() => setTab("webinar")}
          className={`px-4 py-3 text-sm font-semibold tracking-tight border-b-2 -mb-px inline-flex items-center gap-2 whitespace-nowrap ${
            tab === "webinar" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-500 hover:text-neutral-950"
          }`}
          data-testid="admin-tab-webinar"
        >
          <Ticket className="w-4 h-4" /> Webinar ({webinars.length})
        </button>
        <button
          onClick={() => setTab("mentorship")}
          className={`px-4 py-3 text-sm font-semibold tracking-tight border-b-2 -mb-px inline-flex items-center gap-2 whitespace-nowrap ${
            tab === "mentorship" ? "border-neutral-950 text-neutral-950" : "border-transparent text-neutral-500 hover:text-neutral-950"
          }`}
          data-testid="admin-tab-mentorship"
        >
          <UserRoundSearch className="w-4 h-4" /> Mentorship ({mentorships.length})
        </button>
      </div>

      {tab === "waitlist" ? (
        <DataTable rows={waitlist} columns={WAITLIST_COLS} testid="waitlist-table" />
      ) : tab === "webinar" ? (
        <DataTable rows={webinars} columns={WEBINAR_COLS} testid="webinar-table" />
      ) : (
        <DataTable rows={mentorships} columns={MENTORSHIP_COLS} testid="mentorship-table" />
      )}

      {stats?.top_utm_sources?.length > 0 && (
        <div className="mt-12">
          <p className="apple-eyebrow mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Attribution · Top UTM sources</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border-t border-l border-neutral-200">
            {stats.top_utm_sources.map((s) => (
              <div key={s.source} className="border-r border-b border-neutral-200 p-5">
                <p className="text-2xl font-semibold tracking-tight">{s.count}</p>
                <p className="apple-eyebrow mt-1">{s.source}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
