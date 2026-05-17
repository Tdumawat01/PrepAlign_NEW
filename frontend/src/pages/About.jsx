import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import AnimatedNumber from "../components/AnimatedNumber";

export default function About() {
  return (
    <div data-testid="page-about">
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 py-16 md:py-28">
          <p className="label-eyebrow mb-5">About Us</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
            We help students<br /> get their <em className="font-serif">first</em> startup job.
          </h1>
          <p className="mt-8 text-lg text-neutral-600 max-w-2xl leading-relaxed">
            PrepAlign is a community-first platform built for students from Tier 2 and Tier 3
            Indian colleges. We’re not another course factory — we’re a movement that teaches you
            the real skills recruiters hire for: communication, networking, building in public,
            and portfolio craft.
          </p>
        </div>
      </section>

      <Stagger className="mx-auto max-w-5xl px-5 sm:px-8 py-16 md:py-24 grid md:grid-cols-3 gap-0 border-t border-l border-neutral-200" stagger={0.12}>
        {[
          { n: 5000, suf: "+", l: "Learners in our community" },
          { n: 35,   suf: "+", l: "Offline meetups across India" },
          { n: 15,   suf: "+", l: "Company collaborations" },
        ].map((x, i) => (
          <StaggerItem key={i} className="card-lift border-r border-b border-neutral-200 p-8 hover:bg-neutral-50">
            <p className="text-4xl md:text-6xl font-black tracking-tighter" data-testid={`about-stat-${i}`}>
              <AnimatedNumber value={x.n} suffix={x.suf} />
            </p>
            <p className="label-eyebrow mt-3">{x.l}</p>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal as="section" className="mx-auto max-w-3xl px-5 sm:px-8 py-16 md:py-24">
        <p className="label-eyebrow mb-4">Our Mission</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-[0.95]">
          Help students land their first real job — with practical skills, not fancy degrees.
        </h2>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          Colleges won’t teach you networking. LinkedIn gurus won’t give you honest feedback.
          We will. Through live sessions, accountability groups, offline meetups, and 1:1
          mentorship — we turn ambitious students into hireable operators.
        </p>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          We are on a mission to help students from Tier 2 and Tier 3 colleges break into
          AI and startup roles through practical skills, strong communication, and real-world
          exposure.
        </p>
        <p className="mt-6 text-sm text-neutral-500">
          For collaborations or queries, reach out at:{" "}
          <a href="mailto:services@triple9.com" className="underline font-semibold text-neutral-950">
            services@triple9.com
          </a>
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/webinar"
            className="btn-press inline-flex items-center gap-2 bg-neutral-950 text-white px-6 py-3 font-bold"
            data-testid="about-webinar-btn"
          >
            Reserve Your Free Spot <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/mentorship"
            className="btn-press inline-flex items-center gap-2 border-2 border-neutral-950 px-6 py-3 font-bold"
            data-testid="about-mentorship-btn"
          >
            Request Mentorship <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
