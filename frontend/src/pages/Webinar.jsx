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
import { Check, MessageCircle, Briefcase, Sparkles, PenTool, Video, Megaphone } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";

const ROLES = [
  { value: "Founder's Office",     label: "Founder’s Office" },
  { value: "GTM Engineer",         label: "GTM Engineer" },
  { value: "Product Design",       label: "Product Design" },
  { value: "Video / Graphic Design", label: "Video / Graphic Design" },
  { value: "Brand & Content",      label: "Brand & Content" },
  { value: "Still Exploring",      label: "Still Exploring" },
];

const FIELD =
  "mt-2 h-11 rounded-xl border border-[#d2d2d7] text-base sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-neutral-950";

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
      <div className="apple-page apple-page-y text-center" data-testid="webinar-success">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pa-brand text-pa-on-brand mb-8">
          <Check className="w-8 h-8" strokeWidth={2.5} />
        </div>
        <h1 className="apple-headline">You’re in!</h1>
        <p className="apple-subhead apple-subhead-center mt-5">
          Join the WhatsApp group to get updates, reminders, and the live link.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="apple-btn apple-btn-whatsapp"
            data-testid="webinar-whatsapp-cta"
          >
            <MessageCircle className="w-5 h-5" /> Join WhatsApp Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="page-webinar" className="bg-white">
      <section className="apple-section border-b border-black/5">
        <div className="apple-page grid md:grid-cols-12 gap-10 md:gap-12 lg:gap-16">
          <div className="md:col-span-7">
            <Reveal>
              <p className="apple-eyebrow mb-4">Free Live Career Series</p>
              <h1 className="apple-headline">
                Clarity about your career in 2026.
              </h1>
              <p className="apple-subhead mt-5">
                Explore high-growth AI &amp; startup career paths beyond coding, and understand what actually fits your strengths, interests, and future goals.
              </p>
            </Reveal>

            <Stagger className="mt-12 grid sm:grid-cols-2 gap-3" stagger={0.07}>
              {[
                { icon: Briefcase, t: "Founder’s Office opportunities in startups" },
                { icon: Sparkles,  t: "GTM Engineer & AI operations careers" },
                { icon: PenTool,   t: "Product Design & creative problem solving" },
                { icon: Video,     t: "Video Editing & Graphic Design careers" },
                { icon: Megaphone, t: "Brand, Content & creator economy roles" },
              ].map(({ icon: Icon, t }, i) => (
                <StaggerItem
                  key={i}
                  className="apple-tile min-h-0 p-5 flex items-start gap-3"
                >
                  <div className="flex items-start gap-3" data-testid={`learn-item-${i}`}>
                    <Icon className="w-5 h-5 mt-0.5 shrink-0 text-neutral-500" strokeWidth={1.5} />
                    <p className="font-medium tracking-tight text-[#1d1d1f] text-sm leading-snug">{t}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-12 grid sm:grid-cols-2 gap-10">
              <div>
                <p className="apple-eyebrow mb-4">What you’ll learn</p>
                <ul className="space-y-2.5 text-sm text-neutral-600">
                  {[
                    "Which non-tech roles are growing in AI/startups",
                    "Salary ranges and career progression",
                    "Skills required to break into each role",
                    "How to stand out without IIT/NIT background",
                    "Building portfolio & proof of work",
                    "Networking, cold outreach & LinkedIn strategy",
                    "Build in public and grow online presence",
                    "Real examples and career roadmaps",
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-pa-success" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="apple-eyebrow mb-4">Who should attend</p>
                <ul className="space-y-2.5 text-sm text-neutral-600">
                  {[
                    "Students confused about career direction",
                    "Fresh graduates exploring startup opportunities",
                    "Non-tech students interested in AI/startups",
                    "People struggling to get interview calls",
                    "Creators and freelancers exploring stable careers",
                    "Anyone wanting clarity before choosing a path",
                  ].map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 shrink-0 text-pa-success" />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <Reveal delay={0.15}>
              <form
                onSubmit={handleSubmit}
                className="apple-panel md:sticky md:top-24"
                data-testid="webinar-form"
              >
                <p className="apple-eyebrow mb-2">Reserve your spot</p>
                <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mb-6">
                  Free · Live · Career Session
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name" className="apple-label">Full Name</Label>
                    <Input
                      id="full_name" data-testid="webinar-input-name"
                      value={form.full_name}
                      onChange={(e) => update("full_name", e.target.value)}
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="apple-label">Email</Label>
                    <Input
                      id="email" type="email" data-testid="webinar-input-email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="apple-label">Phone Number</Label>
                    <Input
                      id="phone" inputMode="tel" data-testid="webinar-input-phone"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <Label htmlFor="college" className="apple-label">Current Status / Background</Label>
                    <Input
                      id="college" data-testid="webinar-input-college"
                      value={form.college}
                      onChange={(e) => update("college", e.target.value)}
                      className={FIELD}
                    />
                  </div>
                  <div>
                    <Label className="apple-label">Interested Role</Label>
                    <Select value={form.interested_role} onValueChange={(v) => update("interested_role", v)}>
                      <SelectTrigger
                        className={`${FIELD} focus:ring-0 focus:ring-offset-0`}
                        data-testid="webinar-select-role"
                      >
                        <SelectValue placeholder="Select your interested career path" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-neutral-200">
                        {ROLES.map((r) => (
                          <SelectItem
                            key={r.value}
                            value={r.value}
                            className="rounded-lg"
                            data-testid={`webinar-role-option-${r.value.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="referral_source" className="apple-label">
                      How did you hear about us? <span className="normal-case font-normal text-neutral-400">(optional)</span>
                    </Label>
                    <Input
                      id="referral_source" data-testid="webinar-input-referral"
                      placeholder="Friend's name, Instagram, LinkedIn…"
                      value={form.referral_source}
                      onChange={(e) => update("referral_source", e.target.value)}
                      className={FIELD}
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="apple-btn apple-btn-dark mt-6 w-full justify-center disabled:opacity-60"
                  data-testid="webinar-submit-btn"
                >
                  {submitting ? "Reserving…" : "Reserve My Free Spot"}
                </button>
                <p className="mt-3 text-xs text-neutral-500 text-center">Limited seats for live interaction &amp; Q&amp;A</p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}
