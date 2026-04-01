/**
 * Competitor Analysis Service.
 *
 * iOS:  Uses the public iTunes Search API (no key required)
 * Android: Uses google-play-scraper (no key required, scrapes public Play Store)
 *
 * This gives real competitive intelligence at zero API cost.
 */

import { db } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import type { Platform } from "@prisma/client";

export interface CompetitorData {
  appId: string;
  name: string;
  developer: string;
  icon: string;
  rating: number | null;
  ratingCount: number | null;
  description: string;
  shortDesc: string | null;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  price: string;
  category: string;
  keywords: string[];
}

// ─── iOS (iTunes Search API) ──────────────────────────────────────────────────

export async function searchIosCompetitors(
  query: string,
  country = "us",
  limit = 8
): Promise<CompetitorData[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", query);
  url.searchParams.set("entity", "software");
  url.searchParams.set("country", country);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("lang", "en_us");

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const data = await res.json();
    const results = data?.results ?? [];

    return results.map((app: any): CompetitorData => ({
      appId: String(app.trackId),
      name: app.trackName,
      developer: app.sellerName ?? app.artistName,
      icon: app.artworkUrl512 ?? app.artworkUrl100,
      rating: app.averageUserRating ?? null,
      ratingCount: app.userRatingCount ?? null,
      description: app.description ?? "",
      shortDesc: null,
      appStoreUrl: app.trackViewUrl,
      playStoreUrl: null,
      price: app.formattedPrice ?? "Free",
      category: app.primaryGenreName ?? "",
      keywords: extractKeywords(app.description ?? ""),
    }));
  } catch (err) {
    logger.error("iOS competitor search failed", err);
    return [];
  }
}

// ─── Android (google-play-scraper) ───────────────────────────────────────────

export async function searchAndroidCompetitors(
  query: string,
  country = "us",
  limit = 8
): Promise<CompetitorData[]> {
  try {
    // Dynamic import to avoid issues when package not installed
    const gplay = await import("google-play-scraper").then((m) => m.default ?? m);

    const results = await gplay.search({
      term: query,
      num: limit,
      country,
      lang: "en",
    });

    return results.map((app: any): CompetitorData => ({
      appId: app.appId,
      name: app.title,
      developer: app.developer,
      icon: app.icon,
      rating: app.score ?? null,
      ratingCount: app.ratings ?? null,
      description: app.summary ?? "",
      shortDesc: app.summary ?? null,
      appStoreUrl: null,
      playStoreUrl: app.url,
      price: app.free ? "Free" : String(app.price),
      category: app.genre ?? "",
      keywords: extractKeywords(app.summary ?? ""),
    }));
  } catch (err) {
    logger.error("Android competitor search failed", err);
    return [];
  }
}

// ─── App detail enrichment (iOS) ─────────────────────────────────────────────

export async function getIosAppDetail(appId: string): Promise<Partial<CompetitorData> | null> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/lookup?id=${appId}&entity=software`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const app = data?.results?.[0];
    if (!app) return null;

    return {
      appId: String(app.trackId),
      name: app.trackName,
      developer: app.sellerName ?? app.artistName,
      icon: app.artworkUrl512 ?? app.artworkUrl100,
      rating: app.averageUserRating ?? null,
      ratingCount: app.userRatingCount ?? null,
      description: app.description ?? "",
      appStoreUrl: app.trackViewUrl,
      price: app.formattedPrice ?? "Free",
      category: app.primaryGenreName ?? "",
    };
  } catch {
    return null;
  }
}

// ─── Save to DB ───────────────────────────────────────────────────────────────

export async function saveCompetitors(
  projectId: string,
  platform: Platform,
  competitors: CompetitorData[]
): Promise<void> {
  for (const comp of competitors) {
    await db.competitorApp.upsert({
      where: {
        projectId_appId_platform: {
          projectId,
          appId: comp.appId,
          platform,
        },
      },
      update: {
        name: comp.name,
        developer: comp.developer,
        icon: comp.icon,
        rating: comp.rating,
        ratingCount: comp.ratingCount,
        description: comp.description,
        shortDesc: comp.shortDesc,
        appStoreUrl: comp.appStoreUrl,
        playStoreUrl: comp.playStoreUrl,
        price: comp.price,
        category: comp.category,
        keywords: comp.keywords,
        lastFetchedAt: new Date(),
      },
      create: {
        projectId,
        platform,
        appId: comp.appId,
        name: comp.name,
        developer: comp.developer ?? null,
        icon: comp.icon ?? null,
        rating: comp.rating,
        ratingCount: comp.ratingCount,
        description: comp.description ?? null,
        shortDesc: comp.shortDesc ?? null,
        appStoreUrl: comp.appStoreUrl ?? null,
        playStoreUrl: comp.playStoreUrl ?? null,
        price: comp.price ?? null,
        category: comp.category ?? null,
        keywords: comp.keywords,
      },
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractKeywords(text: string): string[] {
  // Simple keyword extraction from description
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "this", "that", "these",
    "those", "it", "its", "you", "your", "we", "our", "they", "their",
    "app", "apps", "get", "use", "using", "from", "all", "more", "now",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  // Count frequency
  const freq: Record<string, number> = {};
  for (const word of words) {
    freq[word] = (freq[word] ?? 0) + 1;
  }

  // Return top 15 by frequency
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
}
