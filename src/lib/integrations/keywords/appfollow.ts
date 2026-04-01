/**
 * AppFollow Keyword Research API.
 * Docs: https://docs.appfollow.io/reference
 * Requires a paid AppFollow plan.
 *
 * If APPFOLLOW_API_KEY is not set, the service falls back to iTunes autocomplete.
 */

import { logger } from "@/lib/utils/logger";

export interface AppFollowKeyword {
  keyword: string;
  volume: number;       // monthly search volume (0–100 or raw)
  difficulty: number;   // 0–100, higher = harder to rank
  chance: number;       // 0–100 ranking chance for this app
  currentRank: number | null;
  trending: boolean;
  kei: number | null;   // Keyword Effectiveness Index
}

export class AppFollowClient {
  private apiKey: string;
  private baseUrl = "https://api.appfollow.io";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private headers() {
    return {
      "X-AppFollow-API-Token": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  async getKeywordSuggestions(
    appId: string,
    platform: "ios" | "android",
    country = "us",
    language = "en"
  ): Promise<AppFollowKeyword[]> {
    try {
      const res = await fetch(
        `${this.baseUrl}/v2/keywords/suggestions?app_id=${appId}&platform=${platform}&country=${country}&lang=${language}&limit=50`,
        { headers: this.headers(), signal: AbortSignal.timeout(10000) }
      );

      if (!res.ok) {
        logger.warn(`AppFollow suggestions API returned ${res.status}`);
        return [];
      }

      const data = await res.json();
      return (data?.keywords ?? []).map((k: any) => ({
        keyword: k.keyword,
        volume: k.volume ?? 0,
        difficulty: k.difficulty ?? 50,
        chance: k.chance ?? 50,
        currentRank: k.rank ?? null,
        trending: k.trending ?? false,
        kei: k.kei ?? null,
      }));
    } catch (err) {
      logger.error("AppFollow keyword suggestions failed", err);
      return [];
    }
  }

  async getKeywordMetrics(
    keywords: string[],
    platform: "ios" | "android",
    country = "us"
  ): Promise<AppFollowKeyword[]> {
    try {
      const res = await fetch(`${this.baseUrl}/v2/keywords/metrics`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ keywords, platform, country }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        logger.warn(`AppFollow metrics API returned ${res.status}`);
        return [];
      }

      const data = await res.json();
      return data?.keywords ?? [];
    } catch (err) {
      logger.error("AppFollow keyword metrics failed", err);
      return [];
    }
  }

  async trackKeywords(
    appId: string,
    keywords: string[],
    country = "us"
  ): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/v2/keywords/track`, {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({ app_id: appId, keywords, country }),
        signal: AbortSignal.timeout(10000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export function createAppFollowClient(): AppFollowClient | null {
  const key = process.env.APPFOLLOW_API_KEY;
  if (!key) return null;
  return new AppFollowClient(key);
}
