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

// ─── Analysis ─────────────────────────────────────────────────────────────────

export async function analyzeProductInput(
  description: string,
  extraContext?: string
): Promise<AIAnalysisResult> {
  logger.info("AI: analyzeProductInput");
  const result = await callOpenAI<AIAnalysisResult>(
    SYSTEM_PROMPTS.ANALYSIS,
    buildAnalysisPrompt(description, extraContext),
    { temperature: 0.5 }
  );
  return result;
}

// ─── Audience Segments ────────────────────────────────────────────────────────

export async function generateAudienceSegments(projectContext: string): Promise<AIAudienceSegment[]> {
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
  logger.info(`AI: generateStoreCopy [${platform}/${locale}]`);
  const result = await callOpenAI<Record<string, unknown>>(
    SYSTEM_PROMPTS.STORE_COPY,
    buildStoreCopyPrompt(projectContext, platform, locale, audienceContext, messagingContext),
    { temperature: 0.7, maxTokens: 3000 }
  );

  if (platform === "ios") {
    return { ios: result as AIStoreCopy["ios"] };
  }
  return { android: result as AIStoreCopy["android"] };
}

// ─── Screenshot Plan ──────────────────────────────────────────────────────────

export async function generateScreenshotPlan(
  projectContext: string,
  platform: "ios" | "android",
  audienceContext?: string
): Promise<AIScreenItem[]> {
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
