/**
 * Unified Keyword Research Service.
 *
 * Strategy:
 * 1. If APPFOLLOW_API_KEY is set → use AppFollow (real search volume + difficulty)
 * 2. Otherwise → use iTunes Autocomplete (free, real suggestions, no volume data)
 * 3. AI-suggested keywords from analysis are always included
 *
 * This means the app delivers real value even without paid API keys.
 */

import { createAppFollowClient } from "./appfollow";
import { getKeywordSuggestions, enrichWithCompetition } from "./itunes";
import { db } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import type { Platform } from "@prisma/client";

export interface NormalizedKeyword {
  keyword: string;
  volume: number | null;       // 0–100 normalized or null
  difficulty: number | null;   // 0–100 or null
  chance: number | null;
  currentRank: number | null;
  trending: boolean;
  source: "APPFOLLOW" | "ITUNES_AUTOCOMPLETE" | "AI_SUGGESTED" | "MANUAL";
}

export async function researchKeywords(
  projectId: string,
  platform: Platform,
  locale: string,
  seedKeywords: string[],
  appId?: string // App Store app ID or bundle ID (for AppFollow)
): Promise<NormalizedKeyword[]> {
  const appFollow = createAppFollowClient();
  const platformLower = platform.toLowerCase() as "ios" | "android";
  const country = locale === "de" ? "de" : "us";

  let keywords: NormalizedKeyword[] = [];

  // ── Strategy 1: AppFollow (paid, real data) ───────────────────────────────
  if (appFollow && appId) {
    logger.info(`Keyword research via AppFollow for ${appId}`);
    const suggestions = await appFollow.getKeywordSuggestions(appId, platformLower, country, locale);

    if (suggestions.length > 0) {
      keywords = suggestions.map((k) => ({
        keyword: k.keyword,
        volume: k.volume,
        difficulty: k.difficulty,
        chance: k.chance,
        currentRank: k.currentRank,
        trending: k.trending,
        source: "APPFOLLOW" as const,
      }));
    }
  }

  // ── Strategy 2: iTunes Autocomplete (free fallback) ───────────────────────
  if (keywords.length === 0) {
    logger.info("Keyword research via iTunes autocomplete (free)");
    const allSuggestions: NormalizedKeyword[] = [];

    // Expand each seed keyword
    for (const seed of seedKeywords.slice(0, 5)) {
      const suggestions = await getKeywordSuggestions(seed, country, 8);
      for (const s of suggestions) {
        if (!allSuggestions.find((k) => k.keyword === s.keyword)) {
          allSuggestions.push({
            keyword: s.keyword,
            volume: null,
            difficulty: null,
            chance: null,
            currentRank: null,
            trending: false,
            source: "ITUNES_AUTOCOMPLETE" as const,
          });
        }
      }
    }

    // Enrich with competition counts
    const enriched = await enrichWithCompetition(
      allSuggestions.map((k) => ({
        keyword: k.keyword,
        source: "ITUNES_AUTOCOMPLETE" as const,
        estimatedVolume: null,
        resultCount: null,
      })),
      country
    );

    keywords = allSuggestions.map((k) => {
      const enrichedKw = enriched.find((e) => e.keyword === k.keyword);
      const count = enrichedKw?.resultCount ?? null;
      // Map result count to a rough difficulty score (more results = harder)
      const difficulty = count !== null ? Math.min(100, Math.round(count / 10)) : null;
      return { ...k, difficulty };
    });
  }

  // ── Always add AI-suggested keywords ─────────────────────────────────────
  for (const seed of seedKeywords) {
    const normalized = seed.toLowerCase().trim();
    if (!keywords.find((k) => k.keyword === normalized)) {
      keywords.push({
        keyword: normalized,
        volume: null,
        difficulty: null,
        chance: null,
        currentRank: null,
        trending: false,
        source: "AI_SUGGESTED" as const,
      });
    }
  }

  // ── Persist to DB ─────────────────────────────────────────────────────────
  const keywordSet = await db.keywordSet.create({
    data: {
      projectId,
      platform,
      locale,
      source: appFollow ? "APPFOLLOW" : "ITUNES_AUTOCOMPLETE",
      keywords: {
        createMany: {
          data: keywords.map((k) => ({
            keyword: k.keyword,
            searchVolume: k.volume,
            difficulty: k.difficulty,
            chance: k.chance,
            currentRank: k.currentRank,
            trending: k.trending,
            source: k.source,
          })),
        },
      },
    },
    include: { keywords: true },
  });

  logger.info(`Saved ${keywords.length} keywords for project ${projectId}`);
  return keywords;
}
