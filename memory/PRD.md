# PrepAlign — Product Requirements Doc

## Original Problem Statement
Build a clean, modern, mobile-first landing website for a startup focused on helping Tier 2 and Tier 3 Indian students break into AI and startup roles without coding. Minimal, high-conversion, lead-capture focused. Primary goals: webinar registrations + WhatsApp community joins.

## User Choices (from ask_human)
- Authentication: Emergent-managed Google Auth (no Email OTP)
- Palette: Black & White monochrome + WhatsApp green (#25D366) accent
- Font: SF Pro (`-apple-system` stack)
- WhatsApp link: placeholder `https://chat.whatsapp.com/XXXXXXXXXXXXXXXXX`

## User Personas
1. Final-year Tier 2/3 student, non-tech, no interview calls.
2. Recent graduate needing resume + portfolio guidance.
3. Career-switcher looking for AI/Product/Growth roles without coding.

## Core Requirements (static)
- Pages: Home, Webinar, About, Mentorship, Privacy, Terms, Login, AuthCallback, Dashboard
- Sticky CTAs on every page (mobile): Join Webinar + Join WhatsApp
- Lead capture forms with MongoDB persistence
- Google Sign-In via Emergent OAuth (session cookies)
- Hindi-friendly confirmation on mentorship form

## Implemented (Dec 2025)
- Backend (FastAPI + MongoDB) at `/app/backend/server.py`:
  - `POST /api/webinar/register`, `POST /api/mentorship/request` (public lead capture)
  - `POST /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`
  - Admin list endpoints protected: `GET /api/webinar/registrations`, `GET /api/mentorship/requests` (require session)
- Frontend (React + Tailwind + shadcn):
  - Swiss/Brutalist monochrome theme, SF Pro stack, WhatsApp-green accent
  - Home (hero, problem, 4 pillars, social proof, final CTA)
  - Webinar page with form + success state → WhatsApp CTA
  - Mentorship form with Hindi success state
  - About, Privacy, Terms
  - Login (Google) + AuthCallback + Dashboard
  - Sticky mobile CTA bar + Navbar + Footer
- Testing: 16/16 backend tests passing (pytest at `/app/backend/tests/test_backend.py`)
- Rebranded from "StartupPath" to "PrepAlign" (Dec 2025)

## Backlog
- P0: Replace WhatsApp placeholder link with real invite URL
- P1: Admin dashboard UI to view registrations/mentorship requests (backend APIs ready)
- P1: Email notification on form submit (Resend/SendGrid)
- P1: Career GPS activation emails (phase 2) — flush `ACTIVATION_QUEUE_KEY` events via `/api/career-gps/activation`
- P2: Rate-limit public POST endpoints (spam protection)
- P2: Analytics (GA4/PostHog) + UTM capture on forms
- P2: Add testimonials carousel & FAQ sections
- P2: Blog/content section for SEO

## Next Tasks
1. User provides real WhatsApp invite URL → replace in `/app/frontend/src/lib/constants.js`
2. Decide email provider for notifications and integrate
3. Build admin dashboard (list views behind auth already exist)
4. Career GPS roadmap page shipped (`/career-gps/roadmap`) — progress, heatmap, tasks/guides/videos; email activation next
