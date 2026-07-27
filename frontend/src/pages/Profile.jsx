import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Check, Lock, Save } from "lucide-react";

const REQUIRED_FIELDS = ["full_name", "email", "phone", "location", "linkedin_url"];
const OPTIONAL_FIELDS = ["college_or_company", "interested_role", "bio", "portfolio_url"];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

const ROLES = ["Product", "Growth", "AI Ops", "Design", "Marketing", "Sales", "Not Sure"];

const EMPTY_PROFILE = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  linkedin_url: "",
  college_or_company: "",
  interested_role: "",
  bio: "",
  portfolio_url: "",
};

const PHONE_RE = /^\+?[0-9\s\-()]{7,15}$/;
const LINKEDIN_RE = /^https?:\/\/(www\.|in\.)?linkedin\.com\/(in|pub|company)\/[A-Za-z0-9_\-./]+\/?$/i;
const URL_RE = /^https?:\/\/[^\s]+$/i;

function storageKey(email) {
  return `prepalign_profile_${(email || "anonymous").toLowerCase()}`;
}

function Field({ id, label, required, children, error, hint }) {
  return (
    <div>
      <Label htmlFor={id} className="apple-label">
        {label} {required ? <span className="text-neutral-950">*</span> : <span className="text-neutral-400 normal-case font-normal">(optional)</span>}
      </Label>
      <div className="mt-2">{children}</div>
      {hint && !error ? <p className="mt-1.5 text-xs text-neutral-500">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-red-600" data-testid={`error-${id}`}>{error}</p> : null}
    </div>
  );
}

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (loading) return;
    if (!user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);

  // Hydrate from localStorage (or pre-fill from user)
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(storageKey(user.email));
      const stored = raw ? JSON.parse(raw) : null;
      setForm({
        ...EMPTY_PROFILE,
        full_name: stored?.full_name || user.name || "",
        email: stored?.email || user.email || "",
        phone: stored?.phone || "",
        location: stored?.location || "",
        linkedin_url: stored?.linkedin_url || "",
        college_or_company: stored?.college_or_company || "",
        interested_role: stored?.interested_role || "",
        bio: stored?.bio || "",
        portfolio_url: stored?.portfolio_url || "",
      });
    } catch {
      setForm({ ...EMPTY_PROFILE, full_name: user.name || "", email: user.email || "" });
    }
  }, [user]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) next.full_name = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (!form.phone.trim()) next.phone = "Phone is required.";
    else if (!PHONE_RE.test(form.phone.trim())) next.phone = "Enter a valid phone number.";
    if (!form.location.trim()) next.location = "Location is required.";
    if (!form.linkedin_url.trim()) next.linkedin_url = "LinkedIn URL is required.";
    else if (!LINKEDIN_RE.test(form.linkedin_url.trim())) next.linkedin_url = "Use a full URL like https://www.linkedin.com/in/your-handle";
    if (form.portfolio_url && !URL_RE.test(form.portfolio_url.trim())) next.portfolio_url = "Use a full URL starting with http(s)://";
    return next;
  };

  const completion = useMemo(() => {
    const filled = ALL_FIELDS.filter((k) => String(form[k] ?? "").trim().length > 0).length;
    return Math.round((filled / ALL_FIELDS.length) * 100);
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      // Simulated save (localStorage)
      await new Promise((r) => setTimeout(r, 450));
      const payload = {
        ...form,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(storageKey(user.email), JSON.stringify(payload));
      toast.success("Profile saved!");
    } catch {
      toast.error("Couldn’t save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center text-sm text-neutral-500">Loading…</div>;
  }

  return (
    <div className="apple-page apple-page-y text-left" data-testid="page-profile">
      <p className="apple-eyebrow mb-4">Profile</p>
      <h1 className="apple-headline">
        Complete Your Profile
      </h1>
      <p className="apple-subhead mt-5">
        Build your professional profile to unlock opportunities, mentorship, and webinars.
      </p>

      {/* Completion bar */}
      <div className="mt-10 apple-panel max-w-2xl" data-testid="profile-completion">
        <div className="flex items-center justify-between mb-3">
          <p className="apple-eyebrow">Profile completion</p>
          <p className="text-sm font-bold tracking-tight">{completion}%</p>
        </div>
        <div className="apple-progress" aria-hidden="true">
          <div
            className="h-full bg-pa-brand rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion === 100 ? (
          <p className="mt-3 text-xs text-neutral-500 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Looking sharp. Your profile is complete.
          </p>
        ) : (
          <p className="mt-3 text-xs text-neutral-500">
            Fill optional fields to stand out to mentors and recruiters.
          </p>
        )}
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mt-8 apple-panel max-w-2xl"
        data-testid="profile-form"
        noValidate
      >
        <p className="apple-eyebrow mb-1">Required</p>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-6">The essentials</h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="full_name" label="Full Name" required error={errors.full_name}>
            <Input
              id="full_name" data-testid="profile-input-name"
              value={form.full_name} onChange={(e) => update("full_name", e.target.value)}
              className="rounded-xl border border-[#d2d2d7] h-11 text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </Field>

          <Field id="email" label="Email Address" required error={errors.email}>
            <Input
              id="email" type="email" data-testid="profile-input-email"
              value={form.email} onChange={(e) => update("email", e.target.value)}
              className="rounded-xl border border-[#d2d2d7] h-11 focus-visible:ring-0 focus-visible:ring-offset-0 bg-neutral-50"
              readOnly
            />
          </Field>

          <Field id="phone" label="Phone Number" required error={errors.phone}>
            <Input
              id="phone" inputMode="tel" placeholder="+91 98xxxxxxxx"
              data-testid="profile-input-phone"
              value={form.phone} onChange={(e) => update("phone", e.target.value)}
              className="rounded-xl border border-[#d2d2d7] h-11 text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </Field>

          <Field id="location" label="Current Location" required error={errors.location}>
            <Input
              id="location" placeholder="City, State"
              data-testid="profile-input-location"
              value={form.location} onChange={(e) => update("location", e.target.value)}
              className="rounded-xl border border-[#d2d2d7] h-11 text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </Field>

          <div className="sm:col-span-2">
            <Field
              id="linkedin_url" label="LinkedIn URL" required
              error={errors.linkedin_url}
              hint="Example: https://www.linkedin.com/in/your-handle"
            >
              <Input
                id="linkedin_url" type="url" placeholder="https://www.linkedin.com/in/your-handle"
                data-testid="profile-input-linkedin"
                value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)}
                className="rounded-xl border border-[#d2d2d7] h-11 text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-neutral-200 my-10" />

        <p className="apple-eyebrow mb-1">Optional</p>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1d1d1f] mb-6">Stand out</h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field id="college_or_company" label="Current College / Company">
            <Input
              id="college_or_company" data-testid="profile-input-college"
              placeholder="e.g. SRCC / Razorpay"
              value={form.college_or_company} onChange={(e) => update("college_or_company", e.target.value)}
              className="rounded-xl border border-[#d2d2d7] h-11 text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </Field>

          <Field id="interested_role" label="Interested Role">
            <select
              id="interested_role" data-testid="profile-input-role"
              value={form.interested_role}
              onChange={(e) => update("interested_role", e.target.value)}
              className="w-full h-11 rounded-xl border border-[#d2d2d7] px-3 bg-white text-sm focus:outline-none"
            >
              <option value="">Choose a role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field id="portfolio_url" label="Portfolio URL" error={errors.portfolio_url} hint="Personal site, Notion, Behance, GitHub: anything that shows your work.">
              <Input
                id="portfolio_url" type="url" placeholder="https://yourname.com"
                data-testid="profile-input-portfolio"
                value={form.portfolio_url} onChange={(e) => update("portfolio_url", e.target.value)}
                className="rounded-xl border border-[#d2d2d7] h-11 text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field id="bio" label="Short Bio">
              <Textarea
                id="bio" rows={4} maxLength={400}
                data-testid="profile-input-bio"
                placeholder="One paragraph: who you are, what you’re building, what you want next."
                value={form.bio} onChange={(e) => update("bio", e.target.value)}
                className="rounded-xl border border-[#d2d2d7] focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <p className="mt-1.5 text-xs text-neutral-400">{(form.bio || "").length}/400</p>
            </Field>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-neutral-500 flex items-start gap-2 max-w-md">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Your information is private and only used to improve mentorship and career opportunities.
          </p>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 apple-btn apple-btn-dark disabled:opacity-60 w-full sm:w-auto"
            data-testid="profile-save-btn"
          >
            {saving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
