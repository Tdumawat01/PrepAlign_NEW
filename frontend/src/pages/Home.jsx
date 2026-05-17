import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, MessageCircle, Ticket, Users, Mic2, Share2, FileText, Check } from "lucide-react";
import { WHATSAPP_URL } from "../lib/constants";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import AnimatedNumber from "../components/AnimatedNumber";

const heroImg =
  "https://images.unsplash.com/photo-1675664534136-51375fb40129?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjBjb2xsZWdlJTIwc3R1ZGVudHMlMjBsYXB0b3B8ZW58MHx8fHwxNzc3NzE3ODMxfDA&ixlib=rb-4.1.0&q=85";
const meetupImg =
  "https://images.unsplash.com/photo-1559223607-b4d0555ae227?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwbWVldHVwJTIwY3Jvd2R8ZW58MHx8fHwxNzc3NzE3ODMxfDA&ixlib=rb-4.1.0&q=85";

const problems = [
  "Applying to jobs but getting no replies",
  "No strong LinkedIn or portfolio",
  "Don’t know how to network",
  "Struggle with communication",
];

const pillars = [
  { icon: Mic2,    title: "Communication", body: "Speak, write, and pitch yourself with clarity — the #1 filter recruiters use." },
  { icon: Users,   title: "Networking",    body: "Warm intros, referrals, and DM scripts that actually get replies." },
  { icon: Share2,  title: "Build in Public", body: "Ship, post, iterate. Make your work visible to the right people." },
  { icon: FileText, title: "Portfolio",    body: "Proof-of-work projects that replace a fancy college tag on your resume." },
];

