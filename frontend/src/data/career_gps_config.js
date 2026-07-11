// Career GPS — configuration for questions & option pools.
// Keeping this in a single file so tweaks don't touch the wizard component.

export const STEPS = [
  {
    id: "about",
    title: "About You",
    subtitle: "Where you're at, what you're studying, when you graduate.",
    questions: [
      {
        id: "current_status",
        type: "radio",
        label: "Current Status",
        options: ["Student (undergrad)", "Fresher (0 exp)", "0–1 yrs experience", "1–3 yrs experience"],
      },
      {
        id: "degree",
        type: "radio",
        label: "Degree",
        options: ["B.Tech / B.E.", "B.Com", "BBA", "B.A.", "B.Sc.", "Other"],
      },
      {
        id: "graduation_year",
        type: "select",
        label: "Graduation Year",
        options: ["2022", "2023", "2024", "2025", "2026", "2027", "2028"],
      },
    ],
  },
  {
    id: "interests",
    title: "Interests",
    subtitle: "Pick every area that excites you — the more honest, the better.",
    questions: [
      {
        id: "interests",
        type: "multi",
        label: "Which of these interest you?",
        min: 1,
        options: ["Product", "Marketing", "Design", "Operations", "Content", "Data", "AI", "Business"],
      },
    ],
  },
  {
    id: "styles",
    title: "Working Style",
    subtitle: "How do you like to operate day-to-day?",
    questions: [
      {
        id: "styles",
        type: "multi",
        label: "Which working styles suit you?",
        min: 1,
        options: ["Leadership", "Analytical", "Creative", "Client-facing", "Startup Environment"],
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    subtitle: "Rate yourself honestly — 1 (learning) to 5 (excellent).",
    questions: [
      { id: "Communication",   type: "rate", label: "Communication" },
      { id: "Problem Solving", type: "rate", label: "Problem Solving" },
      { id: "Creativity",      type: "rate", label: "Creativity" },
      { id: "Excel/Analytics", type: "rate", label: "Excel / Analytics" },
      { id: "Public Speaking", type: "rate", label: "Public Speaking" },
    ],
  },
  {
    id: "goals",
    title: "Career Goals",
    subtitle: "Where do you want this to go?",
    questions: [
      { id: "startup_vs_mnc",     type: "radio", label: "Startup vs MNC",     options: ["Startup", "MNC", "No preference"] },
      { id: "remote_vs_office",   type: "radio", label: "Remote vs Office",   options: ["Remote", "Office", "Hybrid"] },
      { id: "leadership_goal",    type: "radio", label: "Leadership Goals",   options: ["Individual Contributor", "Team Lead", "Founder"] },
      { id: "salary_expectation", type: "select", label: "Salary Expectations", options: ["<₹6 LPA", "₹6–12 LPA", "₹12–20 LPA", "₹20+ LPA"] },
      { id: "ai_interest",        type: "radio", label: "AI Interest",        options: ["Very high", "Moderate", "Low"] },
    ],
  },
];

export const DRAFT_KEY = "prepalign_career_gps_draft_v1";
export const RESULT_KEY = "prepalign_career_gps_result_v1";
export const ROADMAP_PROGRESS_KEY = "prepalign_career_gps_roadmap_progress_v1";
