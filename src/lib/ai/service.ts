import { callOpenAI } from "./client";
import {
  SYSTEM_PROMPTS,
  buildAnalysisPrompt,
  buildAudiencePrompt,
  buildMessagingPrompt,
  buildStoreCopyPrompt,
  buildScreenshotPlanPrompt,
  buildExperimentsPrompt,
  buildRecommendationsPrompt,
} from "./prompts";
import {
  DEMO_ANALYSIS,
  DEMO_AUDIENCE_SEGMENTS,
  DEMO_MESSAGING,
  DEMO_STORE_COPY,
  DEMO_SCREENSHOT_PLAN,
  DEMO_EXPERIMENTS,
  DEMO_RECOMMENDATIONS,
} from "./demo-data";
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
import { logger } from "@/lib/utils/logger";

const DEMO = process.env.DEMO_MODE === "true";

// Simulate a small async delay in demo mode so the UI loading states still show
function demoDelay(ms = 800) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export async function analyzeProductInput(
  description: string,
  extraContext?: string
): Promise<AIAnalysisResult> {
  if (DEMO) {
    logger.info("[DEMO] analyzeProductInput — returning mock data");
    await demoDelay(1200);
    return DEMO_ANALYSIS;
  }
  logger.info("AI: analyzeProductInput");
  return callOpenAI<AIAnalysisResult>(
    SYSTEM_PROMPTS.ANALYSIS,
    buildAnalysisPrompt(description, extraContext),
    { temperature: 0.5 }
  );
}

// ─── Audience Segments ────────────────────────────────────────────────────────

export async function generateAudienceSegments(projectContext: string): Promise<AIAudienceSegment[]> {
  if (DEMO) {
    logger.info("[DEMO] generateAudienceSegments — returning mock data");
    await demoDelay(600);
    return DEMO_AUDIENCE_SEGMENTS;
  }
  logger.info("AI: generateAudienceSegments");
  const result = await callOpenAI<{ segments: AIAudienceSegment[] }>(
    SYSTEM_PROMPTS.AUDIENCE,
    buildAudiencePrompt(projectContext),
    { temperature: 0.7 }
  );
  return result.segments ?? [];
}

// ─── Messaging Angles ─────────────────────────────────────────────────────────

export async function generateMessagingAngles(
  projectContext: string,
  segments: string
): Promise<{ angles: AIMessagingAngle[]; valueProps: AIValueProp[] }> {
  if (DEMO) {
    logger.info("[DEMO] generateMessagingAngles — returning mock data");
    await demoDelay(600);
    return DEMO_MESSAGING;
  }
  logger.info("AI: generateMessagingAngles");
  const result = await callOpenAI<{ angles: AIMessagingAngle[]; valueProps: AIValueProp[] }>(
    SYSTEM_PROMPTS.MESSAGING,
    buildMessagingPrompt(projectContext, segments),
    { temperature: 0.8 }
  );
  return {
    angles: result.angles ?? [],
    valueProps: result.valueProps ?? [],
  };
}

// ─── Store Copy ───────────────────────────────────────────────────────────────

export async function generateStoreCopy(
  projectContext: string,
  platform: "ios" | "android",
  locale: string,
  audienceContext?: string,
  messagingContext?: string
): Promise<AIStoreCopy> {
  if (DEMO) {
    logger.info(`[DEMO] generateStoreCopy [${platform}/${locale}] — returning mock data`);
    await demoDelay(1000);
    if (platform === "ios") return { ios: DEMO_STORE_COPY.ios };
    return { android: DEMO_STORE_COPY.android };
  }
  logger.info(`AI: generateStoreCopy [${platform}/${locale}]`);
  const result = await callOpenAI<Record<string, unknown>>(
    SYSTEM_PROMPTS.STORE_COPY,
    buildStoreCopyPrompt(projectContext, platform, locale, audienceContext, messagingContext),
    { temperature: 0.7, maxTokens: 3000 }
  );
  if (platform === "ios") return { ios: result as AIStoreCopy["ios"] };
  return { android: result as AIStoreCopy["android"] };
}

// ─── Screenshot Plan ──────────────────────────────────────────────────────────

export async function generateScreenshotPlan(
  projectContext: string,
  platform: "ios" | "android",
  audienceContext?: string
): Promise<AIScreenItem[]> {
  if (DEMO) {
    logger.info(`[DEMO] generateScreenshotPlan [${platform}] — returning mock data`);
    await demoDelay(800);
    return DEMO_SCREENSHOT_PLAN;
  }
  logger.info(`AI: generateScreenshotPlan [${platform}]`);
  const result = await callOpenAI<{ screens: AIScreenItem[] }>(
    SYSTEM_PROMPTS.SCREENSHOTS,
    buildScreenshotPlanPrompt(projectContext, platform, audienceContext),
    { temperature: 0.7, maxTokens: 2000 }
  );
  return result.screens ?? [];
}

// ─── Experiment Ideas ─────────────────────────────────────────────────────────

export async function generateExperimentIdeas(
  projectContext: string,
  existingVariants?: string
): Promise<AIExperimentIdea[]> {
  if (DEMO) {
    logger.info("[DEMO] generateExperimentIdeas — returning mock data");
    await demoDelay(800);
    return DEMO_EXPERIMENTS;
  }
  logger.info("AI: generateExperimentIdeas");
  const result = await callOpenAI<{ experiments: AIExperimentIdea[] }>(
    SYSTEM_PROMPTS.EXPERIMENTS,
    buildExperimentsPrompt(projectContext, existingVariants),
    { temperature: 0.8 }
  );
  return result.experiments ?? [];
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export async function generateRecommendations(
  projectContext: string
): Promise<AIRecommendation[]> {
  if (DEMO) {
    logger.info("[DEMO] generateRecommendations — returning mock data");
    await demoDelay(700);
    return DEMO_RECOMMENDATIONS;
  }
  logger.info("AI: generateRecommendations");
  const result = await callOpenAI<{ recommendations: AIRecommendation[] }>(
    SYSTEM_PROMPTS.RECOMMENDATIONS,
    buildRecommendationsPrompt(projectContext),
    { temperature: 0.6 }
  );
  return result.recommendations ?? [];
}

// ─── Context Builders ─────────────────────────────────────────────────────────

export function buildProjectContext(project: {
  name: string;
  description: string;
  category: string;
  platform: string[];
  pricingModel: string;
  mainFeatures: string[];
  targetAudience?: string | null;
  regions?: string[];
}): string {
  return `App Name: ${project.name}
Category: ${project.category}
Platforms: ${project.platform.join(", ")}
Pricing: ${project.pricingModel}
Target Regions: ${(project.regions ?? []).join(", ")}

Description:
${project.description}

${project.targetAudience ? `Target Audience:\n${project.targetAudience}` : ""}

Main Features:
${project.mainFeatures.map((f) => `- ${f}`).join("\n")}`;
}
