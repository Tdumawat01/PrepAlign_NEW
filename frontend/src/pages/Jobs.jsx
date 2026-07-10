import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, MapPin, Briefcase, Clock, ArrowUpRight, Building2, RefreshCw, Filter, Sparkles, IndianRupee, User, ChevronDown } from "lucide-react";
import { API } from "../lib/constants";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";

function formatPostedAt(iso, raw) {
  if (raw) return raw;
  if (!iso) return "Recently";
  try {
    const now = new Date();
    const d = new Date(iso);
    const diff = Math.floor((now - d) / 1000);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} d ago`;
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch { return "Recently"; }
}

function CompanyLogo({ src, name }) {
  const [errored, setErrored] = useState(false);
  const initials = (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
  if (!src || errored) {
    return (
      <div className="w-12 h-12 bg-neutral-950 text-white text-xs font-black flex items-center justify-center shrink-0 border border-neutral-950">
        {initials || <Building2 className="w-5 h-5" />}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name || "Company logo"}
      onError={() => setErrored(true)}
      className="w-12 h-12 object-contain bg-white border border-neutral-200 shrink-0"
      loading="lazy"
    />
  );
}

function JobCard({ job, index }) {
  const employment = job.employment_type || "Not specified";
  const location = job.location || "Location not specified";
  const [insights, setInsights] = useState(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  const loadInsights = async () => {
    if (insights) { setInsightsOpen((v) => !v); return; }
    setInsightsLoading(true);
    setInsightsOpen(true);
    try {
      const res = await axios.post(`${API}/jobs/insights`, {
        provider: job.provider,
        provider_job_id: job.provider_job_id,
      }, { timeout: 45000 });
      setInsights(res.data);
    } catch {
      setInsights({ error: true });
    } finally {
      setInsightsLoading(false);
    }
  };

  return (
    <StaggerItem>
      <div className="card-lift border-t border-neutral-200 py-5 px-1 sm:px-2 hover:bg-neutral-50" data-testid={`job-card-${index}`}>
        <div className="flex items-start gap-4">
          <CompanyLogo src={job.logo_url} name={job.company} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-0.5 truncate">
                  {job.company || "Company"}
                </p>
                <h3 className="text-lg md:text-xl font-black tracking-tight leading-snug">
                  {job.title || "Untitled role"}
                </h3>
              </div>
              {job.apply_link ? (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-press inline-flex items-center gap-1.5 bg-neutral-950 text-white px-4 py-2 text-sm font-bold shrink-0"
                  data-testid={`job-apply-${index}`}
                >
                  Apply <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-600">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {location}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {employment}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatPostedAt(job.posted_at, job.posted_at_raw)}</span>
              {job.salary ? (
                <span className="flex items-center gap-1.5 text-neutral-950 font-semibold">
                  <IndianRupee className="w-3.5 h-3.5" /> {job.salary}
                </span>
              ) : null}
              {job.is_remote ? <span className="flex items-center gap-1.5 text-neutral-950 font-semibold">• Remote</span> : null}
              {job.is_internship ? <span className="flex items-center gap-1.5 text-neutral-950 font-semibold">• Internship</span> : null}
            </div>
            {job.queries?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.queries.slice(0, 3).map((q) => (
                  <span key={q} className="text-[10px] tracking-wider uppercase font-bold px-2 py-1 bg-neutral-100 text-neutral-700">
                    {q}
                  </span>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={loadInsights}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-950 transition-colors"
              data-testid={`job-insights-btn-${index}`}
              aria-expanded={insightsOpen}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Insights
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${insightsOpen ? "rotate-180" : ""}`} />
            </button>

            {insightsOpen && (
              <div className="mt-3 border-l-2 border-neutral-950 bg-neutral-50 p-4 text-sm" data-testid={`job-insights-${index}`}>
                {insightsLoading ? (
                  <p className="text-neutral-500 flex items-center gap-2">
                    <span className="inline-block w-3.5 h-3.5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    Generating insights…
                  </p>
                ) : insights?.error ? (
                  <p className="text-neutral-500">Couldn’t generate insights right now. Please try again later.</p>
                ) : insights ? (
                  <div className="space-y-3">
                    {insights.preview ? (
                      <div>
                        <p className="label-eyebrow mb-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Company preview</p>
                        <p className="text-neutral-800 leading-relaxed">{insights.preview}</p>
                      </div>
                    ) : null}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {insights.salary_range_estimate ? (
                        <div>
                          <p className="label-eyebrow mb-1 flex items-center gap-1.5"><IndianRupee className="w-3 h-3" /> Salary range</p>
                          <p className="text-neutral-800 font-bold">{insights.salary_range_estimate}</p>
                        </div>
                      ) : null}
                      {insights.founder_name ? (
                        <div>
                          <p className="label-eyebrow mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> Founder</p>
                          <p className="text-neutral-800 font-bold">{insights.founder_name}</p>
                        </div>
                      ) : null}
                    </div>
                    {!insights.preview && !insights.salary_range_estimate && !insights.founder_name ? (
                      <p className="text-neutral-500">Not enough public info about this company.</p>
                    ) : null}
                    <p className="text-[10px] text-neutral-400 pt-1">
                      AI-generated using public information. Verify before making decisions.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaggerItem>
  );
}

function Chip({ active, onClick, children, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-bold tracking-tight px-3 py-1.5 border transition-colors ${
        active ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-950"
      }`}
      data-testid={testid}
    >
      {children}
    </button>
  );
}

export default function Jobs() {
  const [data, setData] = useState({ jobs: [], last_refreshed_at: null });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const [locFilter, setLocFilter] = useState("All");
  const [type, setType] = useState("All"); // All, Internship, Full-time
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/jobs`, { timeout: 90000 });
        if (alive) setData(res.data || { jobs: [] });
      } catch {
        if (alive) setData({ jobs: [] });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const jobs = data.jobs || [];

  const roles = useMemo(() => {
    const s = new Set();
    jobs.forEach((j) => (j.queries || []).forEach((r) => s.add(r)));
    return ["All", ...Array.from(s).sort()];
  }, [jobs]);

  const locations = useMemo(() => {
    const s = new Set();
    jobs.forEach((j) => {
      const loc = (j.location || "").split(",").pop()?.trim();
      if (loc) s.add(loc);
    });
    return ["All", ...Array.from(s).sort()];
  }, [jobs]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return jobs
      .filter((j) => {
        if (needle) {
          const hay = `${j.title || ""} ${j.company || ""} ${j.location || ""} ${(j.queries || []).join(" ")}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        if (role !== "All" && !(j.queries || []).includes(role)) return false;
        if (locFilter !== "All" && !(j.location || "").includes(locFilter)) return false;
        if (remoteOnly && !j.is_remote) return false;
        if (type === "Internship" && !j.is_internship) return false;
        if (type === "Full-time") {
          const et = (j.employment_type || "").toLowerCase();
          if (!et.includes("full")) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = a.posted_at ? new Date(a.posted_at).getTime() : 0;
        const dbb = b.posted_at ? new Date(b.posted_at).getTime() : 0;
        return dbb - da;
      });
  }, [jobs, q, role, locFilter, type, remoteOnly]);

  const lastRefreshed = data.last_refreshed_at
    ? new Date(data.last_refreshed_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : null;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 py-10 md:py-16" data-testid="page-jobs">
      <Reveal>
        <p className="label-eyebrow mb-4">Jobs</p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-[0.95]">
          Live openings in AI & startups.
        </h1>
        <p className="mt-5 text-neutral-600 max-w-2xl">
          Curated roles across India — Founder’s Office, Product, GTM, Design, Ops, Analyst, and more.
          Updated every 24 hours from live listings.
        </p>
        {lastRefreshed ? (
          <p className="mt-3 text-xs text-neutral-500 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Last refreshed {lastRefreshed}
          </p>
        ) : null}
      </Reveal>

      {/* Filters */}
      <div className="mt-10 border-2 border-neutral-950 bg-white p-5 md:p-6 hard-shadow-sm" data-testid="jobs-filters">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <p className="label-eyebrow">Filter & Search</p>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, company, location, role…"
            className="w-full h-11 pl-10 pr-3 border border-neutral-950 rounded-none text-sm focus:outline-none"
            data-testid="jobs-search"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full h-10 border border-neutral-950 rounded-none px-2 text-sm bg-white"
              data-testid="jobs-filter-role"
            >
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Location</label>
            <select
              value={locFilter}
              onChange={(e) => setLocFilter(e.target.value)}
              className="mt-1 w-full h-10 border border-neutral-950 rounded-none px-2 text-sm bg-white"
              data-testid="jobs-filter-location"
            >
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip active={type === "All"}         onClick={() => setType("All")}         testid="chip-type-all">All types</Chip>
          <Chip active={type === "Full-time"}   onClick={() => setType("Full-time")}   testid="chip-type-fulltime">Full-time</Chip>
          <Chip active={type === "Internship"}  onClick={() => setType("Internship")}  testid="chip-type-intern">Internship</Chip>
          <Chip active={remoteOnly}             onClick={() => setRemoteOnly((v) => !v)} testid="chip-remote">Remote only</Chip>
          {(q || role !== "All" || locFilter !== "All" || type !== "All" || remoteOnly) && (
            <button
              type="button"
              onClick={() => { setQ(""); setRole("All"); setLocFilter("All"); setType("All"); setRemoteOnly(false); }}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-950 ml-1 underline"
              data-testid="jobs-clear-filters"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results header */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          <span className="font-bold text-neutral-950">{filtered.length}</span> {filtered.length === 1 ? "opening" : "openings"} · sorted by latest
        </p>
      </div>

      {/* Job list */}
      <div className="mt-2 border-b border-neutral-200" data-testid="jobs-list">
        {loading ? (
          <div className="py-16 text-center text-sm text-neutral-500">Loading live jobs…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-neutral-500" data-testid="jobs-empty">
            No jobs match your filters. Try widening your search.
          </div>
        ) : (
          <Stagger stagger={0.04}>
            {filtered.map((job, i) => (
              <JobCard key={`${job.provider}-${job.provider_job_id}`} job={job} index={i} />
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
