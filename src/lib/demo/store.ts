import type { Session } from "next-auth";
import type {
  ProjectWithRelations,
  AppAnalysisData,
  AudienceSegmentData,
  ValuePropData,
  MessagingAngleData,
  ListingVariantData,
  ScreenshotPlanData,
  ScreenshotMockupData,
  ExperimentData,
  RecommendationData,
  KeywordSetData,
  CompetitorAppData,
} from "@/types";
import type { CreateProjectInput } from "@/lib/validations/project";
import {
  DEMO_ANALYSIS,
  DEMO_AUDIENCE_SEGMENTS,
  DEMO_COMPETITORS,
  DEMO_EXPERIMENTS,
  DEMO_KEYWORDS,
  DEMO_MESSAGING,
  DEMO_RECOMMENDATIONS,
  DEMO_SCREENSHOT_PLAN,
  DEMO_STORE_COPY,
} from "@/lib/ai/demo-data";
import {
  analyzeProductInput,
  buildProjectContext,
  generateAudienceSegments,
  generateExperimentIdeas,
  generateMessagingAngles,
  generateRecommendations,
  generateScreenshotPlan,
  generateStoreCopy,
} from "@/lib/ai/service";
import { slugify } from "@/lib/utils";

type DemoUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
};

type DemoWorkspace = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
};

type DemoIntegration = {
  id: string;
  provider: string;
  status: string;
  lastSyncedAt: Date | null;
  credentials?: Record<string, string> | null;
};

type DemoState = {
  user: DemoUser;
  workspace: DemoWorkspace;
  onboardingStep: number;
  onboardingDone: boolean;
  projects: ProjectWithRelations[];
  integrations: DemoIntegration[];
};

declare global {
  var __launchos_demo_state: DemoState | undefined;
}

const DEMO_USER_ID = "cdemouser00000000000000001";
const DEMO_WORKSPACE_ID = "cdemoworkspace000000000001";
const DEMO_PROJECT_ID = "cdemoprojectfittrack000001";
const DEMO_SECOND_PROJECT_ID = "cdemoprojectbudget0000001";
const DEMO_MOCKUP_BASE_URL = "https://placehold.co/1290x2796/0f172a/f8fafc/png?text=";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function makeId(label: string) {
  const normalized = label.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
  return `c${normalized.padEnd(24, "0")}`;
}

function createDemoId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `c${prefix.slice(0, 6).toLowerCase()}${timestamp}${random}`.slice(0, 25);
}

function buildPlaceholderUrl(label: string) {
  return `${DEMO_MOCKUP_BASE_URL}${encodeURIComponent(label)}`;
}

function decorateProject(project: ProjectWithRelations): ProjectWithRelations {
  return {
    ...project,
    _count: {
      listingVariants: project.listingVariants?.length ?? 0,
      experiments: project.experiments?.length ?? 0,
      recommendations: project.recommendations?.length ?? 0,
      audienceSegments: project.audienceSegments?.length ?? 0,
    },
  };
}

