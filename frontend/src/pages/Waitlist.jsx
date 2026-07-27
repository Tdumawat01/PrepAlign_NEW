import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { API } from "../lib/constants";
import { getUtmParams } from "../lib/utm";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "../components/ui/select";
import { Reveal } from "../components/Reveal";

const FIELD =
  "mt-2 h-11 rounded-xl border border-[#d2d2d7] text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-neutral-950 bg-white";

const CAREER_GOALS = [
  "Land a better job",
  "Switch careers",
  "Break into AI",
  "Founder's Office",
  "Product",
  "Product Operations",
  "GTM Engineering",
  "Leadership",
  "Other",
];

const CHALLENGES = [
  "Finding relevant jobs",
  "Getting interview calls",
  "Resume",
  "Networking",
  "Cold outreach",
  "Interview preparation",
  "Career clarity",
  "Building projects",
  "Standing out from other applicants",
  "Other",
];

const APPLICATIONS = ["0–10", "10–30", "30–75", "75+"];
const AI_TOOLS = ["ChatGPT", "Claude", "Perplexity", "Gemini", "None", "Other"];
const WILLINGNESS = ["Definitely", "Maybe", "Not right now"];

const EMPTY = {
  full_name: "",
  email: "",
  linkedin_url: "",
  location: "",
  current_role: "",
  years_experience: "",
  target_role: "",
  current_company: "",
  career_goal: "",
  biggest_challenge: "",
  applications_last_30_days: "",
  ai_tools: [],
  one_problem: "",
  willingness_to_pay: "",
};

