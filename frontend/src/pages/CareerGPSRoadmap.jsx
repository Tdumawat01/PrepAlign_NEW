import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Compass,
  ExternalLink,
  PlayCircle,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { API } from "../lib/constants";
import {
  ANSWERS_KEY,
  RESULT_KEY,
  ROADMAP_CACHE_KEY,
} from "../data/career_gps_config";
import {
  loadProgress,
  saveProgress,
  taskId,
  trackActivationEvent,
  summarizeProgress,
} from "../lib/careerGpsProgress";
import { Reveal } from "../components/Reveal";

function loadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function Heatmap({ weekStats }) {
  return (
    <div data-testid="roadmap-heatmap" className="w-full">
      <div className="flex items-end justify-between gap-2 sm:gap-3">
        {weekStats.map((w) => {
          const intensity = w.ratio;
          const bg =
            intensity === 0
              ? "bg-neutral-100"
              : intensity < 0.34
                ? "bg-neutral-300"
                : intensity < 0.67
                  ? "bg-pa-brand/80"
                  : "bg-pa-brand";
          return (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <div
                className={`w-full aspect-square rounded-lg ${bg} transition-colors`}
                title={`Week ${w.week}: ${w.completed}/${w.total}`}
                data-testid={`heatmap-week-${w.week}`}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                W{w.week}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        <span>Less</span>
        <span className="inline-flex gap-1">
          <span className="w-3 h-3 rounded-sm bg-neutral-100" />
          <span className="w-3 h-3 rounded-sm bg-neutral-300" />
          <span className="w-3 h-3 rounded-sm bg-pa-brand/80" />
          <span className="w-3 h-3 rounded-sm bg-pa-brand" />
        </span>
        <span>More</span>
      </div>
    </div>
  );
}

function ResourceList({ items, icon: Icon, empty, testid }) {
  if (!items?.length) {
    return <p className="text-sm text-neutral-500">{empty}</p>;
  }
  return (
    <ul className="space-y-2" data-testid={testid}>
      {items.map((item, i) => (
        <li key={`${item.url}-${i}`}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 text-sm font-semibold text-neutral-950 hover:underline"
          >
            <Icon className="w-4 h-4 mt-0.5 shrink-0 text-neutral-500" />
            <span className="min-w-0 flex-1">{item.title || item.url}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function CareerGPSRoadmap() {
  const navigate = useNavigate();
  const result = useMemo(() => loadJson(RESULT_KEY), []);
  const answers = useMemo(() => loadJson(ANSWERS_KEY), []);
  const role = result?.top_role || "Founder's Office";

  const [roadmap, setRoadmap] = useState(() => {
    const cached = loadJson(ROADMAP_CACHE_KEY);
    if (cached?.role === role && Array.isArray(cached.roadmap)) return cached.roadmap;
    return result?.roadmap || [];
  });
  const [source, setSource] = useState("local");
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(() => loadProgress(role));
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    if (!result) {
      navigate("/career-gps", { replace: true });
      return;
    }
    trackActivationEvent("roadmap_opened", { role });
  }, [result, navigate, role]);

  useEffect(() => {
    if (!result || !answers) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.post(
          `${API}/career-gps/roadmap`,
          { role, answers },
          { timeout: 60000 },
        );
        if (!alive) return;
        const weeks = res.data?.roadmap || [];
        setRoadmap(weeks);
        setSource(res.data?.source || "openrouter");
        try {
          localStorage.setItem(
            ROADMAP_CACHE_KEY,
            JSON.stringify({ role, roadmap: weeks, source: res.data?.source }),
          );
        } catch {
          /* noop */
        }
      } catch {
        /* keep fallback roadmap */
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [result, answers, role]);

  useEffect(() => {
    saveProgress(role, done);
  }, [done, role]);

  const summary = useMemo(() => summarizeProgress(roadmap, done), [roadmap, done]);
  const milestoneFired = useRef({ half: false, done: false });

  useEffect(() => {
    if (summary.percent >= 50 && !milestoneFired.current.half) {
      milestoneFired.current.half = true;
      trackActivationEvent("roadmap_halfway", { role, percent: summary.percent });
    }
    if (summary.percent === 100 && summary.totalTasks > 0 && !milestoneFired.current.done) {
      milestoneFired.current.done = true;
      trackActivationEvent("roadmap_completed", { role, percent: 100 });
    }
  }, [summary.percent, summary.totalTasks, role]);

  const toggleTask = (week, index) => {
    const id = taskId(week, index);
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!prev[id]) {
        trackActivationEvent("task_completed", { role, week, taskIndex: index });
        const weekTasks = roadmap.find((w) => w.week === week);
        const tasks = weekTasks?.tasks?.length
          ? weekTasks.tasks
          : [weekTasks?.milestone].filter(Boolean);
        const allDone = tasks.every((_, i) => (i === index ? true : next[taskId(week, i)]));
        if (allDone) {
          trackActivationEvent("week_completed", { role, week });
        }
      }
      return next;
    });
  };

  const resetProgress = () => {
    setDone({});
    saveProgress(role, {});
  };

  if (!result) return null;

  const active = roadmap.find((w) => w.week === activeWeek) || roadmap[0];
  const activeTasks =
    active?.tasks?.length > 0
      ? active.tasks
      : active?.milestone
        ? [active.milestone]
        : [];

  return (
    <div className="apple-page apple-page-y text-left" data-testid="page-career-gps-roadmap">
      <Reveal>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <Link
              to="/career-gps"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-neutral-950 mb-4"
              data-testid="roadmap-back"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Career GPS
            </Link>
            <p className="apple-eyebrow mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> 8-week roadmap
            </p>
            <h1 className="apple-headline">
              Your path to{" "}
              <span className="inline-block mt-1 sm:mt-0 px-2.5 py-0.5 rounded-full bg-pa-brand text-pa-on-brand text-[0.75em] sm:text-[0.85em] max-w-full align-middle break-words">
                {role}
              </span>
            </h1>
            <p className="apple-subhead mt-4">
              Tasks, guides, and videos for each week. Track progress; we&apos;ll use this later for activation emails.
            </p>
          </div>
          <button
            type="button"
            onClick={resetProgress}
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-950"
            data-testid="roadmap-reset-progress"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Reset progress
          </button>
        </div>

        {/* Progress */}
        <section className="apple-panel mb-10" data-testid="roadmap-progress">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <p className="apple-eyebrow mb-1">Overall progress</p>
              <p className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]" data-testid="roadmap-progress-percent">
                {summary.percent}%
              </p>
            </div>
            <p className="text-sm font-medium text-neutral-500">
              {summary.doneTasks} / {summary.totalTasks} tasks
              {loading ? " · refreshing…" : source !== "local" ? ` · ${source}` : ""}
            </p>
          </div>
          <div className="apple-progress">
            <motion.div
              className="h-full bg-pa-brand rounded-full"
              animate={{ width: `${summary.percent}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </section>

        {/* Heatmap */}
        <section className="mb-12">
          <p className="apple-eyebrow mb-4">Activity heatmap</p>
          {roadmap.length ? (
            <Heatmap weekStats={summary.weeks} />
          ) : (
            <p className="text-sm text-neutral-500">Generating your weeks…</p>
          )}
        </section>

        {/* Week picker */}
        <div className="apple-scroll-x mb-8" data-testid="roadmap-week-tabs">
          {roadmap.map((w) => {
            const ws = summary.weeks.find((x) => x.week === w.week);
            const complete = ws && ws.total > 0 && ws.completed === ws.total;
            const selected = activeWeek === w.week;
            return (
              <button
                key={w.week}
                type="button"
                onClick={() => setActiveWeek(w.week)}
                className={`apple-chip ${selected ? "apple-chip-active" : ""} ${complete && !selected ? "apple-chip-green" : ""}`}
                data-testid={`roadmap-week-tab-${w.week}`}
              >
                Week {w.week}
                {complete ? <Check className="w-3.5 h-3.5" /> : null}
              </button>
            );
          })}
        </div>

        {active ? (
          <div className="grid lg:grid-cols-5 gap-10 border-t border-black/5 pt-10">
            <div className="lg:col-span-3 space-y-8">
              <div>
                <p className="apple-eyebrow mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Week {active.week} focus
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-[#1d1d1f]">
                  {active.milestone}
                </h2>
              </div>

              <div data-testid="roadmap-tasks">
                <p className="apple-eyebrow mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Tasks
                </p>
                <ul className="space-y-2">
                  {activeTasks.map((task, i) => {
                    const id = taskId(active.week, i);
                    const isDone = !!done[id];
                    return (
                      <li
                        key={id}
                        className={`rounded-2xl flex items-start gap-3 p-4 ${
                          isDone ? "bg-[#f5f5f7]" : "bg-white border border-[#e8e8ed]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleTask(active.week, i)}
                          aria-pressed={isDone}
                          className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                            isDone ? "bg-pa-success text-white" : "bg-[#f5f5f7] text-transparent"
                          }`}
                          data-testid={`roadmap-task-${active.week}-${i}`}
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                        <p
                          className={`text-sm md:text-base font-medium tracking-tight ${
                            isDone ? "line-through text-neutral-400" : "text-[#1d1d1f]"
                          }`}
                        >
                          {task}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            <aside className="lg:col-span-2 space-y-4">
              <div className="apple-tile min-h-0 bg-[#f5f5f7]" data-testid="roadmap-guides">
                <p className="apple-eyebrow mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Guides
                </p>
                <ResourceList
                  items={active.articles}
                  icon={BookOpen}
                  empty="Guides appear when the AI roadmap loads."
                  testid="roadmap-guides-list"
                />
              </div>
              <div className="apple-tile min-h-0 bg-[#f5f5f7]" data-testid="roadmap-videos">
                <p className="apple-eyebrow mb-3 flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5" /> Videos
                </p>
                <ResourceList
                  items={active.videos}
                  icon={PlayCircle}
                  empty="Video links appear when the AI roadmap loads."
                  testid="roadmap-videos-list"
                />
              </div>
            </aside>
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">
            {loading ? "Building your personalized roadmap…" : "No roadmap weeks yet. Retake Career GPS."}
          </p>
        )}

        <div className="mt-14 apple-cta-row">
          <Link
            to="/jobs"
            className="apple-btn apple-btn-dark"
            data-testid="roadmap-see-jobs"
          >
            See jobs for {role}
          </Link>
          <Link
            to={`/mentorship?role=${encodeURIComponent(role)}&source=career-gps-roadmap`}
            className="apple-btn apple-btn-whatsapp"
            data-testid="roadmap-mentorship"
          >
            Book a mentor call
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
