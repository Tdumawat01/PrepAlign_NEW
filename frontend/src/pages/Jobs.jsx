import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, MapPin, Briefcase, Clock, ArrowUpRight, Building2, RefreshCw, Filter, Sparkles, IndianRupee, User, ChevronDown } from "lucide-react";
import { API } from "../lib/constants";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import { JobListSkeleton } from "../components/Skeleton";

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
      <div className="w-12 h-12 rounded-xl bg-[#1d1d1f] text-white text-xs font-semibold flex items-center justify-center shrink-0">
        {initials || <Building2 className="w-5 h-5" />}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name || "Company logo"}
      onError={() => setErrored(true)}
      className="w-12 h-12 object-contain bg-white border border-neutral-200 rounded-xl shrink-0"
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
      <div className="card-lift border-t border-neutral-200/80 py-5 hover:bg-[#fafafa] transition-colors" data-testid={`job-card-${index}`}>
        <div className="flex items-start gap-3 sm:gap-4">
          <CompanyLogo src={job.logo_url} name={job.company} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="apple-eyebrow mb-0.5 truncate">
                  {job.company || "Company"}
                </p>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight leading-snug text-[#1d1d1f] break-words">
                  {job.title || "Untitled role"}
                </h3>
              </div>
              {job.apply_link ? (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="apple-btn apple-btn-dark text-sm py-2 px-4 w-full sm:w-auto shrink-0"
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
                <span className="flex items-center gap-1.5 text-[#1d1d1f] font-medium">
                  <IndianRupee className="w-3.5 h-3.5" /> {job.salary}
                </span>
              ) : null}
              {job.is_remote ? <span className="flex items-center gap-1.5 text-[#1d1d1f] font-medium">· Remote</span> : null}
              {job.is_internship ? <span className="flex items-center gap-1.5 text-[#1d1d1f] font-medium">· Internship</span> : null}
            </div>
            {job.queries?.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.queries.slice(0, 3).map((q) => (
                  <span key={q} className="text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-full bg-[#f5f5f7] text-neutral-600">
                    {q}
                  </span>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={loadInsights}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-[#1d1d1f] transition-colors"
              data-testid={`job-insights-btn-${index}`}
              aria-expanded={insightsOpen}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Insights
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${insightsOpen ? "rotate-180" : ""}`} />
            </button>

            {insightsOpen && (
              <div className="mt-3 rounded-2xl bg-[#f5f5f7] p-4 text-sm" data-testid={`job-insights-${index}`}>
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
                        <p className="apple-eyebrow mb-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Company preview</p>
                        <p className="text-neutral-800 leading-relaxed">{insights.preview}</p>
                      </div>
                    ) : null}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {insights.salary_range_estimate ? (
                        <div>
                          <p className="apple-eyebrow mb-1 flex items-center gap-1.5"><IndianRupee className="w-3 h-3" /> Salary range</p>
                          <p className="text-neutral-800 font-medium">{insights.salary_range_estimate}</p>
                        </div>
                      ) : null}
                      {insights.founder_name ? (
                        <div>
                          <p className="apple-eyebrow mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> Founder</p>
                          <p className="text-neutral-800 font-medium">{insights.founder_name}</p>
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
      className={`apple-chip ${active ? "apple-chip-active" : ""}`}
      data-testid={testid}
    >
      {children}
    </button>
  );
}

const EMPTY_JOBS = [];

export default function Jobs() {
  const [data, setData] = useState({ jobs: EMPTY_JOBS, last_refreshed_at: null });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");
  const [locFilter, setLocFilter] = useState("All");
  const [type, setType] = useState("All");
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/jobs`, { timeout: 90000 });
        if (alive) {
          const payload = res.data || {};
          setData({
            ...payload,
            jobs: Array.isArray(payload.jobs) ? payload.jobs : EMPTY_JOBS,
          });
        }
      } catch {
        if (alive) setData({ jobs: EMPTY_JOBS });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const jobs = Array.isArray(data.jobs) ? data.jobs : EMPTY_JOBS;

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
    <div className="apple-page apple-page-y text-left" data-testid="page-jobs">
      <Reveal>
        <p className="apple-eyebrow mb-4">Jobs</p>
        <h1 className="apple-headline">
          Live openings in AI &amp; startups.
        </h1>
        <p className="apple-subhead mt-5">
          Curated roles across India: Founder’s Office, Product, GTM, Design, Ops, Analyst, and more.
          Updated every 24 hours from live listings.
        </p>
        {lastRefreshed ? (
          <p className="mt-3 text-xs text-neutral-500 flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3" /> Last refreshed {lastRefreshed}
          </p>
        ) : null}
      </Reveal>

      <div className="mt-10 apple-panel" data-testid="jobs-filters">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-neutral-500" />
          <p className="apple-eyebrow">Filter &amp; Search</p>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, company, location, role…"
            className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#d2d2d7] text-base sm:text-sm focus:outline-none focus:border-neutral-950"
            data-testid="jobs-search"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="apple-label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-[#d2d2d7] px-3 text-sm bg-white"
              data-testid="jobs-filter-role"
            >
              {roles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="apple-label">Location</label>
            <select
              value={locFilter}
              onChange={(e) => setLocFilter(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-[#d2d2d7] px-3 text-sm bg-white"
              data-testid="jobs-filter-location"
            >
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 apple-scroll-x sm:overflow-visible">
          <Chip active={type === "All"}         onClick={() => setType("All")}         testid="chip-type-all">All types</Chip>
          <Chip active={type === "Full-time"}   onClick={() => setType("Full-time")}   testid="chip-type-fulltime">Full-time</Chip>
          <Chip active={type === "Internship"}  onClick={() => setType("Internship")}  testid="chip-type-intern">Internship</Chip>
          <Chip active={remoteOnly}             onClick={() => setRemoteOnly((v) => !v)} testid="chip-remote">Remote only</Chip>
          {(q || role !== "All" || locFilter !== "All" || type !== "All" || remoteOnly) && (
            <button
              type="button"
              onClick={() => { setQ(""); setRole("All"); setLocFilter("All"); setType("All"); setRemoteOnly(false); }}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-950 ml-1 underline"
              data-testid="jobs-clear-filters"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-sm text-neutral-600">
          <span className="font-semibold text-[#1d1d1f]">{filtered.length}</span> {filtered.length === 1 ? "opening" : "openings"} · sorted by latest
        </p>
      </div>

      <div className="mt-2 border-b border-neutral-200/80" data-testid="jobs-list">
        {loading ? (
          <JobListSkeleton />
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
