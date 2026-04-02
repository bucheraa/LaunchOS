/**
 * Pre-defined mock responses for DEMO_MODE=true.
 * No API keys required — all AI and external service calls return
 * this static data instead of hitting real endpoints.
 */

import type {
  AIAnalysisResult,
  AIAudienceSegment,
  AIMessagingAngle,
  AIValueProp,
  AIStoreCopy,
  AIScreenItem,
  AIExperimentIdea,
  AIRecommendation,
} from "@/types";

export const DEMO_ANALYSIS: AIAnalysisResult = {
  productSummary:
    "[DEMO] This app leverages AI to deliver a personalized, data-driven experience. It addresses key user pain points with an intuitive interface and stands out through its depth of features and smart automation.",
  keyDifferentiators: [
    "AI-powered personalization that adapts to user behavior",
    "Seamless integration with popular third-party platforms",
    "Real-time insights and actionable recommendations",
    "Offline-first architecture with cloud sync",
  ],
  competitorContext:
    "The market is competitive but fragmented. Most existing solutions either lack AI capabilities or have poor UX. This app has a clear opportunity to become the category leader.",
};

export const DEMO_AUDIENCE_SEGMENTS: AIAudienceSegment[] = [
  {
    name: "Power User",
    description: "Tech-savvy early adopters who want maximum control and deep features.",
    demographics: "Age 25–35, urban, above-average income, iOS-first",
    psychographics: "Data-driven, productivity-obsessed, early adopter",
    painPoints: ["Current tools are too simplistic", "No way to customize workflows", "Data siloed across apps"],
    goals: ["Extract maximum value from every tool", "Automate repetitive tasks", "Make data-backed decisions"],
    isPrimary: true,
  },
  {
    name: "Casual User",
    description: "Mainstream users who want something simple that just works.",
    demographics: "Age 28–45, suburban, average income, mixed platforms",
    psychographics: "Convenience-focused, value-conscious, resistant to steep learning curves",
    painPoints: ["Too many options are overwhelming", "Existing apps require too much setup", "Hard to see quick wins"],
    goals: ["Get results with minimal effort", "Build a sustainable habit", "Feel in control without complexity"],
    isPrimary: false,
  },
];

export const DEMO_MESSAGING: { angles: AIMessagingAngle[]; valueProps: AIValueProp[] } = {
  angles: [
    {
      angle: "Performance & Efficiency",
      headline: "Do More in Less Time",
      subheadline: "AI handles the heavy lifting so you can focus on what matters",
      bodyText:
        "Stop wasting time on manual work. Our AI learns your patterns and automates the repetitive parts — giving you back hours every week.",
      tone: "Confident, direct",
    },
    {
      angle: "Simplicity & Clarity",
      headline: "Powerful Features, Zero Friction",
      subheadline: "Up and running in under 5 minutes",
      bodyText:
        "We've stripped away everything unnecessary. Every feature earns its place. The result is an app that feels like it was built just for you.",
      tone: "Calm, reassuring",
    },
  ],
  valueProps: [
    {
      headline: "AI That Learns You",
      description: "The more you use it, the smarter it gets. Personalization that actually works.",
      benefit: "No manual configuration — it adapts automatically",
    },
    {
      headline: "Everything in One Place",
      description: "Connect all your existing tools and see everything in a single unified view.",
      benefit: "Stop switching between apps",
    },
    {
      headline: "Results You Can See",
      description: "Clear progress metrics and weekly insights keep you on track and motivated.",
      benefit: "Always know exactly where you stand",
    },
  ],
};

