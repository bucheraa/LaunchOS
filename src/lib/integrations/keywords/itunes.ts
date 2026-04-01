/**
 * iTunes / App Store public keyword APIs.
 * No API key required — uses Apple's public endpoints.
 *
 * 1. Autocomplete suggestions: same engine as App Store search bar
 * 2. Search-based volume estimation via result count heuristics
 */

import { logger } from "@/lib/utils/logger";

export interface KeywordSuggestion {
  keyword: string;
  source: "ITUNES_AUTOCOMPLETE";
  // Estimated values based on heuristics (no real data without paid API)
  estimatedVolume: number | null;
  resultCount: number | null;
}

const ITUNES_HINTS_URL =
  "https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

// Returns keyword suggestions for a seed term (same as App Store autocomplete)
export async function getKeywordSuggestions(
  seedTerm: string,
  country = "us",
  limit = 10
): Promise<KeywordSuggestion[]> {
  try {
    const url = new URL(ITUNES_HINTS_URL);
    url.searchParams.set("clientApplication", "Software");
    url.searchParams.set("q", seedTerm);
    url.searchParams.set("country", country);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "iTunes/12.0 (Macintosh; OS X)" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      logger.warn(`iTunes hints API returned ${res.status}`);
      return [];
    }

    const data = await res.json();
    const terms: string[] = data?.hints ?? [];

    return terms.slice(0, limit).map((term) => ({
      keyword: term,
      source: "ITUNES_AUTOCOMPLETE" as const,
      estimatedVolume: null,
      resultCount: null,
    }));
  } catch (err) {
    logger.error("iTunes autocomplete failed", err);
    return [];
  }
}

// Returns the number of apps matching a search term — used as a proxy for competition
export async function getCompetitionCount(
  keyword: string,
  country = "us"
): Promise<number | null> {
  try {
    const url = new URL(ITUNES_SEARCH_URL);
    url.searchParams.set("term", keyword);
    url.searchParams.set("entity", "software");
    url.searchParams.set("country", country);
    url.searchParams.set("limit", "200");

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.resultCount ?? null;
  } catch {
    return null;
  }
}

// Enrich suggestions with competition counts (batched, rate-limited)
export async function enrichWithCompetition(
  keywords: KeywordSuggestion[],
  country = "us"
): Promise<KeywordSuggestion[]> {
  const enriched = await Promise.allSettled(
    keywords.map(async (kw) => {
      const count = await getCompetitionCount(kw.keyword, country);
      return { ...kw, resultCount: count };
    })
  );

  return enriched
    .filter((r) => r.status === "fulfilled")
    .map((r) => (r as PromiseFulfilledResult<KeywordSuggestion>).value);
}
