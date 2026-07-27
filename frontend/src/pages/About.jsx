import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";
import AnimatedNumber from "../components/AnimatedNumber";

export default function About() {
  return (
    <div data-testid="page-about" className="bg-white">
      <section className="apple-section border-b border-black/5">
        <div className="apple-page">
          <Reveal>
            <p className="apple-eyebrow mb-4">About Us</p>
            <h1 className="apple-headline max-w-3xl">
              We help students get their <em className="not-italic font-semibold text-pa-brand">first</em> startup job.
            </h1>
            <p className="apple-subhead mt-6 max-w-2xl">
              PrepAlign is a community-first platform built for students from Tier 2 and Tier 3
              Indian colleges. We’re not another course factory. We’re a movement that teaches you
              the real skills recruiters hire for: communication, networking, building in public,
              and portfolio craft.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="apple-band">
        <Stagger className="apple-page apple-section grid md:grid-cols-3 gap-4" stagger={0.12}>
          {[
            { n: 5000, suf: "+", l: "Learners in our community" },
            { n: 35,   suf: "+", l: "Offline meetups across India" },
            { n: 15,   suf: "+", l: "Company collaborations" },
          ].map((x, i) => (
            <StaggerItem key={i} className="apple-tile min-h-0 bg-white">
              <p className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f]" data-testid={`about-stat-${i}`}>
                <AnimatedNumber value={x.n} suffix={x.suf} />
              </p>
              <p className="apple-eyebrow mt-3">{x.l}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Reveal as="section" className="apple-section apple-page">
        <div className="max-w-3xl">
        <p className="apple-eyebrow mb-4">Our Mission</p>
        <h2 className="apple-headline">
          Help students land their first real job with practical skills, not fancy degrees.
        </h2>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          Colleges won’t teach you networking. LinkedIn gurus won’t give you honest feedback.
          We will. Through live sessions, accountability groups, offline meetups, and 1:1
          mentorship, we turn ambitious students into hireable operators.
        </p>
        <p className="mt-6 text-neutral-600 leading-relaxed">
          We are on a mission to help students from Tier 2 and Tier 3 colleges break into
          AI and startup roles through practical skills, strong communication, and real-world
          exposure.
        </p>
        <p className="mt-6 text-sm text-neutral-500">
          For collaborations or queries, reach out at:{" "}
          <a href="mailto:services@triple9.com" className="underline font-medium text-[#1d1d1f]">
            services@triple9.com
          </a>
        </p>
        <div className="mt-10 apple-cta-row">
          <Link
            to="/webinar"
            className="apple-btn apple-btn-dark"
            data-testid="about-webinar-btn"
          >
            Reserve Your Free Spot <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link
            to="/mentorship"
            className="apple-btn apple-btn-whatsapp"
            data-testid="about-mentorship-btn"
          >
            Request Mentorship <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        </div>
      </Reveal>
    </div>
  );
}
