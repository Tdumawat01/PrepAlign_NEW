import React, { useState } from "react";
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

const HELP_OPTIONS = [
  "Resume", "Interviews", "Career clarity", "Networking",
];

export default function Mentorship() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    current_status: "", target_role: "",
    biggest_challenge: "", help_needed: "",
    referral_source: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-24 md:py-32 text-center" data-testid="mentorship-success">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-950 text-white mb-8">
          <Check className="w-8 h-8" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[0.95]">
          Shukriya!
        </h1>
        <p className="mt-6 text-lg md:text-xl text-neutral-700 font-semibold">
          हम आपसे 24-48 hours में संपर्क करेंगे
        </p>
        <p className="mt-3 text-neutral-500">
          We’ve received your mentorship request. Keep an eye on your email & phone.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="page-mentorship">
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16 md:py-24">
          <p className="label-eyebrow mb-5">1:1 Mentorship</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] max-w-3xl">
            Get 1:1 Career<br />Guidance.
          </h1>
          <p className="mt-6 text-lg text-neutral-600 max-w-2xl">
            One call. Honest feedback. A clear action plan for the next 30 days.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 sm:px-8 py-16">
        <form
          onSubmit={handleSubmit}
          className="border-2 border-neutral-950 bg-white p-6 md:p-10 hard-shadow"
          data-testid="mentorship-form"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider">Name</Label>
              <Input
                data-testid="mentorship-input-name"
                value={form.name} onChange={(e) => update("name", e.target.value)}
                className="mt-2 rounded-none border-neutral-950 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider">Email</Label>
              <Input
                type="email" data-testid="mentorship-input-email"
                value={form.email} onChange={(e) => update("email", e.target.value)}
                className="mt-2 rounded-none border-neutral-950 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider">Phone</Label>
              <Input
                data-testid="mentorship-input-phone"
                value={form.phone} onChange={(e) => update("phone", e.target.value)}
                className="mt-2 rounded-none border-neutral-950 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider">Current Status</Label>
              <Input
                data-testid="mentorship-input-status"
                placeholder="e.g. Final year, B.Com"
                value={form.current_status} onChange={(e) => update("current_status", e.target.value)}
                className="mt-2 rounded-none border-neutral-950 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Target Role</Label>
              <Input
                data-testid="mentorship-input-target"
                placeholder="e.g. Product Analyst at an early-stage AI startup"
                value={form.target_role} onChange={(e) => update("target_role", e.target.value)}
                className="mt-2 rounded-none border-neutral-950 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Biggest Challenge</Label>
              <Textarea
                data-testid="mentorship-input-challenge"
                rows={4}
                value={form.biggest_challenge} onChange={(e) => update("biggest_challenge", e.target.value)}
                className="mt-2 rounded-none border-neutral-950 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider">Help Needed</Label>
              <Select value={form.help_needed} onValueChange={(v) => update("help_needed", v)}>
                <SelectTrigger
                  className="mt-2 rounded-none border-neutral-950 h-11 focus:ring-0 focus:ring-offset-0"
                  data-testid="mentorship-select-help"
                >
                  <SelectValue placeholder="Choose an area" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-neutral-950">
                  {HELP_OPTIONS.map((o) => (
                    <SelectItem
                      key={o} value={o}
                      className="rounded-none"
                      data-testid={`mentorship-help-option-${o.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-bold uppercase tracking-wider">
                How did you hear about us? <span className="text-neutral-400 font-normal normal-case">(optional)</span>
              </Label>
              <Input
                data-testid="mentorship-input-referral"
                placeholder="Friend's name, Instagram, LinkedIn…"
                value={form.referral_source}
                onChange={(e) => update("referral_source", e.target.value)}
                className="mt-2 rounded-none border-neutral-950 h-11 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <button
            type="submit" disabled={submitting}
            className="mt-7 w-full bg-neutral-950 text-white py-4 font-bold hover:bg-neutral-800 disabled:opacity-60"
            data-testid="mentorship-submit-btn"
          >
            {submitting ? "Sending…" : "Request Mentorship"}
          </button>
        </form>
      </section>
    </div>
  );
}
