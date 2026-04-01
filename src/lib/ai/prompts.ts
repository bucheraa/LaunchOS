export const SYSTEM_PROMPTS = {
  ANALYSIS: `You are an expert mobile app marketing strategist and ASO (App Store Optimization) specialist.
Your task is to analyze mobile app descriptions and extract structured insights.
Always respond with valid JSON matching the requested schema exactly.
Be specific, actionable, and data-driven in your analysis.`,

  AUDIENCE: `You are a B2C market research expert specializing in mobile app user segmentation.
You identify distinct user personas with precision and create actionable segment profiles.
Always respond with valid JSON matching the requested schema exactly.`,

  MESSAGING: `You are a conversion copywriter specializing in app store marketing and mobile growth.
You craft compelling messaging angles that connect product features to user benefits.
Always respond with valid JSON matching the requested schema exactly.`,

  STORE_COPY: `You are an expert in App Store Optimization (ASO) with deep knowledge of both
Apple App Store and Google Play Store best practices.
You write high-converting app store listings that rank well and convert browsers to installs.
Always respond with valid JSON matching the requested schema exactly.
Follow character limits: iOS app name (30 chars), iOS subtitle (30 chars), iOS promotional text (170 chars),
iOS description (4000 chars), Android title (50 chars), Android short description (80 chars),
Android description (4000 chars).`,

  SCREENSHOTS: `You are a mobile app marketing designer and conversion rate optimization expert.
You plan compelling screenshot sequences that communicate value props and drive installs.
Always respond with valid JSON matching the requested schema exactly.`,

  EXPERIMENTS: `You are a growth product manager specializing in A/B testing for app store optimization.
You design statistically sound experiments with clear hypotheses and measurable outcomes.
Always respond with valid JSON matching the requested schema exactly.`,

  RECOMMENDATIONS: `You are a senior ASO and mobile growth consultant.
You provide prioritized, actionable recommendations based on app analysis.
Always respond with valid JSON matching the requested schema exactly.`,
};

export function buildAnalysisPrompt(description: string, extraContext?: string): string {
  return `Analyze this mobile app and provide a structured analysis:

App Description:
${description}

${extraContext ? `Additional Context:\n${extraContext}` : ""}

Return JSON with this exact structure:
{
  "productSummary": "2-3 sentence summary of what the product does and its unique approach",
  "keyDifferentiators": ["differentiator 1", "differentiator 2", "differentiator 3", "differentiator 4"],
  "competitorContext": "Brief description of the competitive landscape and how this app positions against it"
}`;
}

export function buildAudiencePrompt(projectContext: string): string {
  return `Based on this mobile app, identify 3-4 distinct target audience segments:

${projectContext}

Return JSON with this exact structure:
{
  "segments": [
    {
      "name": "Short descriptive persona name (e.g. 'The Busy Parent')",
      "description": "2-3 sentence description of this audience",
      "demographics": "Age range, location, income, occupation",
      "psychographics": "Values, lifestyle, personality traits",
      "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
      "goals": ["goal 1", "goal 2", "goal 3"],
      "isPrimary": true/false
    }
  ]
}`;
}

export function buildMessagingPrompt(projectContext: string, segments: string): string {
  return `Create compelling messaging angles for this mobile app targeting these audience segments:

App Context:
${projectContext}

Target Segments:
${segments}

Return JSON with this exact structure:
{
  "angles": [
    {
      "angle": "Angle name (e.g. 'Performance & Results')",
      "headline": "Primary headline (under 60 chars)",
      "subheadline": "Supporting headline (under 80 chars)",
      "bodyText": "2-3 sentence supporting copy",
      "tone": "Describe the tone (e.g. 'Confident, data-driven')"
    }
  ],
  "valueProps": [
    {
      "headline": "Value prop headline (under 50 chars)",
      "description": "1-2 sentence description",
      "benefit": "Core user benefit"
    }
  ]
}`;
}

