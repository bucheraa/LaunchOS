import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  platform: z
    .array(z.enum(["IOS", "ANDROID"]))
    .min(1, "Select at least one platform"),
  category: z.enum([
    "PRODUCTIVITY",
    "SOCIAL",
    "HEALTH_FITNESS",
    "FINANCE",
    "EDUCATION",
    "ENTERTAINMENT",
    "LIFESTYLE",
    "SHOPPING",
    "TRAVEL",
    "FOOD_DRINK",
    "NEWS",
    "PHOTO_VIDEO",
    "MUSIC",
    "GAMES",
    "UTILITIES",
    "DEVELOPER_TOOLS",
    "BUSINESS",
    "OTHER",
  ]),
  description: z.string().min(50, "Description must be at least 50 characters").max(5000),
  targetAudience: z.string().max(1000).optional(),
  pricingModel: z.enum(["FREE", "FREEMIUM", "SUBSCRIPTION", "ONE_TIME", "PAYWALLED"]),
  regions: z.array(z.string()).min(1, "Select at least one region"),
  mainFeatures: z
    .array(z.string().min(2).max(100))
    .min(1, "Add at least one feature")
    .max(10),
  landingPageUrl: z.string().url().optional().or(z.literal("")),
  appStoreUrl: z.string().url().optional().or(z.literal("")),
  playStoreUrl: z.string().url().optional().or(z.literal("")),
  locale: z.array(z.string()).min(1).default(["en"]),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const analyzeProjectSchema = z.object({
  projectId: z.string().cuid(),
  additionalContext: z.string().max(2000).optional(),
});

export const generateStoreCopySchema = z.object({
  projectId: z.string().cuid(),
  platform: z.enum(["IOS", "ANDROID"]),
  locale: z.string().default("en"),
  audienceSegmentId: z.string().cuid().optional(),
  variantName: z.string().min(1).max(100),
});

export const generateScreenshotPlanSchema = z.object({
  projectId: z.string().cuid(),
  platform: z.enum(["IOS", "ANDROID"]),
  locale: z.string().default("en"),
  planName: z.string().min(1).max(100),
});

export const updateRecommendationStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "DISMISSED"]),
});

export const updateExperimentStatusSchema = z.object({
  status: z.enum(["PLANNED", "RUNNING", "PAUSED", "COMPLETED", "CANCELLED"]),
  result: z.string().optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
