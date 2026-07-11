import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, Check, RefreshCcw, Compass, Zap, Target } from "lucide-react";
import { API } from "../lib/constants";
import { STEPS, DRAFT_KEY, RESULT_KEY, ROADMAP_PROGRESS_KEY } from "../data/career_gps_config";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";

const EMPTY_ANSWERS = {
  profile: { current_status: "", degree: "", graduation_year: "" },
  interests: [],
  styles: [],
  skills: {},
  goals: {},
};

// -------- Utilities --------
function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveDraft(state) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch { /* noop */ }
}

// -------- Question atoms --------
function RadioGroup({ value, onChange, options, testid }) {
  return (
    <div className="grid sm:grid-cols-2 gap-2" data-testid={testid}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`btn-press text-left px-4 py-3 border-2 text-sm font-semibold tracking-tight ${
              active ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-950 border-neutral-300 hover:border-neutral-950"
            }`}
            data-testid={`${testid}-opt-${opt.replace(/\s+/g, "-").toLowerCase()}`}
          >
            <span className="inline-flex items-center gap-2">
              <span className={`w-2.5 h-2.5 border-2 ${active ? "border-white bg-white" : "border-neutral-400"}`} />
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}
function SelectField({ value, onChange, options, testid }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 border-2 border-neutral-950 rounded-none px-3 text-sm bg-white"
      data-testid={testid}
    >
      <option value="">Select…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
function MultiChips({ values, onChange, options, testid }) {
  const toggle = (opt) => {
    const set = new Set(values);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    onChange(Array.from(set));
  };
  return (
    <div className="flex flex-wrap gap-2" data-testid={testid}>
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`btn-press px-3.5 py-2 border-2 text-sm font-semibold ${
              active ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-950 border-neutral-300 hover:border-neutral-950"
            }`}
            data-testid={`${testid}-opt-${opt.replace(/\s+/g, "-").toLowerCase()}`}
          >
            {active ? <Check className="w-3.5 h-3.5 inline -mt-0.5 mr-1" /> : null}{opt}
          </button>
        );
      })}
    </div>
  );
}
function Rating({ value, onChange, testid }) {
  return (
    <div className="flex items-center gap-2" data-testid={testid}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 border-2 font-black text-sm transition-colors ${
              active ? "bg-neutral-950 text-white border-neutral-950" : "bg-white text-neutral-500 border-neutral-300 hover:border-neutral-950"
            }`}
            data-testid={`${testid}-${n}`}
          >
            {n}
          </button>
        );
      })}
      <span className="ml-2 text-xs text-neutral-500">{value ? `${value}/5` : "not rated"}</span>
    </div>
  );
}

// -------- Analyzing screen --------
function Analyzing() {
  return (
    <motion.div
      key="analyzing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[70vh] flex items-center justify-center flex-col px-6"
      data-testid="career-gps-analyzing"
    >
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-2 border-neutral-950" />
        <motion.div
          className="absolute inset-0 border-2 border-[#25D366]"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className="w-9 h-9 text-neutral-950 animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      </div>
      <p className="label-eyebrow mb-3">Career GPS</p>
      <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-center">Analyzing your Career GPS…</h2>
      <p className="mt-4 text-neutral-500 text-sm">Matching your signals across 10 modern roles.</p>
    </motion.div>
  );
}

// -------- Results screen --------
function MatchBar({ percent }) {
  return (
    <div className="w-full h-1.5 bg-neutral-100 relative">
      <motion.div
        className="absolute inset-y-0 left-0 bg-neutral-950"
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function RoadmapChecklist({ topRole, roadmap }) {
  const key = `${ROADMAP_PROGRESS_KEY}::${topRole}`;
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(done)); } catch { /* noop */ }
  }, [done, key]);

  const total = roadmap.length;
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div data-testid="career-gps-roadmap">
      <div className="flex items-center justify-between mb-3">
        <p className="label-eyebrow">Your 8-week roadmap · {topRole}</p>
        <p className="text-sm font-bold" data-testid="roadmap-progress-percent">{pct}% complete</p>
      </div>
      <div className="h-2 w-full bg-neutral-100 mb-6">
        <motion.div
          className="h-2 bg-neutral-950"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <ol className="border-t border-l border-neutral-200">
        {roadmap.map((r) => {
          const isDone = !!done[r.week];
          return (
            <li key={r.week} className={`border-r border-b border-neutral-200 flex items-start gap-3 p-4 md:p-5 transition-colors ${isDone ? "bg-neutral-50" : ""}`}>
              <button
                type="button"
                onClick={() => setDone((d) => ({ ...d, [r.week]: !d[r.week] }))}
                aria-pressed={isDone}
                className={`w-6 h-6 shrink-0 border-2 border-neutral-950 flex items-center justify-center transition-colors ${isDone ? "bg-neutral-950 text-white" : "bg-white text-transparent"}`}
                data-testid={`roadmap-check-${r.week}`}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-1">Week {r.week}</p>
                <p className={`text-sm md:text-base font-semibold tracking-tight ${isDone ? "line-through text-neutral-400" : "text-neutral-950"}`}>
                  {r.milestone}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Results({ result, onReset }) {
  const top = result.top_matches?.[0];
  return (
    <Reveal>
      <div data-testid="career-gps-results">
        <p className="label-eyebrow mb-3">Your Career GPS</p>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
          You&apos;re built for<br />
          <span className="inline-block mt-2 px-3 border-2 border-neutral-950 bg-[#25D366] text-black">
            {top?.role || "a modern startup role"}
          </span>
        </h1>
        <p className="mt-6 text-neutral-600 max-w-xl">
          Based on your interests, working style, skills, and goals — here are the top 5 matches for you in 2026.
        </p>

        <div className="mt-10 border-t border-l border-neutral-200">
          {result.top_matches.map((m, i) => (
            <div key={m.role} className="border-r border-b border-neutral-200 p-6 md:p-8" data-testid={`match-${i}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="label-eyebrow">Match #{i + 1}</p>
                  <h3 className="text-2xl md:text-3xl font-black tracking-tighter mt-1">{m.role}</h3>
                </div>
                <div className="text-right">
                  <p className="text-4xl md:text-5xl font-black tracking-tighter">{m.match}%</p>
                  <p className="label-eyebrow">match</p>
                </div>
              </div>
              <div className="mt-4"><MatchBar percent={m.match} /></div>

              <div className="mt-6 grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="label-eyebrow mb-1.5 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Why you&apos;re a fit</p>
                  <p className="text-neutral-700 text-sm leading-relaxed">{m.why}</p>
                </div>
                <div>
                  <p className="label-eyebrow mb-1.5">Average salary</p>
                  <p className="text-neutral-950 font-bold">{m.salary}</p>
                </div>
              </div>

              <div className="mt-5">
                <p className="label-eyebrow mb-2 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Skills to learn</p>
                <div className="flex flex-wrap gap-2">
                  {m.skills_to_learn.map((s) => (
                    <span key={s} className="text-xs font-bold px-2.5 py-1 border border-neutral-950 bg-white">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <RoadmapChecklist topRole={result.top_role} roadmap={result.roadmap} />
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/jobs"
            className="btn-press inline-flex items-center gap-2 bg-neutral-950 text-white px-6 py-3.5 font-bold hard-shadow"
            data-testid="results-see-jobs"
          >
            See live jobs for {result.top_role} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/mentorship"
            className="btn-press inline-flex items-center gap-2 border-2 border-neutral-950 px-6 py-3.5 font-bold"
            data-testid="results-mentorship"
          >
            Talk to a mentor
          </Link>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-3.5 font-bold text-sm text-neutral-500 hover:text-neutral-950"
            data-testid="results-retake"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Retake assessment
          </button>
        </div>
      </div>
    </Reveal>
  );
}

// -------- Main page --------
export default function CareerGPS() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [phase, setPhase] = useState("wizard"); // wizard | analyzing | results
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Hydrate from storage
  useEffect(() => {
    const draft = loadDraft();
    if (draft?.answers) setAnswers({ ...EMPTY_ANSWERS, ...draft.answers });
    if (typeof draft?.step === "number") setStep(draft.step);
    try {
      const stored = localStorage.getItem(RESULT_KEY);
      if (stored) {
        setResult(JSON.parse(stored));
        setPhase("results");
      }
    } catch { /* noop */ }
  }, []);

  // Autosave
  useEffect(() => {
    if (phase !== "wizard") return;
    saveDraft({ step, answers });
  }, [step, answers, phase]);

  const currentStep = STEPS[step];
  const total = STEPS.length;
  const progress = Math.round(((step + 1) / total) * 100);

  const canProceed = useMemo(() => {
    const s = currentStep;
    if (!s) return false;
    for (const q of s.questions) {
      if (q.type === "radio" || q.type === "select") {
        const container = s.id === "about" ? answers.profile : (s.id === "goals" ? answers.goals : answers);
        if (!container[q.id]) return false;
      } else if (q.type === "multi") {
        const arr = answers[q.id] || [];
        if (arr.length < (q.min || 1)) return false;
      } else if (q.type === "rate") {
        if (!answers.skills[q.id]) return false;
      }
    }
    return true;
  }, [answers, currentStep]);

  const setAnswer = (sectionId, questionId, value) => {
    setAnswers((prev) => {
      if (sectionId === "about") return { ...prev, profile: { ...prev.profile, [questionId]: value } };
      if (sectionId === "goals") return { ...prev, goals: { ...prev.goals, [questionId]: value } };
      if (sectionId === "skills") return { ...prev, skills: { ...prev.skills, [questionId]: value } };
      // interests / styles are direct arrays on answers root
      return { ...prev, [questionId]: value };
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setPhase("analyzing");
    try {
      const [res] = await Promise.all([
        axios.post(`${API}/career-gps/assess`, {
          profile: answers.profile,
          interests: answers.interests,
          styles: answers.styles,
          skills: answers.skills,
          goals: answers.goals,
        }, { withCredentials: true, timeout: 30000 }),
        new Promise((r) => setTimeout(r, 4000)),  // guarantee ≥4s analyzing screen
      ]);
      setResult(res.data);
      try { localStorage.setItem(RESULT_KEY, JSON.stringify(res.data)); } catch { /* noop */ }
      setPhase("results");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setPhase("wizard");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(RESULT_KEY);
    } catch { /* noop */ }
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
    setResult(null);
    setPhase("wizard");
  };

  // ---- Render ----
  if (phase === "analyzing") return <div className="mx-auto max-w-4xl px-5 sm:px-8 py-8"><AnimatePresence><Analyzing /></AnimatePresence></div>;
  if (phase === "results" && result) return <div className="mx-auto max-w-4xl px-5 sm:px-8 py-10 md:py-16"><Results result={result} onReset={resetAll} /></div>;

  // Wizard
  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 py-10 md:py-16" data-testid="page-career-gps">
      <div className="mb-8">
        <p className="label-eyebrow mb-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Career GPS</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.95]">
          Find your best-fit role in 60 seconds.
        </h1>
        <p className="mt-4 text-neutral-600">15 questions across 5 sections. Autosaved — you can leave and come back.</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8" data-testid="career-gps-progress">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold tracking-tight">Step {step + 1} of {total} · {currentStep.title}</p>
          <p className="text-xs font-bold">{progress}%</p>
        </div>
        <div className="h-1.5 bg-neutral-100">
          <motion.div
            className="h-1.5 bg-neutral-950"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="border-2 border-neutral-950 bg-white p-6 md:p-10 hard-shadow"
        >
          <p className="label-eyebrow mb-1">Section {step + 1}</p>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">{currentStep.title}</h2>
          <p className="mt-1 text-neutral-500 text-sm">{currentStep.subtitle}</p>

          <div className="mt-8 space-y-8">
            {currentStep.questions.map((q) => {
              const testid = `q-${currentStep.id}-${q.id.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
              return (
                <div key={q.id}>
                  <p className="text-sm font-bold tracking-tight mb-3">{q.label}</p>
                  {q.type === "radio" && (
                    <RadioGroup
                      value={currentStep.id === "about" ? answers.profile[q.id] : (currentStep.id === "goals" ? answers.goals[q.id] : answers[q.id])}
                      onChange={(v) => setAnswer(currentStep.id, q.id, v)}
                      options={q.options}
                      testid={testid}
                    />
                  )}
                  {q.type === "select" && (
                    <SelectField
                      value={currentStep.id === "about" ? answers.profile[q.id] : answers.goals[q.id]}
                      onChange={(v) => setAnswer(currentStep.id, q.id, v)}
                      options={q.options}
                      testid={testid}
                    />
                  )}
                  {q.type === "multi" && (
                    <MultiChips
                      values={answers[q.id] || []}
                      onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
                      options={q.options}
                      testid={testid}
                    />
                  )}
                  {q.type === "rate" && (
                    <Rating
                      value={answers.skills[q.id] || 0}
                      onChange={(v) => setAnswer("skills", q.id, v)}
                      testid={testid}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-press inline-flex items-center gap-2 px-4 py-3 font-bold text-sm border-2 border-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid="career-gps-prev"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>
        {step < total - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(total - 1, s + 1))}
            disabled={!canProceed}
            className="btn-press inline-flex items-center gap-2 bg-neutral-950 text-white px-5 py-3 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="career-gps-next"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed || submitting}
            className="btn-press inline-flex items-center gap-2 bg-[#25D366] border-2 border-neutral-950 text-black px-5 py-3 font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="career-gps-submit"
          >
            <Sparkles className="w-4 h-4" /> Get my Career GPS
          </button>
        )}
      </div>
    </div>
  );
}