function getInitialProjects(workspaceId: string): ProjectWithRelations[] {
  const baseCreatedAt = new Date("2026-03-28T09:00:00.000Z");
  const audienceSegments: AudienceSegmentData[] = DEMO_AUDIENCE_SEGMENTS.map((segment, index) => ({
    id: makeId(`audience-${index + 1}`),
    projectId: DEMO_PROJECT_ID,
    name: segment.name,
    description: segment.description,
    demographics: segment.demographics ?? null,
    psychographics: segment.psychographics ?? null,
    painPoints: segment.painPoints,
    goals: segment.goals,
    isPrimary: segment.isPrimary,
    createdAt: new Date("2026-03-28T09:10:00.000Z"),
    updatedAt: new Date("2026-03-28T09:10:00.000Z"),
  }));

  const analysis: AppAnalysisData = {
    id: makeId("analysis-fittrack"),
    projectId: DEMO_PROJECT_ID,
    productSummary: DEMO_ANALYSIS.productSummary,
    keyDifferentiators: DEMO_ANALYSIS.keyDifferentiators,
    competitorContext: DEMO_ANALYSIS.competitorContext ?? null,
    rawInput: null,
    analysisStatus: "COMPLETED",
    createdAt: new Date("2026-03-28T09:05:00.000Z"),
    updatedAt: new Date("2026-03-28T09:12:00.000Z"),
  };

  const valueProps: ValuePropData[] = DEMO_MESSAGING.valueProps.map((item, index) => ({
    id: makeId(`valueprop-${index + 1}`),
    projectId: DEMO_PROJECT_ID,
    headline: item.headline,
    description: item.description,
    benefit: item.benefit,
    createdAt: new Date("2026-03-28T09:14:00.000Z"),
  }));

  const messagingAngles: MessagingAngleData[] = DEMO_MESSAGING.angles.map((item, index) => ({
    id: makeId(`angle-${index + 1}`),
    projectId: DEMO_PROJECT_ID,
    angle: item.angle,
    headline: item.headline,
    subheadline: item.subheadline ?? null,
    bodyText: item.bodyText ?? null,
    tone: item.tone,
    createdAt: new Date("2026-03-28T09:16:00.000Z"),
  }));

  const listingVariants: ListingVariantData[] = [
    {
      id: makeId("variant-ios-control"),
      projectId: DEMO_PROJECT_ID,
      audienceSegmentId: audienceSegments[0]?.id ?? null,
      platform: "IOS",
      locale: "en",
      variantName: "Control EN",
      appName: DEMO_STORE_COPY.ios?.appName ?? null,
      subtitle: DEMO_STORE_COPY.ios?.subtitle ?? null,
      promotionalText: DEMO_STORE_COPY.ios?.promotionalText ?? null,
      description: DEMO_STORE_COPY.ios?.description ?? null,
      shortDescription: null,
      keywords: DEMO_STORE_COPY.ios?.keywords ?? [],
      status: "LIVE",
      isControl: true,
      pushedToStore: true,
      pushedAt: new Date("2026-03-30T12:20:00.000Z"),
      createdAt: new Date("2026-03-29T11:00:00.000Z"),
      updatedAt: new Date("2026-03-30T12:20:00.000Z"),
      audienceSegment: audienceSegments[0]
        ? { name: audienceSegments[0].name }
        : null,
    },
    {
      id: makeId("variant-android-perf"),
      projectId: DEMO_PROJECT_ID,
      audienceSegmentId: audienceSegments[1]?.id ?? null,
      platform: "ANDROID",
      locale: "en",
      variantName: "Performance Angle",
      appName: DEMO_STORE_COPY.android?.title ?? null,
      subtitle: null,
      promotionalText: null,
      description: DEMO_STORE_COPY.android?.description ?? null,
      shortDescription: DEMO_STORE_COPY.android?.shortDescription ?? null,
      keywords: DEMO_STORE_COPY.android?.keywords ?? [],
      status: "DRAFT",
      isControl: false,
      pushedToStore: false,
      pushedAt: null,
      createdAt: new Date("2026-03-30T15:10:00.000Z"),
      updatedAt: new Date("2026-03-30T15:10:00.000Z"),
      audienceSegment: audienceSegments[1]
        ? { name: audienceSegments[1].name }
        : null,
    },
  ];

  const screenshotPlan: ScreenshotPlanData = {
    id: makeId("screenshot-plan-1"),
    projectId: DEMO_PROJECT_ID,
    platform: "IOS",
    locale: "en",
    name: "iOS Core Funnel",
    screens: DEMO_SCREENSHOT_PLAN,
    status: "COMPLETED",
    createdAt: new Date("2026-03-31T08:30:00.000Z"),
    updatedAt: new Date("2026-03-31T08:30:00.000Z"),
  };

  const screenshotMockups: ScreenshotMockupData[] = DEMO_SCREENSHOT_PLAN.slice(0, 3).map(
    (screen, index) => ({
      id: makeId(`mockup-${index + 1}`),
      projectId: DEMO_PROJECT_ID,
      screenshotPlanId: screenshotPlan.id,
      platform: "IOS",
      screenIndex: index,
      headline: screen.headline,
      subtext: screen.subtext,
      screenType: screen.screenType,
      imageUrl: buildPlaceholderUrl(screen.headline),
      storagePath: `demo/${DEMO_PROJECT_ID}/mockup-${index + 1}.png`,
      createdAt: new Date("2026-03-31T08:45:00.000Z"),
    })
  );

  const experiments: ExperimentData[] = DEMO_EXPERIMENTS.slice(0, 3).map((idea, index) => ({
    id: makeId(`experiment-${index + 1}`),
    projectId: DEMO_PROJECT_ID,
    name: idea.name,
    hypothesis: idea.hypothesis,
    elements: idea.elements,
    targetMetric: idea.targetMetric,
    priority: idea.priority,
    expectedImpact: idea.expectedImpact ?? null,
    status: index === 0 ? "RUNNING" : "PLANNED",
    startDate: index === 0 ? new Date("2026-04-01T09:00:00.000Z") : null,
    endDate: null,
    result: null,
    baselineValue: null,
    resultValue: null,
    sampleSize: null,
    confidence: null,
    winner: null,
    createdAt: new Date("2026-03-31T10:00:00.000Z"),
    updatedAt: new Date("2026-03-31T10:00:00.000Z"),
  }));

  const recommendations: RecommendationData[] = DEMO_RECOMMENDATIONS.slice(0, 4).map(
    (item, index) => ({
      id: makeId(`recommendation-${index + 1}`),
      projectId: DEMO_PROJECT_ID,
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      effort: item.effort,
      impact: item.impact ?? null,
      status: index === 2 ? "DONE" : index === 1 ? "IN_PROGRESS" : "OPEN",
      createdAt: new Date(`2026-03-${29 + index}T14:00:00.000Z`),
      updatedAt: new Date(`2026-03-${29 + index}T14:00:00.000Z`),
    })
  );

  const keywordSets: KeywordSetData[] = ["IOS", "ANDROID"].map((platform, platformIndex) => ({
    id: makeId(`keywordset-${platform.toLowerCase()}`),
    projectId: DEMO_PROJECT_ID,
    platform,
    locale: "en",
    createdAt: new Date(`2026-03-31T1${platformIndex}:30:00.000Z`),
    keywords: DEMO_KEYWORDS.map((keyword, index) => ({
      id: makeId(`keyword-${platformIndex}-${index + 1}`),
      keyword: keyword.keyword,
      volume: keyword.volume,
      difficulty: keyword.difficulty,
      chance: keyword.chance,
      rank: null,
      kei: null,
      source: keyword.source,
    })),
  }));

  const competitors: CompetitorAppData[] = DEMO_COMPETITORS.map((competitor, index) => ({
    id: makeId(`competitor-${index + 1}`),
    projectId: DEMO_PROJECT_ID,
    appId: competitor.appId,
    platform: competitor.platform,
    name: competitor.name,
    developer: competitor.developer ?? null,
    rating: competitor.rating ?? null,
    ratingCount: competitor.ratingCount ?? null,
    description: competitor.description ?? null,
    iconUrl: competitor.iconUrl ?? null,
    price: competitor.price ?? null,
    category: competitor.category ?? null,
    keywords: competitor.keywords,
    createdAt: new Date("2026-03-31T12:10:00.000Z"),
    updatedAt: new Date("2026-03-31T12:10:00.000Z"),
  }));

  const project: ProjectWithRelations = {
    id: DEMO_PROJECT_ID,
    name: "FitTrack Pro",
    platform: ["IOS", "ANDROID"],
    category: "HEALTH_FITNESS",
    description:
      "FitTrack Pro is a mobile fitness coach for busy professionals. It combines adaptive training plans, nutrition logging, recovery scoring, and lightweight AI guidance to keep users consistent without overwhelming them.",
    targetAudience:
      "Time-poor professionals who want guided fitness structure, simple progress visibility, and motivation without a complicated coach-led workflow.",
    pricingModel: "FREEMIUM",
    regions: ["US", "DE", "UK"],
    mainFeatures: [
      "Adaptive workout plans",
      "Recovery and readiness score",
      "Simple nutrition logging",
      "Weekly AI coaching recap",
    ],
    landingPageUrl: "https://launchos.demo/fittrack",
    appStoreUrl: "https://apps.apple.com/app/id1234567890",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.fittrack.pro",
    bundleId: "dev.launchos.fittrack",
    packageName: "dev.launchos.fittrack",
    status: "READY",
    locale: ["en", "de"],
    createdAt: baseCreatedAt,
    updatedAt: new Date("2026-04-01T10:30:00.000Z"),
    workspaceId,
    analysis,
    audienceSegments,
    valuePropitions: valueProps,
    messagingAngles,
    listingVariants,
    screenshotPlans: [screenshotPlan],
    screenshotMockups,
    experiments,
    recommendations,
    competitors,
    keywordSets,
  };

  const secondProject: ProjectWithRelations = {
    id: DEMO_SECOND_PROJECT_ID,
    name: "BudgetFlow",
    platform: ["IOS"],
    category: "FINANCE",
    description:
      "BudgetFlow helps freelancers plan cash flow, categorize business expenses, and forecast runway with a clean mobile-first interface.",
    targetAudience: "Freelancers and solo founders who need fast weekly cash flow visibility.",
    pricingModel: "SUBSCRIPTION",
    regions: ["US", "DE"],
    mainFeatures: ["Cash-flow dashboard", "Expense categorization", "Runway forecasting"],
    landingPageUrl: "https://launchos.demo/budgetflow",
    appStoreUrl: null,
    playStoreUrl: null,
    bundleId: "dev.launchos.budgetflow",
    packageName: null,
    status: "DRAFT",
    locale: ["en"],
    createdAt: new Date("2026-03-27T09:00:00.000Z"),
    updatedAt: new Date("2026-03-29T15:00:00.000Z"),
    workspaceId,
    analysis: null,
    audienceSegments: [],
    valuePropitions: [],
    messagingAngles: [],
    listingVariants: [],
    screenshotPlans: [],
    screenshotMockups: [],
    experiments: [],
    recommendations: [],
    competitors: [],
    keywordSets: [],
  };

  return [project, secondProject];
}

