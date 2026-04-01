export type {
  User,
  Workspace,
  WorkspaceMember,
  Project,
  AppAnalysis,
  AudienceSegment,
  ValueProp,
  MessagingAngle,
  ListingVariant,
  ScreenshotPlan,
  Experiment,
  Recommendation,
  UploadedAsset,
  BillingCustomer,
  Integration,
  CompetitorApp,
  KeywordSet,
  KeywordData,
  ScreenshotMockup,
} from "@prisma/client";

export type {
  Plan,
  WorkspaceRole,
  Platform,
  AppCategory,
  PricingModel,
  ProjectStatus,
  VariantStatus,
  JobStatus,
  ExperimentStatus,
  RecommendationCategory,
  RecommendationStatus,
  Priority,
  Effort,
  AssetType,
  IntegrationProvider,
  IntegrationStatus,
  KeywordSource,
} from "@prisma/client";

// ─── Extended Types ──────────────────────────────────────────────────────────

export interface ProjectWithRelations {
  id: string;
  name: string;
  platform: string[];
  category: string;
  description: string;
  targetAudience?: string | null;
  pricingModel: string;
  regions: string[];
  mainFeatures: string[];
  landingPageUrl?: string | null;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  bundleId?: string | null;
  packageName?: string | null;
  status: string;
  locale: string[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  analysis?: AppAnalysisData | null;
  audienceSegments?: AudienceSegmentData[];
  valuePropitions?: ValuePropData[];
  messagingAngles?: MessagingAngleData[];
  listingVariants?: ListingVariantData[];
  screenshotPlans?: ScreenshotPlanData[];
  screenshotMockups?: ScreenshotMockupData[];
  experiments?: ExperimentData[];
  recommendations?: RecommendationData[];
  competitors?: CompetitorAppData[];
  keywordSets?: KeywordSetData[];
  _count?: ProjectCounts;
}

export interface ProjectCounts {
  listingVariants: number;
  experiments: number;
  recommendations: number;
  audienceSegments: number;
}

export interface AppAnalysisData {
  id: string;
  projectId: string;
  productSummary: string;
  keyDifferentiators: string[];
  competitorContext?: string | null;
  rawInput?: string | null;
  analysisStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudienceSegmentData {
  id: string;
  projectId: string;
  name: string;
  description: string;
  demographics?: string | null;
  psychographics?: string | null;
  painPoints: string[];
  goals: string[];
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ValuePropData {
  id: string;
  projectId: string;
  headline: string;
  description: string;
  benefit: string;
  createdAt: Date;
}

export interface MessagingAngleData {
  id: string;
  projectId: string;
  angle: string;
  headline: string;
  subheadline?: string | null;
  bodyText?: string | null;
  tone: string;
  createdAt: Date;
}

export interface ListingVariantData {
  id: string;
  projectId: string;
  audienceSegmentId?: string | null;
  platform: string;
  locale: string;
  variantName: string;
  appName?: string | null;
  subtitle?: string | null;
  promotionalText?: string | null;
  description?: string | null;
  shortDescription?: string | null;
  keywords: string[];
  status: string;
  isControl: boolean;
  pushedToStore: boolean;
  pushedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  audienceSegment?: { name: string } | null;
}

export interface ScreenItem {
  order: number;
  headline: string;
  subtext: string;
  feature: string;
  goal: string;
  screenType: "hero" | "feature" | "social_proof" | "cta";
  backgroundHint: string;
}

export interface ScreenshotPlanData {
  id: string;
  projectId: string;
  platform: string;
  locale: string;
  name: string;
  screens: ScreenItem[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExperimentData {
  id: string;
  projectId: string;
  name: string;
  hypothesis: string;
  elements: string[];
  targetMetric: string;
  priority: string;
  expectedImpact?: string | null;
  status: string;
  startDate?: Date | null;
  endDate?: Date | null;
  result?: string | null;
  baselineValue?: number | null;
  resultValue?: number | null;
  sampleSize?: number | null;
  confidence?: number | null;
  winner?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorAppData {
  id: string;
  projectId: string;
  appId: string;
  platform: string;
  name: string;
  developer?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  description?: string | null;
  iconUrl?: string | null;
  price?: number | null;
  category?: string | null;
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KeywordDataItem {
  id: string;
  keyword: string;
  volume?: number | null;
  difficulty?: number | null;
  chance?: number | null;
  rank?: number | null;
  kei?: number | null;
  source: string;
}

export interface KeywordSetData {
  id: string;
  projectId: string;
  platform: string;
  locale: string;
  createdAt: Date;
  keywords: KeywordDataItem[];
}

export interface ScreenshotMockupData {
  id: string;
  projectId: string;
  screenshotPlanId?: string | null;
  platform: string;
  screenIndex: number;
  headline?: string | null;
  subtext?: string | null;
  screenType: string;
  imageUrl: string;
  storagePath: string;
  createdAt: Date;
}

export interface RecommendationData {
  id: string;
  projectId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  effort: string;
  impact?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── AI Service Types ────────────────────────────────────────────────────────

export interface AIAnalysisResult {
  productSummary: string;
  keyDifferentiators: string[];
  competitorContext?: string;
}

export interface AIAudienceSegment {
  name: string;
  description: string;
  demographics: string;
  psychographics: string;
  painPoints: string[];
  goals: string[];
  isPrimary: boolean;
}

export interface AIMessagingAngle {
  angle: string;
  headline: string;
  subheadline: string;
  bodyText: string;
  tone: string;
}

export interface AIValueProp {
  headline: string;
  description: string;
  benefit: string;
}

export interface AIStoreCopy {
  ios?: {
    appName: string;
    subtitle: string;
    promotionalText: string;
    description: string;
    keywords: string[];
  };
  android?: {
    title: string;
    shortDescription: string;
    description: string;
    keywords: string[];
  };
}

export interface AIScreenItem {
  order: number;
  headline: string;
  subtext: string;
  feature: string;
  goal: string;
  screenType: "hero" | "feature" | "social_proof" | "cta";
  backgroundHint: string;
}

export interface AIExperimentIdea {
  name: string;
  hypothesis: string;
  elements: string[];
  targetMetric: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  expectedImpact: string;
}

export interface AIRecommendation {
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  effort: "LOW" | "MEDIUM" | "HIGH";
  impact: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