export const DEMO_STORE_COPY: AIStoreCopy = {
  ios: {
    appName: "YourApp: AI-Powered Tool",
    subtitle: "Smart Automation & Insights",
    promotionalText: "🚀 New: AI recommendations now available. Try free for 14 days.",
    description: `The smartest way to manage your workflow — powered by AI.

YourApp learns from how you work and creates a personalized experience that gets better every day. No setup wizards. No steep learning curves. Just results.

**AI THAT WORKS FOR YOU**
• Adaptive suggestions based on your habits
• Automated reminders at the right moment
• Smart categorization — no tagging required

**EVERYTHING CONNECTED**
• Integrates with 30+ popular services
• Real-time sync across all your devices
• Works offline, syncs when you're back

**SEE REAL PROGRESS**
• Weekly insights and trend reports
• Goal tracking with visual milestones
• Exportable data in any format

Trusted by 50,000+ users worldwide.`,
    keywords: ["productivity", "AI assistant", "automation", "workflow", "planner"],
  },
  android: {
    title: "YourApp: AI Productivity Tool",
    shortDescription: "AI-powered workflow automation and smart insights for busy people",
    description: `Work smarter with AI that learns your habits.

YourApp adapts to you — not the other way around. Powerful automation, real-time insights, and seamless integrations make it the last productivity app you'll ever need.

AI AUTOMATION
◉ Learns your patterns and automates repetitive tasks
◉ Smart suggestions exactly when you need them
◉ No configuration required

STAY IN SYNC
◉ Works across Android, iOS, and web
◉ Integrates with Google Workspace, Slack, and 30+ apps
◉ Full offline support

TRACK YOUR PROGRESS
◉ Visual dashboards and weekly reports
◉ Goal tracking with streak protection
◉ Share progress with your team

★★★★★ "Finally an app that actually adapts to me." — Sarah M.
★★★★★ "Replaced 4 apps with just this one." — David K.`,
    keywords: ["productivity", "automation", "AI", "workflow", "task manager"],
  },
};

export const DEMO_SCREENSHOT_PLAN: AIScreenItem[] = [
  {
    order: 1,
    headline: "Your AI-Powered Workspace",
    subtext: "Smarter every day",
    feature: "AI Core",
    goal: "Communicate the core AI value prop immediately",
    screenType: "hero",
    backgroundHint: "Dark gradient with glowing dashboard overview",
  },
  {
    order: 2,
    headline: "Automation That Just Works",
    subtext: "Set it once. Let AI handle the rest.",
    feature: "Smart Automation",
    goal: "Show time-saving automation feature",
    screenType: "feature",
    backgroundHint: "Workflow diagram with automated steps highlighted",
  },
  {
    order: 3,
    headline: "All Your Tools, One Place",
    subtext: "30+ integrations. Zero friction.",
    feature: "Integrations",
    goal: "Reduce concern about leaving existing tools",
    screenType: "feature",
    backgroundHint: "Integration hub with brand logos",
  },
  {
    order: 4,
    headline: "50,000+ Users Can't Be Wrong",
    subtext: "Rated 4.9 stars on the App Store",
    feature: "Social Proof",
    goal: "Build trust with ratings and user count",
    screenType: "social_proof",
    backgroundHint: "User testimonials and star ratings on warm background",
  },
  {
    order: 5,
    headline: "Start Free Today",
    subtext: "14-day trial. No credit card required.",
    feature: "CTA",
    goal: "Drive download with low-friction offer",
    screenType: "cta",
    backgroundHint: "Bright gradient with prominent download button",
  },
];

export const DEMO_EXPERIMENTS: AIExperimentIdea[] = [
  {
    name: "App Name: Brand vs. Descriptive",
    hypothesis:
      "A descriptive app name including the core use case will outperform a pure brand name in search visibility and conversion rate.",
    elements: ["App Name"],
    targetMetric: "Search impressions + listing conversion rate",
    priority: "HIGH",
    expectedImpact: "+15–25% search impressions, +5–10% CVR",
  },
  {
    name: "First Screenshot: Benefit vs. Feature Headline",
    hypothesis:
      "A benefit-focused hero headline ('Do More in Less Time') will outperform a feature headline ('AI-Powered Automation') because users care about outcomes.",
    elements: ["Screenshot 1 — Headline"],
    targetMetric: "Tap-through rate from search results",
    priority: "HIGH",
    expectedImpact: "+8–12% tap-through rate",
  },
  {
    name: "Subtitle: Social Proof vs. Feature Description",
    hypothesis:
      "Adding '50,000+ Users' in the subtitle will convert better than a feature description, as social proof reduces purchase anxiety.",
    elements: ["Subtitle (iOS)", "Short Description (Android)"],
    targetMetric: "Product page conversion rate",
    priority: "MEDIUM",
    expectedImpact: "+6–9% CVR",
  },
  {
    name: "Icon: Dark vs. Light Background",
    hypothesis:
      "A dark icon background will stand out more in the light-mode App Store browse view and improve tap-through rate.",
    elements: ["App Icon"],
    targetMetric: "Tap-through from category browse",
    priority: "MEDIUM",
    expectedImpact: "+4–7% browse tap-through",
  },
];