function createInitialState(): DemoState {
  const createdAt = new Date("2026-03-27T08:00:00.000Z");

  return {
    user: {
      id: DEMO_USER_ID,
      name: "Demo Operator",
      email: "demo@launchos.dev",
      image: null,
      createdAt,
    },
    workspace: {
      id: DEMO_WORKSPACE_ID,
      name: "LaunchOS Demo Workspace",
      slug: "launchos-demo-workspace",
      plan: "FREE",
      createdAt,
      updatedAt: new Date("2026-04-01T10:30:00.000Z"),
    },
    onboardingStep: 4,
    onboardingDone: true,
    projects: getInitialProjects(DEMO_WORKSPACE_ID),
    integrations: [
      {
        id: makeId("integration-apple"),
        provider: "APPLE_APP_STORE_CONNECT",
        status: "CONNECTED",
        lastSyncedAt: new Date("2026-04-01T08:30:00.000Z"),
        credentials: { issuerId: "demo-issuer", keyId: "DEMO123456" },
      },
      {
        id: makeId("integration-google"),
        provider: "GOOGLE_PLAY_DEVELOPER",
        status: "PENDING",
        lastSyncedAt: null,
        credentials: { serviceAccountEmail: "demo@launchos.dev" },
      },
    ],
  };
}