export default function Home() {
  return (
    <div data-testid="page-home">
      {/* HERO */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 pt-16 md:pt-24 pb-12 md:pb-20 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8 reveal reveal-1">
            <p className="label-eyebrow mb-5">For Tier 2 & Tier 3 India</p>
            <h1 className="text-5xl sm:text-6xl lg:text-[88px] font-black tracking-[-0.04em] leading-[0.9]">
              Get Your First<br />
              AI or Startup<br />
              Job
              <span className="inline-block ml-3 px-3 align-middle border-2 border-neutral-950 bg-[#25D366] text-black text-3xl md:text-4xl font-black tracking-tight">
                without coding
              </span>
            </h1>
            <p className="mt-7 text-lg md:text-xl text-neutral-600 max-w-2xl leading-relaxed">
              No coding. No IIT/NIT. Just the skills that actually get you hired.
            </p>
            <p className="mt-3 text-sm md:text-base text-neutral-500 max-w-2xl">
              Built to help students get real outcomes, not just learn.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/webinar"
                className="inline-flex items-center gap-2 bg-neutral-950 text-white px-7 py-4 font-bold hard-shadow"
                data-testid="hero-webinar-btn"
              >
                <Ticket className="w-5 h-5" /> Reserve Your Free Spot
              </Link>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-black px-7 py-4 font-bold border-2 border-neutral-950"
                data-testid="hero-whatsapp-btn"
              >
                <MessageCircle className="w-5 h-5" /> Join WhatsApp Community
              </a>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-xs text-neutral-500">
              <span>Limited seats for live interaction</span>
              <span className="hidden sm:inline text-neutral-300">·</span>
              <span>Get updates and resources directly on WhatsApp</span>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-neutral-500">
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-950" /> 100% Free</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-950" /> Live Q&A</span>
              <span className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-950" /> No coding required</span>
            </div>
          </div>

          <div className="md:col-span-4 reveal reveal-2">
            <div className="relative">
              <div className="img-zoom border-2 border-neutral-950">
                <img
                  src={heroImg}
                  alt="Student"
                  className="w-full h-[360px] md:h-[460px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white border-2 border-neutral-950 px-4 py-3 hard-shadow-sm">
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-neutral-500">Cohort</p>
                <p className="text-2xl font-black tracking-tight">
                  <AnimatedNumber value={5000} suffix="+" testid="cohort-badge-number" />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="divider-strip">
          <span>No IIT · No NIT · No Coding · No Problem</span>
          <span>·</span>
          <span>Communication Wins</span>
          <span>·</span>
          <span>Build in Public</span>
          <span>·</span>
          <span>Get Referred</span>
          <span>·</span>
          <span>Ship Weekly</span>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <p className="label-eyebrow mb-4">The Reality</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.95]">
            Why you’re<br /> not getting<br /> interviews.
          </h2>
          <p className="mt-6 text-neutral-600 max-w-md">
            You’re not lazy. You’re not unqualified. You’re invisible. Recruiters can’t find
            proof that you’re worth a shot.
          </p>
        </div>
        <Stagger className="md:col-span-7 grid sm:grid-cols-2 gap-0 border-t border-l border-neutral-200" stagger={0.06}>
          {problems.map((p, i) => (
            <StaggerItem
              key={i}
              className="card-lift border-r border-b border-neutral-200 p-8 flex items-start gap-4 hover:bg-neutral-50"
            >
              <span className="text-4xl font-black tracking-tighter text-neutral-300">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="text-lg font-semibold tracking-tight leading-snug" data-testid={`problem-card-${i}`}>{p}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* SOLUTION */}
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
            <div className="md:col-span-7">
              <p className="label-eyebrow text-neutral-500 mb-4">The Fix</p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95]">
                We help you get <span className="italic font-serif">noticed</span> —<br />
                not just skilled.
              </h2>
            </div>
            <p className="md:col-span-5 text-neutral-400 leading-relaxed">
              Skills are table stakes. Visibility, storytelling, and network get you the job.
              Here are the 4 pillars we drill you on.
            </p>
          </div>

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-neutral-800" stagger={0.08}>
            {pillars.map(({ icon: Icon, title, body }, i) => (
              <StaggerItem
                key={title}
                className="card-lift border-r border-b border-neutral-800 p-8 hover:bg-neutral-900"
              >
                <div data-testid={`pillar-card-${i}`}>
                  <Icon className="w-7 h-7 mb-6" strokeWidth={1.5} />
                  <p className="text-2xl font-black tracking-tight mb-2">{title}</p>
                  <p className="text-sm text-neutral-400 leading-relaxed">{body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-center">
          <Reveal className="md:col-span-5">
            <div className="img-zoom border-2 border-neutral-950">
              <img
                src={meetupImg}
                alt="Meetup"
                className="w-full h-[320px] md:h-[420px] object-cover"
              />
            </div>
          </Reveal>
          <div className="md:col-span-7">
            <p className="label-eyebrow mb-4">Proof</p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.95] mb-4">
              A movement, not a course.
            </h2>
            <p className="text-neutral-600 mb-10 max-w-xl">
              This is not a course. You’ll actually execute.
            </p>
            <Stagger className="grid grid-cols-3 gap-0 border-t border-l border-neutral-200" stagger={0.12}>
              {[
                { n: 5000, suf: "+", l: "Learners impacted" },
                { n: 35,   suf: "+", l: "Offline meetups" },
                { n: 15,   suf: "+", l: "Company collaborations" },
              ].map((s, i) => (
                <StaggerItem key={i} className="card-lift border-r border-b border-neutral-200 p-6 md:p-8 hover:bg-neutral-50">
                  <p className="text-3xl md:text-5xl font-black tracking-tighter" data-testid={`stat-${i}`}>
                    <AnimatedNumber value={s.n} suffix={s.suf} testid={`stat-num-${i}`} />
                  </p>
                  <p className="text-xs font-bold tracking-[0.18em] uppercase text-neutral-500 mt-2">{s.l}</p>
                </StaggerItem>
              ))}
            </Stagger>
            <p className="mt-6 text-sm text-neutral-500">
              1,000+ students already learning and applying these strategies.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-neutral-200">
        <Reveal className="mx-auto max-w-7xl px-5 sm:px-8 py-20 md:py-28 text-center">
          <p className="label-eyebrow mb-5">Start</p>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.95]">
            Start your journey.
          </h2>
          <p className="mt-5 text-neutral-600 max-w-xl mx-auto">
            Free, fast, and built for students who refuse to wait for permission.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link
              to="/webinar"
              className="btn-press inline-flex items-center gap-2 bg-neutral-950 text-white px-8 py-4 font-bold hard-shadow"
              data-testid="final-webinar-btn"
            >
              Reserve Your Free Spot <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-press inline-flex items-center gap-2 bg-[#25D366] text-black px-8 py-4 font-bold border-2 border-neutral-950"
              data-testid="final-whatsapp-btn"
            >
              Join WhatsApp <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          <p className="mt-4 text-xs text-neutral-500">
            Limited seats for live interaction · Get updates and resources directly on WhatsApp
          </p>
        </Reveal>
      </section>
    </div>
  );
}