export const DEMO_RECOMMENDATIONS: AIRecommendation[] = [
  {
    title: "Add social proof to Promotional Text",
    description:
      "The promotional text doesn't reference your user count. Adding '50,000+ users' or a notable review quote can significantly increase trust and conversion on the product page.",
    category: "STORE_LISTING",
    priority: "HIGH",
    effort: "LOW",
    impact: "Estimated +8–12% CVR improvement",
  },
  {
    title: "Create localized listing for top non-English market",
    description:
      "You're targeting multiple regions but only have English listings. A localized listing for your top non-English market (German, French, or Spanish) can increase impressions 2–3× in that region.",
    category: "ASO",
    priority: "HIGH",
    effort: "MEDIUM",
    impact: "+20–40% impressions in target market",
  },
  {
    title: "Move key text lower in first screenshot",
    description:
      "The hero headline is positioned in the upper 20% of screenshot 1 — a dead zone in gallery scroll interaction. Moving it to center-lower improves thumb-zone engagement.",
    category: "SCREENSHOTS",
    priority: "MEDIUM",
    effort: "LOW",
    impact: "+5–10% screenshot engagement",
  },
  {
    title: "Add 'free trial' keyword to iOS keyword field",
    description:
      "'Free trial app' has 90k monthly searches with moderate competition. It fits your 14-day trial offer and isn't in your current keyword set.",
    category: "ASO",
    priority: "MEDIUM",
    effort: "LOW",
    impact: "+8–15k monthly impressions",
  },
];

export const DEMO_KEYWORDS = [
  { keyword: "productivity app", volume: 165000, difficulty: 71, chance: 29, source: "AI_SUGGESTED" },
  { keyword: "AI assistant", volume: 95000, difficulty: 65, chance: 35, source: "ITUNES_AUTOCOMPLETE" },
  { keyword: "workflow automation", volume: 48000, difficulty: 42, chance: 58, source: "AI_SUGGESTED" },
  { keyword: "task manager", volume: 210000, difficulty: 78, chance: 22, source: "ITUNES_AUTOCOMPLETE" },
  { keyword: "smart planner", volume: 55000, difficulty: 38, chance: 62, source: "AI_SUGGESTED" },
  { keyword: "time tracking", volume: 130000, difficulty: 60, chance: 40, source: "ITUNES_AUTOCOMPLETE" },
  { keyword: "focus timer", volume: 72000, difficulty: 44, chance: 56, source: "AI_SUGGESTED" },
  { keyword: "daily organizer", volume: 39000, difficulty: 31, chance: 69, source: "ITUNES_AUTOCOMPLETE" },
  { keyword: "habit tracker", volume: 185000, difficulty: 75, chance: 25, source: "AI_SUGGESTED" },
  { keyword: "team collaboration", volume: 88000, difficulty: 55, chance: 45, source: "ITUNES_AUTOCOMPLETE" },
];

export const DEMO_COMPETITORS = [
  {
    appId: "1234567890",
    platform: "IOS",
    name: "ProductivityPro",
    developer: "Acme Software Inc.",
    rating: 4.7,
    ratingCount: 85000,
    description: "The all-in-one productivity suite for busy professionals. Tasks, notes, calendar, and habits in one beautiful app.",
    iconUrl: null,
    price: 0,
    category: "Productivity",
    keywords: ["productivity", "task manager", "notes", "calendar", "habits"],
  },
  {
    appId: "0987654321",
    platform: "IOS",
    name: "FlowState",
    developer: "Flow Labs",
    rating: 4.5,
    ratingCount: 42000,
    description: "AI-powered focus sessions and deep work tracker. Beat distractions and get into flow.",
    iconUrl: null,
    price: 0,
    category: "Productivity",
    keywords: ["focus", "deep work", "AI", "distraction blocker", "pomodoro"],
  },
  {
    appId: "com.example.prodapp",
    platform: "ANDROID",
    name: "TaskFlow: AI Planner",
    developer: "TaskFlow GmbH",
    rating: 4.3,
    ratingCount: 125000,
    description: "Smart task management with AI prioritization. Works with Google Calendar and Slack.",
    iconUrl: null,
    price: 0,
    category: "Productivity",
    keywords: ["task management", "AI planner", "Google Calendar", "Slack", "GTD"],
  },
];