function getState() {
  if (!globalThis.__launchos_demo_state) {
    globalThis.__launchos_demo_state = createInitialState();
  }

  return globalThis.__launchos_demo_state;
}

function getProjectRef(projectId: string) {
  return getState().projects.find((project) => project.id === projectId);
}

function bumpProject(project: ProjectWithRelations) {
  project.updatedAt = new Date();
  project.status = project.analysis?.analysisStatus === "COMPLETED" ? "READY" : project.status;
}

export function getDemoSession(): Session {
  const state = getState();

  return {
    user: {
      id: state.user.id,
      name: state.user.name,
      email: state.user.email,
      image: state.user.image,
    },
    expires: "2999-12-31T23:59:59.999Z",
  };
}

export function getDemoUser() {
  return clone(getState().user);
}

export function getDemoWorkspace() {
  return clone(getState().workspace);
}

export function getDemoOnboardingState() {
  const state = getState();

  return {
    onboardingStep: state.onboardingStep,
    onboardingDone: state.onboardingDone,
  };
}

export function updateDemoOnboarding(step: number, done = false) {
  const state = getState();

  state.onboardingStep = step;
  if (done) {
    state.onboardingDone = true;
  }

  return getDemoOnboardingState();
}

export function getDemoProjects() {
  const state = getState();

  return clone(
    state.projects
      .map((project) => decorateProject(project))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  );
}

export function getDemoProject(projectId: string) {
  const project = getProjectRef(projectId);

  return project ? clone(decorateProject(project)) : null;
}

