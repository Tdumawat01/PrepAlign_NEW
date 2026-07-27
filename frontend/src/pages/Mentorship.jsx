import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Check } from "lucide-react";
import { Reveal } from "../components/Reveal";

const HELP_OPTIONS = [
  "Resume", "Interviews", "Career clarity", "Networking",
];

const FIELD =
  "mt-2 h-11 rounded-xl border border-[#d2d2d7] text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-neutral-950";

export default function Mentorship() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    current_status: "", target_role: "",
    biggest_challenge: "", help_needed: "",
    referral_source: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const role = searchParams.get("role");
    if (role) {
      setForm((f) => f.target_role ? f : { ...f, target_role: role });
    }
  }, [searchParams]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const REQUIRED = ["name", "email", "phone", "current_status", "target_role", "biggest_challenge", "help_needed"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const k of REQUIRED) {
      if (!form[k]) { toast.error("Please fill all fields"); return; }
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/mentorship/request`, { ...form, ...getUtmParams() });
      setSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="apple-page apple-page-y text-center" data-testid="mentorship-success">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pa-brand text-pa-on-brand mb-8">
          <Check className="w-8 h-8" strokeWidth={2.5} />
        </div>
        <h1 className="apple-headline">Shukriya!</h1>
        <p className="mt-6 text-lg md:text-xl text-[#1d1d1f] font-medium">
          हम आपसे 24-48 hours में संपर्क करेंगे
        </p>
        <p className="mt-3 apple-subhead apple-subhead-center">
          We’ve received your mentorship request. Keep an eye on your email &amp; phone.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="page-mentorship" className="bg-white text-left">
      <section className="border-b border-black/5">
        <div className="apple-page apple-page-y">
          <Reveal>
            <p className="apple-eyebrow mb-4">1:1 Mentorship</p>
            <h1 className="apple-headline">
              Get 1:1 career<br />guidance.
            </h1>
            <p className="apple-subhead mt-5">
              One call. Honest feedback. A clear action plan for the next 30 days.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="apple-band">
        <div className="apple-page apple-page-y">
          <Reveal>
            <form
              onSubmit={handleSubmit}
              className="apple-panel max-w-2xl"
              data-testid="mentorship-form"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label className="apple-label">Name</Label>
                  <Input
                    data-testid="mentorship-input-name"
                    value={form.name} onChange={(e) => update("name", e.target.value)}
                    className={FIELD}
                  />
                </div>
                <div>
                  <Label className="apple-label">Email</Label>
                  <Input
                    type="email" data-testid="mentorship-input-email"
                    value={form.email} onChange={(e) => update("email", e.target.value)}
                    className={FIELD}
                  />
                </div>
                <div>
                  <Label className="apple-label">Phone</Label>
                  <Input
                    data-testid="mentorship-input-phone"
                    value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    className={FIELD}
                  />
                </div>
                <div>
                  <Label className="apple-label">Current Status</Label>
                  <Input
                    data-testid="mentorship-input-status"
                    placeholder="e.g. Final year, B.Com"
                    value={form.current_status} onChange={(e) => update("current_status", e.target.value)}
                    className={FIELD}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="apple-label">Target Role</Label>
                  <Input
                    data-testid="mentorship-input-target"
                    placeholder="e.g. Product Analyst at an early-stage AI startup"
                    value={form.target_role} onChange={(e) => update("target_role", e.target.value)}
                    className={FIELD}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="apple-label">Biggest Challenge</Label>
                  <Textarea
                    data-testid="mentorship-input-challenge"
                    rows={4}
                    value={form.biggest_challenge} onChange={(e) => update("biggest_challenge", e.target.value)}
                    className="mt-2 rounded-xl border border-[#d2d2d7] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-neutral-950"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="apple-label">Help Needed</Label>
                  <Select value={form.help_needed} onValueChange={(v) => update("help_needed", v)}>
                    <SelectTrigger
                      className={`${FIELD} focus:ring-0 focus:ring-offset-0`}
                      data-testid="mentorship-select-help"
                    >
                      <SelectValue placeholder="Choose an area" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-neutral-200">
                      {HELP_OPTIONS.map((o) => (
                        <SelectItem
                          key={o} value={o}
                          className="rounded-lg"
                          data-testid={`mentorship-help-option-${o.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="apple-label">
                    How did you hear about us? <span className="normal-case font-normal text-neutral-400">(optional)</span>
                  </Label>
                  <Input
                    data-testid="mentorship-input-referral"
                    placeholder="Friend's name, Instagram, LinkedIn…"
                    value={form.referral_source}
                    onChange={(e) => update("referral_source", e.target.value)}
                    className={FIELD}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className="apple-btn apple-btn-dark mt-7 w-full sm:w-auto justify-center disabled:opacity-60"
                data-testid="mentorship-submit-btn"
              >
                {submitting ? "Sending…" : "Request Mentorship"}
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