function Section({ title, children }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold tracking-tight text-[#0a0a0b] border-b border-black/[0.06] pb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function FieldWrap({ id, label, required, hint, children }) {
  return (
    <div>
      <Label htmlFor={id} className="apple-label">
        {label}{" "}
        {required ? (
          <span className="text-neutral-950">*</span>
        ) : (
          <span className="normal-case font-normal text-neutral-400">(optional)</span>
        )}
      </Label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

export default function Waitlist() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleTool = (tool) => {
    setForm((f) => {
      const set = new Set(f.ai_tools);
      if (tool === "None") {
        return { ...f, ai_tools: set.has("None") ? [] : ["None"] };
      }
      set.delete("None");
      set.has(tool) ? set.delete(tool) : set.add(tool);
      return { ...f, ai_tools: Array.from(set) };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "full_name", "email", "location", "current_role", "years_experience",
      "target_role", "career_goal", "biggest_challenge",
      "applications_last_30_days", "one_problem", "willingness_to_pay",
    ];
    for (const k of required) {
      if (!String(form[k] || "").trim()) {
        toast.error("Please fill all required fields");
        return;
      }
    }
    if (!form.ai_tools.length) {
      toast.error("Select at least one AI tool option");
      return;
    }
    if (form.linkedin_url.trim()) {
      const url = form.linkedin_url.trim();
      if (!/^https?:\/\//i.test(url)) {
        toast.error("LinkedIn URL must start with http:// or https://");
        return;
      }
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/waitlist/join`, {
        ...form,
        linkedin_url: form.linkedin_url.trim() || null,
        current_company: form.current_company.trim() || null,
        ...getUtmParams(),
      });
      navigate("/waitlist/thanks", { replace: true });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const msg = typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail[0]?.msg || "Please check your answers"
          : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="page-waitlist" className="bg-[#fafafa]">
      <section className="border-b border-black/[0.06] bg-white">
        <div className="apple-page apple-page-y">
          <Reveal>
            <p className="apple-eyebrow mb-4">Early access</p>
            <h1 className="apple-headline max-w-3xl">
              Join the PrepAlign waitlist
            </h1>
            <p className="apple-subhead mt-5">
              Tell us about your career goals. Early members shape the product and get exclusive intelligence before public launch.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="apple-page apple-page-y">
        <Reveal>
          <form
            onSubmit={handleSubmit}
            className="apple-panel max-w-2xl space-y-10"
            data-testid="waitlist-form"
            noValidate
          >
            <Section title="Basic information">
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldWrap id="full_name" label="Full Name" required>
                  <Input
                    id="full_name"
                    data-testid="waitlist-input-name"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    className={FIELD}
                    autoComplete="name"
                  />
                </FieldWrap>
                <FieldWrap id="email" label="Email Address" required>
                  <Input
                    id="email"
                    type="email"
                    data-testid="waitlist-input-email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={FIELD}
                    autoComplete="email"
                  />
                </FieldWrap>
                <FieldWrap id="linkedin_url" label="LinkedIn Profile">
                  <Input
                    id="linkedin_url"
                    type="url"
                    placeholder="https://www.linkedin.com/in/…"
                    data-testid="waitlist-input-linkedin"
                    value={form.linkedin_url}
                    onChange={(e) => update("linkedin_url", e.target.value)}
                    className={FIELD}
                  />
                </FieldWrap>
                <FieldWrap id="location" label="Current Location" required>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    data-testid="waitlist-input-location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    className={FIELD}
                  />
                </FieldWrap>
              </div>
            </Section>

            <Section title="Career information">
              <div className="grid sm:grid-cols-2 gap-5">
                <FieldWrap id="current_role" label="Current Role" required>
                  <Input
                    id="current_role"
                    data-testid="waitlist-input-current-role"
                    value={form.current_role}
                    onChange={(e) => update("current_role", e.target.value)}
                    className={FIELD}
                  />
                </FieldWrap>
                <FieldWrap id="years_experience" label="Years of Experience" required>
                  <Input
                    id="years_experience"
                    placeholder="e.g. 2"
                    data-testid="waitlist-input-experience"
                    value={form.years_experience}
                    onChange={(e) => update("years_experience", e.target.value)}
                    className={FIELD}
                  />
                </FieldWrap>
                <FieldWrap id="target_role" label="Target Role" required>
                  <Input
                    id="target_role"
                    data-testid="waitlist-input-target-role"
                    value={form.target_role}
                    onChange={(e) => update("target_role", e.target.value)}
                    className={FIELD}
                  />
                </FieldWrap>
                <FieldWrap id="current_company" label="Current Company">
                  <Input
                    id="current_company"
                    data-testid="waitlist-input-company"
                    value={form.current_company}
                    onChange={(e) => update("current_company", e.target.value)}
                    className={FIELD}
                  />
                </FieldWrap>
              </div>
            </Section>

            <Section title="Career goals">
              <FieldWrap id="career_goal" label="Biggest career goal over the next 12 months" required>
                <Select value={form.career_goal} onValueChange={(v) => update("career_goal", v)}>
                  <SelectTrigger className={`${FIELD} focus:ring-0 focus:ring-offset-0`} data-testid="waitlist-select-goal">
                    <SelectValue placeholder="Select a goal" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CAREER_GOALS.map((g) => (
                      <SelectItem key={g} value={g} className="rounded-lg">{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrap>
            </Section>

            <Section title="Biggest challenge">
              <FieldWrap id="biggest_challenge" label="What's stopping you today?" required>
                <Select value={form.biggest_challenge} onValueChange={(v) => update("biggest_challenge", v)}>
                  <SelectTrigger className={`${FIELD} focus:ring-0 focus:ring-offset-0`} data-testid="waitlist-select-challenge">
                    <SelectValue placeholder="Select a challenge" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CHALLENGES.map((c) => (
                      <SelectItem key={c} value={c} className="rounded-lg">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldWrap>
            </Section>

            <Section title="Application activity">
              <FieldWrap id="applications_last_30_days" label="Applications in the last 30 days" required>
                <div className="mt-3 flex flex-wrap gap-2" data-testid="waitlist-apps-group">
                  {APPLICATIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update("applications_last_30_days", opt)}
                      className={`apple-chip ${form.applications_last_30_days === opt ? "apple-chip-active" : ""}`}
                      data-testid={`waitlist-apps-${opt}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </FieldWrap>
            </Section>

            <Section title="AI usage">
              <FieldWrap id="ai_tools" label="AI tools you use for your job search" required>
                <div className="mt-3 flex flex-wrap gap-2" data-testid="waitlist-ai-group">
                  {AI_TOOLS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleTool(opt)}
                      className={`apple-chip ${form.ai_tools.includes(opt) ? "apple-chip-active" : ""}`}
                      data-testid={`waitlist-ai-${opt.toLowerCase()}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </FieldWrap>
            </Section>

            <Section title="Personalization">
              <FieldWrap id="one_problem" label="If PrepAlign could solve one problem for you, what would it be?" required>
                <Textarea
                  id="one_problem"
                  rows={4}
                  maxLength={2000}
                  data-testid="waitlist-input-problem"
                  value={form.one_problem}
                  onChange={(e) => update("one_problem", e.target.value)}
                  className="mt-2 rounded-xl border border-[#d2d2d7] text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-neutral-950"
                />
                <p className="mt-1.5 text-xs text-neutral-400">{form.one_problem.length}/2000</p>
              </FieldWrap>
            </Section>

            <Section title="Willingness to pay">
              <FieldWrap id="willingness_to_pay" label="If PrepAlign significantly increased your interview chances, would you pay?" required>
                <div className="mt-3 flex flex-wrap gap-2" data-testid="waitlist-pay-group">
                  {WILLINGNESS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => update("willingness_to_pay", opt)}
                      className={`apple-chip ${form.willingness_to_pay === opt ? "apple-chip-active" : ""}`}
                      data-testid={`waitlist-pay-${opt.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </FieldWrap>
            </Section>

            <button
              type="submit"
              disabled={submitting}
              className="apple-btn apple-btn-dark w-full justify-center font-semibold disabled:opacity-60"
              data-testid="waitlist-submit-btn"
            >
              {submitting ? "Submitting…" : "Join the Waitlist"}
            </button>
            <p className="text-xs text-neutral-500 text-center">
              Limited early-access seats. No spam — just intelligence worth reading.
            </p>
          </form>
        </Reveal>
      </section>
    </div>
  );
}