export function createDemoProject(input: CreateProjectInput) {
  const state = getState();
  const now = new Date();
  const project: ProjectWithRelations = {
    id: createDemoId("project"),
    name: input.name,
    platform: input.platform,
    category: input.category,
    description: input.description,
    targetAudience: input.targetAudience || null,
    pricingModel: input.pricingModel,
    regions: input.regions,
    mainFeatures: input.mainFeatures,
    landingPageUrl: input.landingPageUrl || null,
    appStoreUrl: input.appStoreUrl || null,
    playStoreUrl: input.playStoreUrl || null,
    bundleId: slugify(input.name),
    packageName: slugify(input.name).replace(/-/g, "."),
    status: "DRAFT",
    locale: input.locale,
    createdAt: now,
    updatedAt: now,
    workspaceId: state.workspace.id,
    analysis: null,
    audienceSegments: [],
    valuePropitions: [],
    messagingAngles: [],
    listingVariants: [],
    screenshotPlans: [],
    screenshotMockups: [],
    experiments: [],
    recommendations: [],
    competitors: [],
    keywordSets: [],
  };

  state.projects.unshift(project);
  state.workspace.updatedAt = now;

  return clone(decorateProject(project));
}

export async function runDemoAnalysis(projectId: string, extraContext?: string) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const projectContext = buildProjectContext(project);
  const [analysis, segments] = await Promise.all([
    analyzeProductInput(project.description, extraContext),
    generateAudienceSegments(projectContext),
  ]);
  const segmentsText = segments.map((segment) => `${segment.name}: ${segment.description}`).join("\n");
  const messaging = await generateMessagingAngles(projectContext, segmentsText);
  const timestamp = new Date();

  project.analysis = {
    id: project.analysis?.id ?? createDemoId("analysis"),
    projectId,
    productSummary: analysis.productSummary,
    keyDifferentiators: analysis.keyDifferentiators,
    competitorContext: analysis.competitorContext ?? null,
    rawInput: extraContext ?? null,
    analysisStatus: "COMPLETED",
    createdAt: project.analysis?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  project.audienceSegments = segments.map((segment, index) => ({
    id: createDemoId(`segment${index}`),
    projectId,
    name: segment.name,
    description: segment.description,
    demographics: segment.demographics ?? null,
    psychographics: segment.psychographics ?? null,
    painPoints: segment.painPoints,
    goals: segment.goals,
    isPrimary: segment.isPrimary,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  project.messagingAngles = messaging.angles.map((angle, index) => ({
    id: createDemoId(`angle${index}`),
    projectId,
    angle: angle.angle,
    headline: angle.headline,
    subheadline: angle.subheadline ?? null,
    bodyText: angle.bodyText ?? null,
    tone: angle.tone,
    createdAt: timestamp,
  }));

  project.valuePropitions = messaging.valueProps.map((item, index) => ({
    id: createDemoId(`value${index}`),
    projectId,
    headline: item.headline,
    description: item.description,
    benefit: item.benefit,
    createdAt: timestamp,
  }));

  bumpProject(project);

  return clone(decorateProject(project));
}

export async function createDemoStoreCopy(
  projectId: string,
  input: {
    platform: "IOS" | "ANDROID";
    locale: string;
    audienceSegmentId?: string;
    variantName: string;
  }
) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const audience = project.audienceSegments?.find(
    (segment) => segment.id === input.audienceSegmentId
  );
  const audienceContext = audience
    ? `${audience.name}: ${audience.description}`
    : undefined;
  const messagingContext = project.messagingAngles?.[0]
    ? `${project.messagingAngles[0].headline}: ${project.messagingAngles[0].bodyText ?? ""}`
    : undefined;
  const result = await generateStoreCopy(
    buildProjectContext(project),
    input.platform.toLowerCase() as "ios" | "android",
    input.locale,
    audienceContext,
    messagingContext
  );
  const timestamp = new Date();

  const variant: ListingVariantData =
    input.platform === "IOS"
      ? {
          id: createDemoId("variant"),
          projectId,
          audienceSegmentId: input.audienceSegmentId ?? null,
          platform: input.platform,
          locale: input.locale,
          variantName: input.variantName,
          appName: result.ios?.appName ?? null,
          subtitle: result.ios?.subtitle ?? null,
          promotionalText: result.ios?.promotionalText ?? null,
          description: result.ios?.description ?? null,
          shortDescription: null,
          keywords: result.ios?.keywords ?? [],
          status: "DRAFT",
          isControl: false,
          pushedToStore: false,
          pushedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
          audienceSegment: audience ? { name: audience.name } : null,
        }
      : {
          id: createDemoId("variant"),
          projectId,
          audienceSegmentId: input.audienceSegmentId ?? null,
          platform: input.platform,
          locale: input.locale,
          variantName: input.variantName,
          appName: result.android?.title ?? null,
          subtitle: null,
          promotionalText: null,
          description: result.android?.description ?? null,
          shortDescription: result.android?.shortDescription ?? null,
          keywords: result.android?.keywords ?? [],
          status: "DRAFT",
          isControl: false,
          pushedToStore: false,
          pushedAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
          audienceSegment: audience ? { name: audience.name } : null,
        };

  project.listingVariants = [variant, ...(project.listingVariants ?? [])];
  bumpProject(project);

  return clone(variant);
}

export async function createDemoScreenshotPlan(
  projectId: string,
  input: {
    platform: "IOS" | "ANDROID";
    locale: string;
    planName: string;
  }
) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const primaryAudience = project.audienceSegments?.find((segment) => segment.isPrimary);
  const screens = await generateScreenshotPlan(
    buildProjectContext(project),
    input.platform.toLowerCase() as "ios" | "android",
    primaryAudience ? `${primaryAudience.name}: ${primaryAudience.description}` : undefined
  );
  const timestamp = new Date();

  const plan: ScreenshotPlanData = {
    id: createDemoId("plan"),
    projectId,
    platform: input.platform,
    locale: input.locale,
    name: input.planName,
    screens,
    status: "COMPLETED",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  project.screenshotPlans = [plan, ...(project.screenshotPlans ?? [])];
  bumpProject(project);

  return clone(plan);
}

export function generateDemoMockups(
  projectId: string,
  input:
    | {
        batch: true;
        screenshotPlanId: string;
        platform?: "IOS" | "ANDROID";
      }
    | {
        batch?: false;
        screenshotPlanId?: string;
        platform?: "IOS" | "ANDROID";
        headline?: string;
        subtext?: string;
        screenType?: string;
        screenOrder?: number;
      }
) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const timestamp = new Date();

  if (input.batch) {
    const plan = project.screenshotPlans?.find((item) => item.id === input.screenshotPlanId);
    if (!plan) return null;

    const mockups = plan.screens.map((screen, index) => ({
      id: createDemoId("mockup"),
      projectId,
      screenshotPlanId: plan.id,
      platform: input.platform ?? plan.platform,
      screenIndex: index,
      headline: screen.headline,
      subtext: screen.subtext,
      screenType: screen.screenType,
      imageUrl: buildPlaceholderUrl(screen.headline),
      storagePath: `demo/${projectId}/${plan.id}-${index + 1}.png`,
      createdAt: timestamp,
    }));

    project.screenshotMockups = [
      ...(project.screenshotMockups ?? []).filter(
        (mockup) => mockup.screenshotPlanId !== plan.id
      ),
      ...mockups,
    ];
    bumpProject(project);

    return { count: mockups.length, mockups: clone(mockups) };
  }

  const mockup: ScreenshotMockupData = {
    id: createDemoId("mockup"),
    projectId,
    screenshotPlanId: input.screenshotPlanId ?? null,
    platform: input.platform ?? "IOS",
    screenIndex: input.screenOrder ?? 0,
    headline: input.headline ?? "Demo Screen",
    subtext: input.subtext ?? null,
    screenType: input.screenType ?? "feature",
    imageUrl: buildPlaceholderUrl(input.headline ?? "Demo Screen"),
    storagePath: `demo/${projectId}/${timestamp.getTime()}.png`,
    createdAt: timestamp,
  };

  project.screenshotMockups = [mockup, ...(project.screenshotMockups ?? [])];
  bumpProject(project);

  return { count: 1, mockup: clone(mockup) };
}

export async function createDemoExperiments(projectId: string) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const existingVariants = project.listingVariants?.map((variant) => variant.variantName).join(", ");
  const ideas = await generateExperimentIdeas(buildProjectContext(project), existingVariants);
  const timestamp = new Date();

  const experiments = ideas.map((idea) => ({
    id: createDemoId("exp"),
    projectId,
    name: idea.name,
    hypothesis: idea.hypothesis,
    elements: idea.elements,
    targetMetric: idea.targetMetric,
    priority: idea.priority,
    expectedImpact: idea.expectedImpact ?? null,
    status: "PLANNED",
    startDate: null,
    endDate: null,
    result: null,
    baselineValue: null,
    resultValue: null,
    sampleSize: null,
    confidence: null,
    winner: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  project.experiments = [...experiments, ...(project.experiments ?? [])];
  bumpProject(project);

  return clone(experiments);
}

export function updateDemoExperiment(
  projectId: string,
  experimentId: string,
  input: Partial<ExperimentData> & { status?: string }
) {
  const project = getProjectRef(projectId);
  if (!project?.experiments) return null;

  const experiment = project.experiments.find((item) => item.id === experimentId);
  if (!experiment) return null;

  if (input.status) {
    experiment.status = input.status;
    if (input.status === "RUNNING" && !experiment.startDate) {
      experiment.startDate = new Date();
    }
    if (input.status === "COMPLETED" || input.status === "CANCELLED") {
      experiment.endDate = new Date();
    }
  }
  if (input.result !== undefined) experiment.result = input.result;
  if (input.baselineValue !== undefined) experiment.baselineValue = input.baselineValue;
  if (input.resultValue !== undefined) experiment.resultValue = input.resultValue;
  if (input.sampleSize !== undefined) experiment.sampleSize = input.sampleSize;
  if (input.confidence !== undefined) experiment.confidence = input.confidence;
  if (input.winner !== undefined) experiment.winner = input.winner;

  experiment.updatedAt = new Date();
  bumpProject(project);

  return clone(experiment);
}

export function deleteDemoExperiment(projectId: string, experimentId: string) {
  const project = getProjectRef(projectId);
  if (!project?.experiments) return false;

  const next = project.experiments.filter((item) => item.id !== experimentId);
  if (next.length === project.experiments.length) return false;

  project.experiments = next;
  bumpProject(project);

  return true;
}

export async function createDemoRecommendations(projectId: string) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const context = `${buildProjectContext(project)}

Analysis Summary: ${project.analysis?.productSummary ?? "Not analyzed yet"}
Store Variants: ${project.listingVariants?.length ?? 0}
Screenshot Plans: ${project.screenshotPlans?.length ?? 0}`;
  const items = await generateRecommendations(context);
  const timestamp = new Date();

  const recommendations = items.map((item) => ({
    id: createDemoId("rec"),
    projectId,
    title: item.title,
    description: item.description,
    category: item.category,
    priority: item.priority,
    effort: item.effort,
    impact: item.impact ?? null,
    status: "OPEN",
    createdAt: timestamp,
    updatedAt: timestamp,
  }));

  project.recommendations = [...recommendations, ...(project.recommendations ?? [])];
  bumpProject(project);

  return clone(recommendations);
}

export function updateDemoRecommendation(projectId: string, recommendationId: string, status: string) {
  const project = getProjectRef(projectId);
  if (!project?.recommendations) return null;

  const recommendation = project.recommendations.find((item) => item.id === recommendationId);
  if (!recommendation) return null;

  recommendation.status = status;
  recommendation.updatedAt = new Date();
  bumpProject(project);

  return clone(recommendation);
}

export function createDemoKeywordSet(
  projectId: string,
  input: {
    platform: "IOS" | "ANDROID";
    locale?: string;
    seedKeywords?: string[];
  }
) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const locale = input.locale ?? "en";
  const additionalKeywords = (input.seedKeywords ?? [])
    .slice(0, 4)
    .filter((keyword) => keyword.trim().length > 0)
    .map((keyword, index) => ({
      id: createDemoId(`seed${index}`),
      keyword: keyword.toLowerCase(),
      volume: null,
      difficulty: null,
      chance: null,
      rank: null,
      kei: null,
      source: "AI_SUGGESTED",
    }));

  const keywordSet: KeywordSetData = {
    id: createDemoId("keywordset"),
    projectId,
    platform: input.platform,
    locale,
    createdAt: new Date(),
    keywords: [
      ...DEMO_KEYWORDS.map((item, index) => ({
        id: createDemoId(`kw${index}`),
        keyword: item.keyword,
        volume: item.volume,
        difficulty: item.difficulty,
        chance: item.chance,
        rank: null,
        kei: null,
        source: item.source,
      })),
      ...additionalKeywords,
    ],
  };

  project.keywordSets = [
    keywordSet,
    ...(project.keywordSets ?? []).filter(
      (existing) => !(existing.platform === input.platform && existing.locale === locale)
    ),
  ];
  bumpProject(project);

  return clone(keywordSet);
}

export function getLatestDemoKeywordSet(projectId: string, platform?: string, locale = "en") {
  const project = getProjectRef(projectId);
  if (!project?.keywordSets) return null;

  const keywordSet = project.keywordSets.find(
    (item) => (!platform || item.platform === platform) && item.locale === locale
  );

  return keywordSet ? clone(keywordSet) : null;
}

export function getDemoCompetitors(projectId: string, platform?: string) {
  const project = getProjectRef(projectId);
  if (!project?.competitors) return [];

  const competitors = platform
    ? project.competitors.filter((item) => item.platform === platform)
    : project.competitors;

  return clone(competitors);
}

export function searchDemoCompetitors(
  projectId: string,
  input: { platform: "IOS" | "ANDROID"; query?: string }
) {
  const project = getProjectRef(projectId);
  if (!project) return null;

  const normalizedQuery = input.query?.trim().toLowerCase() ?? "";
  const results = DEMO_COMPETITORS.filter((competitor) => {
    if (competitor.platform !== input.platform) return false;
    if (!normalizedQuery) return true;

    const haystack = [
      competitor.name,
      competitor.developer ?? "",
      competitor.description ?? "",
      ...(competitor.keywords ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  }).map((competitor) => ({
    id: createDemoId("comp"),
    projectId,
    appId: competitor.appId,
    platform: competitor.platform,
    name: competitor.name,
    developer: competitor.developer ?? null,
    rating: competitor.rating ?? null,
    ratingCount: competitor.ratingCount ?? null,
    description: competitor.description ?? null,
    iconUrl: competitor.iconUrl ?? null,
    price: competitor.price ?? null,
    category: competitor.category ?? null,
    keywords: competitor.keywords,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const others = project.competitors?.filter((competitor) => competitor.platform !== input.platform) ?? [];
  const merged = new Map<string, CompetitorAppData>();
  [...others, ...results].forEach((competitor) => {
    merged.set(`${competitor.platform}:${competitor.appId}`, competitor);
  });

  project.competitors = Array.from(merged.values());
  bumpProject(project);

  return clone(results);
}

export function deleteDemoCompetitor(
  projectId: string,
  input: { competitorId?: string; appId?: string; platform?: string }
) {
  const project = getProjectRef(projectId);
  if (!project?.competitors) return false;

  const next = project.competitors.filter((competitor) => {
    if (input.competitorId) {
      return competitor.id !== input.competitorId;
    }

    if (input.appId && input.platform) {
      return !(competitor.appId === input.appId && competitor.platform === input.platform);
    }

    return true;
  });

  if (next.length === project.competitors.length) return false;

  project.competitors = next;
  bumpProject(project);

  return true;
}

export function markDemoVariantAsPushed(projectId: string, variantId: string) {
  const project = getProjectRef(projectId);
  if (!project?.listingVariants) return null;

  const variant = project.listingVariants.find((item) => item.id === variantId);
  if (!variant) return null;

  variant.pushedToStore = true;
  variant.pushedAt = new Date();
  variant.status = "LIVE";
  variant.updatedAt = new Date();
  bumpProject(project);

  return clone(variant);
}

export function getDemoIntegrations() {
  return clone(getState().integrations);
}

export function upsertDemoIntegration(provider: string, credentials: Record<string, string>) {
  const state = getState();
  const existing = state.integrations.find((item) => item.provider === provider);

  if (existing) {
    existing.credentials = credentials;
    existing.status = "PENDING";
    existing.lastSyncedAt = null;
    return clone(existing);
  }

  const integration: DemoIntegration = {
    id: createDemoId("integration"),
    provider,
    status: "PENDING",
    lastSyncedAt: null,
    credentials,
  };
  state.integrations.push(integration);

  return clone(integration);
}

export function testDemoIntegration(provider: string) {
  const integration = getState().integrations.find((item) => item.provider === provider);
  if (!integration) return null;

  integration.status = "CONNECTED";
  integration.lastSyncedAt = new Date();

  return {
    integration: clone(integration),
    apps:
      provider === "APPLE_APP_STORE_CONNECT"
        ? [{ id: "1234567890", name: "FitTrack Pro" }]
        : undefined,
  };
}

export function disconnectDemoIntegration(provider: string) {
  const integration = getState().integrations.find((item) => item.provider === provider);
  if (!integration) return false;

  integration.status = "DISCONNECTED";
  integration.credentials = null;
  integration.lastSyncedAt = null;

  return true;
}

export function setDemoPlan(plan: string) {
  const state = getState();
  state.workspace.plan = plan;
  state.workspace.updatedAt = new Date();

  return getDemoWorkspace();
}
