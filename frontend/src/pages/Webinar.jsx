import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { API, WHATSAPP_URL } from "../lib/constants";
import { getUtmParams } from "../lib/utm";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "../components/ui/select";
import { Check, MessageCircle, Mic, Users, Briefcase, GraduationCap } from "lucide-react";

const ROLES = [
  { value: "Product",  label: "Product" },
  { value: "Growth",   label: "Growth" },
  { value: "AI Ops",   label: "AI Ops" },
  { value: "Not Sure", label: "Not Sure" },
];

export default function Webinar() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", college: "", interested_role: "",
    referral_source: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const k of ["full_name", "email", "phone", "college", "interested_role"]) {
      if (!form[k]) {
        toast.error("Please fill all fields");
        return;
      }
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/webinar/register`, { ...form, ...getUtmParams() });
      setSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?.detail?.[0]?.msg || err?.response?.data?.detail || "Something went wrong";
      toast.error(typeof msg === "string" ? msg : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-3xl px-5 sm:px-8 py-24 md:py-32 text-center" data-testid="webinar-success">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-950 text-white mb-8">
          <Check className="w-8 h-8" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
          You’re in!
        </h1>
        <p className="mt-6 text-lg text-neutral-600">
          Join the WhatsApp group to get updates, reminders, and the live link.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-black px-8 py-4 font-bold border-2 border-neutral-950 hard-shadow"
            data-testid="webinar-whatsapp-cta"
          >
            <MessageCircle className="w-5 h-5" /> Join WhatsApp Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="page-webinar">
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16 md:py-24 grid md:grid-cols-12 gap-12">
          <div className="md:col-span-7">
            <p className="label-eyebrow mb-5">Free live workshop</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95]">
              How to Get a<br />Startup Job<br />Without Coding<br />in 2026.
            </h1>
            <p className="mt-6 text-lg text-neutral-600 max-w-xl">
              For students, fresh graduates & non-tech folks who are done being ignored by recruiters.
            </p>

            <div className="mt-12 grid sm:grid-cols-2 gap-0 border-t border-l border-neutral-200">
              {[
                { icon: Briefcase,     t: "Roadmap to AI & startup roles" },
                { icon: GraduationCap, t: "How to stand out without IIT/NIT" },
                { icon: Mic,           t: "Real interview questions" },
                { icon: Users,         t: "Networking & referral strategies" },
                { icon: Check,         t: "Live resume teardown" },
              ].map(({ icon: Icon, t }, i) => (
                <div
                  key={i}
                  className="border-r border-b border-neutral-200 p-6 flex items-start gap-4"
                  data-testid={`learn-item-${i}`}
                >
                  <Icon className="w-5 h-5 mt-1" strokeWidth={1.5} />
                  <p className="font-semibold tracking-tight">{t}</p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <p className="label-eyebrow mb-4">Who should attend</p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm">
                {["Final year students", "Fresh graduates", "Non-tech background", "People struggling to get interviews"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check className="w-4 h-4" /> {x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-5">
            <form
              onSubmit={handleSubmit}
              className="border-2 border-neutral-950 bg-white p-6 md:p-8 hard-shadow"
              data-testid="webinar-form"
            >
              <p className="label-eyebrow mb-2">Reserve your spot</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-6">Free · Online · Live Q&A</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-wider">Full Name</Label>
                  <Input
                    id="full_name" data-testid="webinar-input-name"
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    className="mt-2 rounded-none border-neutral-950 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-neutral-950 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider">Email</Label>
                  <Input
                    id="email" type="email" data-testid="webinar-input-email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-2 rounded-none border-neutral-950 focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider">Phone Number</Label>
                  <Input
                    id="phone" inputMode="tel" data-testid="webinar-input-phone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="mt-2 rounded-none border-neutral-950 focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                  />
                </div>
                <div>
                  <Label htmlFor="college" className="text-xs font-bold uppercase tracking-wider">College / Current Status</Label>
                  <Input
                    id="college" data-testid="webinar-input-college"
                    value={form.college}
                    onChange={(e) => update("college", e.target.value)}
                    className="mt-2 rounded-none border-neutral-950 focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider">Interested Role</Label>
                  <Select value={form.interested_role} onValueChange={(v) => update("interested_role", v)}>
                    <SelectTrigger
                      className="mt-2 rounded-none border-neutral-950 h-11 focus:ring-0 focus:ring-offset-0"
                      data-testid="webinar-select-role"
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none border-neutral-950">
                      {ROLES.map((r) => (
                        <SelectItem
                          key={r.value}
                          value={r.value}
                          className="rounded-none"
                          data-testid={`webinar-role-option-${r.value.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="referral_source" className="text-xs font-bold uppercase tracking-wider">How did you hear about us? <span className="text-neutral-400 font-normal normal-case">(optional)</span></Label>
                  <Input
                    id="referral_source" data-testid="webinar-input-referral"
                    placeholder="Friend's name, Instagram, LinkedIn…"
                    value={form.referral_source}
                    onChange={(e) => update("referral_source", e.target.value)}
                    className="mt-2 rounded-none border-neutral-950 focus-visible:ring-0 focus-visible:ring-offset-0 h-11"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={submitting}
                className="mt-6 w-full bg-neutral-950 text-white py-4 font-bold hover:bg-neutral-800 disabled:opacity-60"
                data-testid="webinar-submit-btn"
              >
                {submitting ? "Reserving…" : "Reserve My Spot"}
              </button>
              <p className="mt-3 text-xs text-neutral-500">By registering you agree to our Terms & Privacy.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
