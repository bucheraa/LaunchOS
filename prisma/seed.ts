import { PrismaClient, Platform, AppCategory, PricingModel, Priority, Effort } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@launchos.dev" },
    update: {},
    create: {
      name: "Alex Demo",
      email: "demo@launchos.dev",
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: "acme-apps" },
    update: {},
    create: {
      name: "Acme Apps",
      slug: "acme-apps",
      plan: "FREE",
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  // Create a demo project
  const project = await prisma.project.upsert({
    where: { id: "demo-project-001" },
    update: {},
    create: {
      id: "demo-project-001",
      workspaceId: workspace.id,
      name: "FitTrack Pro",
      platform: [Platform.IOS, Platform.ANDROID],
      category: AppCategory.HEALTH_FITNESS,
      description:
        "FitTrack Pro is a comprehensive fitness tracking app that uses AI to create personalized workout and nutrition plans. Users can track workouts, monitor nutrition, set goals, and get real-time coaching feedback. The app integrates with Apple Health, Google Fit, and popular wearables.",
      targetAudience:
        "Health-conscious adults aged 25-45 who want a data-driven approach to fitness. Includes gym enthusiasts, runners, and people starting their fitness journey.",
      pricingModel: PricingModel.FREEMIUM,
      regions: ["US", "UK", "DE", "AU", "CA"],
      mainFeatures: [
        "AI-powered workout plans",
        "Nutrition tracking with barcode scanner",
        "Apple Health & Google Fit integration",
        "Progress photos & body metrics",
        "Social challenges",
        "Live coaching via AI",
      ],
      landingPageUrl: "https://fittrackpro.example.com",
      locale: ["en", "de"],
    },
  });

  // App Analysis
  await prisma.appAnalysis.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      productSummary:
        "FitTrack Pro is an AI-powered fitness companion that bridges the gap between professional coaching and self-guided workouts. By combining personalized AI plans with seamless health ecosystem integration, it delivers a premium experience that adapts to the user's progress and lifestyle.",
      keyDifferentiators: [
        "Real-time AI coaching feedback during workouts",
        "Unified health data from 50+ devices and apps",
        "Science-based progressive overload algorithms",
        "Social accountability features",
      ],
      analysisStatus: "COMPLETED",
    },
  });

  // Audience Segments
  const segment1 = await prisma.audienceSegment.create({
    data: {
      projectId: project.id,
      name: "The Gym Enthusiast",
      description:
        "Regular gym-goers who want to optimize their training with data and AI insights.",
      demographics: "Age 25-35, urban, mid-to-high income",
      psychographics: "Performance-driven, data-oriented, competitive",
      painPoints: [
        "Plateauing results",
        "Lack of personalized guidance",
        "Time wasted on ineffective workouts",
      ],
      goals: [
        "Build muscle / lose fat efficiently",
        "Track progress scientifically",
        "Stay motivated",
      ],
      isPrimary: true,
    },
  });

  const segment2 = await prisma.audienceSegment.create({
    data: {
      projectId: project.id,
      name: "The Busy Professional",
      description:
        "Time-constrained professionals who want maximum results with minimum time investment.",
      demographics: "Age 30-45, corporate, high income",
      psychographics: "Efficiency-focused, goal-oriented, stress-aware",
      painPoints: [
        "No time for the gym",
        "Inconsistent routine",
        "Decision fatigue around workouts",
      ],
      goals: [
        "Stay fit despite a busy schedule",
        "Quick effective workouts",
        "Work-life balance",
      ],
      isPrimary: false,
    },
  });

  // Value Props
  await prisma.valueProp.createMany({
    data: [
      {
        projectId: project.id,
        headline: "Your AI Personal Trainer, Always Available",
        description:
          "Get the expertise of a personal trainer in your pocket — adaptive plans, real-time feedback, and science-backed progression.",
        benefit: "Professional results without the cost of a trainer",
      },
      {
        projectId: project.id,
        headline: "Every Metric, One Place",
        description:
          "Sync Apple Health, Google Fit, and 50+ devices. No more app-switching — all your health data unified.",
        benefit: "Complete picture of health without the hassle",
      },
      {
        projectId: project.id,
        headline: "Workouts That Evolve With You",
        description:
          "AI analyzes your performance and automatically adjusts intensity, volume, and exercises to prevent plateaus.",
        benefit: "Continuous progress without hitting walls",
      },
    ],
  });

  // Messaging Angles
  await prisma.messagingAngle.createMany({
    data: [
      {
        projectId: project.id,
        angle: "Performance & Results",
        headline: "Train Smarter, Not Just Harder",
        subheadline: "AI-powered plans that adapt to your progress every day",
        bodyText:
          "Stop guessing what to do at the gym. FitTrack Pro analyzes your performance data and creates the optimal workout for your next session — automatically.",
        tone: "Confident, data-driven",
      },
      {
        projectId: project.id,
        angle: "Convenience & Simplicity",
        headline: "Your Entire Fitness Life in One App",
        subheadline: "Workouts, nutrition, progress — all connected",
        bodyText:
          "Tired of juggling 5 different apps? FitTrack Pro is the only fitness app you need. Everything syncs automatically so you can focus on training.",
        tone: "Friendly, reassuring",
      },
    ],
  });

  // Listing Variants
  await prisma.listingVariant.createMany({
    data: [
      {
        projectId: project.id,
        audienceSegmentId: segment1.id,
        platform: Platform.IOS,
        locale: "en",
        variantName: "Performance Focus — EN",
        appName: "FitTrack Pro: AI Fitness Coach",
        subtitle: "Smart Workouts & Nutrition AI",
        promotionalText:
          "🎯 New: AI coaching with real-time form feedback. Try free for 14 days.",
        description: `Train like a pro — with AI that actually gets you.

FitTrack Pro is the fitness app that learns from every workout and creates the perfect plan for your next session. No more plateaus. No more guessing.

**PERSONALIZED AI WORKOUTS**
• Adaptive plans built around your goals, equipment, and schedule
• Progressive overload calculated automatically
• 500+ exercises with form guides and coaching cues

**COMPLETE NUTRITION TRACKING**
• Log meals in seconds with barcode scanner
• AI-estimated macros from food photos
• Synced with your workout data for optimal fueling

**UNIFIED HEALTH ECOSYSTEM**
• Apple Health, Garmin, WHOOP, Fitbit and 50+ integrations
• All your metrics in one dashboard

**TRACK REAL PROGRESS**
• Body measurement logging & progress photos
• Detailed analytics and trend insights
• Weekly performance reports

Join 200,000+ athletes training smarter.`,
        keywords: [
          "fitness tracker",
          "AI workout",
          "gym app",
          "personal trainer",
          "nutrition tracker",
        ],
        status: "READY",
        isControl: true,
      },
      {
        projectId: project.id,
        audienceSegmentId: segment2.id,
        platform: Platform.IOS,
        locale: "en",
        variantName: "Busy Professional — EN",
        appName: "FitTrack Pro: Fitness & Health",
        subtitle: "Efficient Workouts for Busy People",
        promotionalText:
          "No time? No problem. Get fit in 30 min/day with AI-powered plans.",
        description: `Fit fitness into your busy life — finally.

FitTrack Pro understands you don't have 2 hours at the gym. Our AI creates efficient, science-backed workouts that fit your schedule and deliver real results.

**WORKOUTS THAT FIT YOUR SCHEDULE**
• 15-60 minute plans tailored to your available time
• Home, gym, or hotel — works anywhere
• Quick-start sessions for when you're pressed for time

**SET IT AND FORGET IT**
• AI handles all the planning
• Auto-adjusts based on how you feel
• Smart reminders that respect your calendar

**SEE RESULTS WITHOUT THE OVERWHELM**
• Simple progress tracking
• Weekly summaries in under 2 minutes
• Celebrate small wins that add up

Used by 50,000+ busy professionals to stay consistently fit.`,
        keywords: ["quick workout", "busy fitness", "efficient exercise", "health app"],
        status: "DRAFT",
        isControl: false,
      },
      {
        projectId: project.id,
        audienceSegmentId: segment1.id,
        platform: Platform.ANDROID,
        locale: "en",
        variantName: "Performance Focus Android — EN",
        appName: "FitTrack Pro: AI Fitness Coach",
        shortDescription: "AI-powered workouts & nutrition tracking for serious athletes",
        description: `The fitness app that thinks like a coach.

FitTrack Pro combines AI-powered workout planning with comprehensive nutrition tracking to help you reach your fitness goals faster than ever.

SMART AI WORKOUTS
◉ Personalized plans that adapt to your progress
◉ 500+ exercises with detailed coaching cues
◉ Auto-calculated progressive overload

NUTRITION MADE SIMPLE
◉ Barcode scanner + AI food recognition
◉ Macro tracking synced with your workouts
◉ Restaurant & recipe logging

HEALTH INTEGRATIONS
◉ Google Fit, Samsung Health, Garmin, Fitbit
◉ All health data in one dashboard
◉ Wear OS support

REAL PROGRESS TRACKING
◉ Body metrics & progress photos
◉ Performance analytics
◉ Goal tracking & milestones

★★★★★ "The only fitness app I've stuck with for over a year." — Marcus K.
★★★★★ "Finally an app that actually adapts to me." — Sarah M.

Download free and start your 14-day premium trial today.`,
        keywords: ["fitness", "workout", "AI trainer", "nutrition", "gym"],
        status: "READY",
        isControl: true,
      },
    ],
  });

  // Screenshot Plans
  await prisma.screenshotPlan.create({
    data: {
      projectId: project.id,
      platform: Platform.IOS,
      locale: "en",
      name: "iOS Performance — v1",
      status: "COMPLETED",
      screens: [
        {
          order: 1,
          headline: "Your AI Personal Trainer",
          subtext: "Workouts that adapt to you",
          feature: "AI Workout Planning",
          goal: "Communicate core value proposition",
          screenType: "hero",
          backgroundHint: "Dashboard showing personalized workout",
        },
        {
          order: 2,
          headline: "Train Smarter Every Session",
          subtext: "AI analyzes your last workout to plan the next",
          feature: "Adaptive Planning",
          goal: "Show AI adaptation feature",
          screenType: "feature",
          backgroundHint: "Workout detail screen with AI suggestions",
        },
        {
          order: 3,
          headline: "Nutrition That Works With Your Training",
          subtext: "Log in seconds. AI fills in the rest.",
          feature: "Nutrition Tracking",
          goal: "Highlight nutrition + AI food recognition",
          screenType: "feature",
          backgroundHint: "Nutrition log with barcode scanner active",
        },
        {
          order: 4,
          headline: "All Your Health Data, Unified",
          subtext: "Apple Health, Garmin, WHOOP and 50+ more",
          feature: "Health Integrations",
          goal: "Reduce concern about fragmented data",
          screenType: "social_proof",
          backgroundHint: "Integration hub with connected devices",
        },
        {
          order: 5,
          headline: "See Real Progress",
          subtext: "Charts, trends, and insights that motivate",
          feature: "Progress Analytics",
          goal: "Show measurable outcomes",
          screenType: "feature",
          backgroundHint: "Progress charts showing strength gains over time",
        },
      ],
    },
  });

  // Experiments
  await prisma.experiment.createMany({
    data: [
      {
        projectId: project.id,
        name: "App Name: Brand vs Descriptive",
        hypothesis:
          "A more descriptive app name including 'AI Fitness Coach' will improve search visibility and conversion vs. the pure brand name 'FitTrack Pro'.",
        elements: ["App Name"],
        targetMetric: "Store listing conversion rate + search impressions",
        priority: Priority.HIGH,
        expectedImpact: "+15-25% search visibility, +5-10% conversion",
        status: "PLANNED",
      },
      {
        projectId: project.id,
        name: "First Screenshot Hero Message",
        hypothesis:
          "Using 'Your AI Personal Trainer' as the hero headline will outperform 'Train Smarter, Not Just Harder' because it clearly communicates the core value.",
        elements: ["Screenshot 1 - Headline"],
        targetMetric: "Tap-through rate from search results",
        priority: Priority.HIGH,
        expectedImpact: "+8-12% tap-through rate",
        status: "RUNNING",
      },
      {
        projectId: project.id,
        name: "Subtitle: Feature vs. Benefit",
        hypothesis:
          "Benefit-oriented subtitle 'Reach Your Goals Faster' will convert better than feature-oriented 'Smart Workouts & Nutrition AI'.",
        elements: ["Subtitle (iOS)"],
        targetMetric: "Product page conversion rate",
        priority: Priority.MEDIUM,
        expectedImpact: "+5-8% conversion rate",
        status: "PLANNED",
      },
    ],
  });

  // Recommendations
  await prisma.recommendation.createMany({
    data: [
      {
        projectId: project.id,
        title: "Add social proof to Promotional Text",
        description:
          "Your promotional text doesn't mention user numbers. Adding '200,000+ athletes' or similar social proof can significantly increase trust and conversion.",
        category: "STORE_LISTING",
        priority: Priority.HIGH,
        effort: Effort.LOW,
        impact: "Estimated +8-12% conversion improvement",
        status: "OPEN",
      },
      {
        projectId: project.id,
        title: "Create German (de) store listing",
        description:
          "Germany is your 3rd largest target region, but you only have English listings. A localized German listing can increase visibility by 2-3x in DE.",
        category: "ASO",
        priority: Priority.HIGH,
        effort: Effort.MEDIUM,
        impact: "+20-40% impressions in German market",
        status: "OPEN",
      },
      {
        projectId: project.id,
        title: "Optimize first screenshot for thumb zones",
        description:
          "The hero headline in screenshot 1 is positioned in the upper 20% — a dead zone for thumb interaction in gallery scrolling. Move key text to the center-lower area.",
        category: "SCREENSHOTS",
        priority: Priority.MEDIUM,
        effort: Effort.LOW,
        impact: "+5-10% screenshot engagement rate",
        status: "OPEN",
      },
      {
        projectId: project.id,
        title: "Add keyword 'workout planner' to keywords field",
        description:
          "'Workout planner' has 180k monthly searches and moderate competition. It's not in your current keyword list and aligns well with your core features.",
        category: "ASO",
        priority: Priority.MEDIUM,
        effort: Effort.LOW,
        impact: "Additional 15-20k monthly impressions",
        status: "IN_PROGRESS",
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log(`   User: demo@launchos.dev / demo1234`);
  console.log(`   Workspace: ${workspace.slug}`);
  console.log(`   Project: ${project.name} (id: ${project.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