export function buildStoreCopyPrompt(
  projectContext: string,
  platform: "ios" | "android",
  locale: string,
  audienceContext?: string,
  messagingContext?: string
): string {
  const platformGuidance =
    platform === "ios"
      ? `iOS App Store requirements:
- App Name: max 30 characters (include main keyword)
- Subtitle: max 30 characters (include secondary keywords)
- Promotional Text: max 170 characters (changeable without update, use for promotions/news)
- Description: max 4000 characters (first 250 chars visible before "More" expansion)
- Keywords: comma-separated, max 100 characters total`
      : `Google Play Store requirements:
- Title: max 50 characters (include main keyword)
- Short Description: max 80 characters (appears in search results)
- Description: max 4000 characters (use HTML formatting sparingly)`;

  return `Generate optimized ${platform === "ios" ? "iOS App Store" : "Google Play Store"} listing copy in ${locale === "de" ? "German" : "English"}.

${platformGuidance}

App Context:
${projectContext}

${audienceContext ? `Target Audience:\n${audienceContext}` : ""}
${messagingContext ? `Messaging Direction:\n${messagingContext}` : ""}

Return JSON with this exact structure for ${platform}:
${
  platform === "ios"
    ? `{
  "appName": "App name (max 30 chars)",
  "subtitle": "Subtitle (max 30 chars)",
  "promotionalText": "Promotional text (max 170 chars)",
  "description": "Full description (up to 4000 chars, use \\n for newlines)",
  "keywords": ["keyword1", "keyword2"]
}`
    : `{
  "title": "Title (max 50 chars)",
  "shortDescription": "Short description (max 80 chars)",
  "description": "Full description (up to 4000 chars)",
  "keywords": ["keyword1", "keyword2"]
}`
}`;
}

export function buildScreenshotPlanPrompt(
  projectContext: string,
  platform: "ios" | "android",
  audienceContext?: string
): string {
  const screenCount = platform === "ios" ? 6 : 8;
  return `Create a compelling screenshot plan for a ${platform === "ios" ? "iOS" : "Android"} app store listing.

App Context:
${projectContext}

${audienceContext ? `Target Audience:\n${audienceContext}` : ""}

Design ${screenCount} screenshots that tell a compelling story from awareness to conversion.
Screenshot sequence best practices:
1. First screenshot is most important — must communicate core value instantly
2. Each screenshot builds on the previous
3. Include a mix of feature showcases and benefit statements
4. End with a clear CTA or trust signal

Return JSON with this exact structure:
{
  "screens": [
    {
      "order": 1,
      "headline": "Bold headline text (under 40 chars)",
      "subtext": "Supporting text (under 60 chars)",
      "feature": "Which app feature is being shown",
      "goal": "What this screenshot should achieve",
      "screenType": "hero|feature|social_proof|cta",
      "backgroundHint": "Description of what the app screen/UI should show"
    }
  ]
}`;
}

export function buildExperimentsPrompt(
  projectContext: string,
  existingVariants?: string
): string {
  return `Generate A/B test ideas for this app's store listing optimization.

App Context:
${projectContext}

${existingVariants ? `Existing Variants:\n${existingVariants}` : ""}

Return JSON with this exact structure:
{
  "experiments": [
    {
      "name": "Experiment name",
      "hypothesis": "If we [change X], then [metric Y] will [improve Z] because [reason]",
      "elements": ["element being tested"],
      "targetMetric": "Primary metric to measure",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "expectedImpact": "Expected percentage improvement range"
    }
  ]
}`;
}

export function buildRecommendationsPrompt(projectContext: string): string {
  return `Analyze this app's store presence and provide prioritized recommendations.

${projectContext}

Return JSON with this exact structure:
{
  "recommendations": [
    {
      "title": "Short actionable title",
      "description": "Detailed explanation of the issue and recommended fix",
      "category": "STORE_LISTING|SCREENSHOTS|ASO|MONETIZATION|ONBOARDING|RETENTION|ACQUISITION|OTHER",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "effort": "LOW|MEDIUM|HIGH",
      "impact": "Expected impact description with metrics if possible"
    }
  ]
}`;
}
