/**
 * Screenshot Mockup Generator.
 *
 * Uses `satori` to render JSX → SVG, then `@resvg/resvg-js` to convert SVG → PNG.
 * Runs server-side on Vercel (Node.js runtime, not Edge).
 *
 * Outputs:
 * - iPhone 15 Pro frame:  1290 × 2796 px
 * - Pixel 8 frame:         1080 × 2400 px
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { logger } from "@/lib/utils/logger";

export interface MockupOptions {
  platform: "IOS" | "ANDROID";
  headline: string;
  subtext?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  screenType?: "hero" | "feature" | "social_proof" | "cta";
}

interface Dimensions {
  width: number;
  height: number;
  deviceWidth: number;
  deviceHeight: number;
  deviceX: number;
  deviceY: number;
  cornerRadius: number;
  notchWidth: number;
  notchHeight: number;
}

const IOS_DIMS: Dimensions = {
  width: 1290,
  height: 2796,
  deviceWidth: 1100,
  deviceHeight: 2200,
  deviceX: 95,
  deviceY: 250,
  cornerRadius: 60,
  notchWidth: 280,
  notchHeight: 38,
};

const ANDROID_DIMS: Dimensions = {
  width: 1080,
  height: 2400,
  deviceWidth: 900,
  deviceHeight: 1900,
  deviceX: 90,
  deviceY: 200,
  cornerRadius: 55,
  notchWidth: 60,
  notchHeight: 60,
};

// Gradient presets per screen type
const GRADIENT_PRESETS: Record<string, { from: string; to: string }> = {
  hero: { from: "#6C47FF", to: "#4A00C8" },
  feature: { from: "#0F172A", to: "#1E293B" },
  social_proof: { from: "#064E3B", to: "#065F46" },
  cta: { from: "#7C3AED", to: "#4C1D95" },
};

// We embed fonts as base64 to avoid file system issues on serverless
// Using Inter — fetched once and cached in module scope
let interFontData: ArrayBuffer | null = null;

async function getInterFont(): Promise<ArrayBuffer> {
  if (interFontData) return interFontData;

  // Use Google Fonts CDN (works in Node.js)
  const res = await fetch(
    "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff",
    { signal: AbortSignal.timeout(10000) }
  );
  if (!res.ok) throw new Error("Failed to fetch Inter font");
  interFontData = await res.arrayBuffer();
  return interFontData;
}

// ─── JSX template for the mockup ─────────────────────────────────────────────

function createMockupElement(
  options: MockupOptions,
  dims: Dimensions
): React.ReactNode {
  const bg = options.backgroundColor ?? "#6C47FF";
  const textColor = options.textColor ?? "#FFFFFF";
  const accentColor = options.accentColor ?? "#FFFFFF";
  const isIOS = options.platform === "IOS";

  // We use plain objects (not JSX) since satori accepts React-compatible objects
  return {
    type: "div",
    props: {
      style: {
        width: dims.width,
        height: dims.height,
        background: bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Background gradient overlay
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 70%)`,
            },
            children: [],
          },
        },

        // Top text area
        {
          type: "div",
          props: {
            style: {
              marginTop: 80,
              marginBottom: 40,
              paddingLeft: 80,
              paddingRight: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              zIndex: 10,
            },
            children: [
              // Headline
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 100,
                    fontWeight: 700,
                    color: textColor,
                    textAlign: "center",
                    lineHeight: 1.1,
                    letterSpacing: "-2px",
                  },
                  children: [options.headline],
                },
              },
              // Subtext
              options.subtext
                ? {
                    type: "div",
                    props: {
                      style: {
                        fontSize: 52,
                        fontWeight: 400,
                        color: `${textColor}CC`,
                        textAlign: "center",
                        lineHeight: 1.4,
                      },
                      children: [options.subtext],
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },

        // Device frame
        {
          type: "div",
          props: {
            style: {
              width: dims.deviceWidth,
              height: dims.deviceHeight,
              borderRadius: dims.cornerRadius,
              border: `12px solid rgba(255,255,255,0.3)`,
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            },
            children: [
              // Status bar area
              {
                type: "div",
                props: {
                  style: {
                    height: 80,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingLeft: 50,
                    paddingRight: 50,
                    background: "rgba(0,0,0,0.2)",
                  },
                  children: [
                    // Time
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 28,
                          fontWeight: 600,
                          color: textColor,
                        },
                        children: ["9:41"],
                      },
                    },
                    // Dynamic Island / Notch
                    isIOS
                      ? {
                          type: "div",
                          props: {
                            style: {
                              width: dims.notchWidth,
                              height: dims.notchHeight,
                              borderRadius: dims.notchHeight / 2,
                              background: "#000",
                            },
                            children: [],
                          },
                        }
                      : {
                          type: "div",
                          props: {
                            style: {
                              width: dims.notchWidth,
                              height: dims.notchWidth,
                              borderRadius: "50%",
                              background: "#000",
                            },
                            children: [],
                          },
                        },
                    // Signal icons placeholder
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 28,
                          color: textColor,
                          opacity: 0.8,
                        },
                        children: ["◼◼◼"],
                      },
                    },
                  ],
                },
              },
              // App content area placeholder
              {
                type: "div",
                props: {
                  style: {
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 30,
                  },
                  children: [
                    // App content placeholder lines
                    ...Array.from({ length: 5 }).map((_, i) => ({
                      type: "div" as const,
                      props: {
                        style: {
                          width: `${85 - i * 10}%`,
                          height: 20,
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.15)",
                        },
                        children: [],
                      },
                    })),
                  ],
                },
              },
              // Home indicator (iOS)
              isIOS
                ? {
                    type: "div",
                    props: {
                      style: {
                        height: 50,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.2)",
                      },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              width: 140,
                              height: 7,
                              borderRadius: 4,
                              background: "rgba(255,255,255,0.5)",
                            },
                            children: [],
                          },
                        },
                      ],
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
      ],
    },
  } as any;
}

// ─── Main generator function ──────────────────────────────────────────────────

export async function generateMockupPng(options: MockupOptions): Promise<Buffer> {
  const dims = options.platform === "IOS" ? IOS_DIMS : ANDROID_DIMS;

  logger.info(`Generating ${options.platform} mockup: "${options.headline}"`);

  const font = await getInterFont();

  const svg = await satori(createMockupElement(options, dims) as any, {
    width: dims.width,
    height: dims.height,
    fonts: [
      {
        name: "Inter",
        data: font,
        weight: 400,
        style: "normal",
      },
      {
        name: "Inter",
        data: font,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: dims.width },
  });

  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

// ─── Batch generation ────────────────────────────────────────────────────────

export async function generateMockupSet(
  screens: Array<{ headline: string; subtext?: string; screenType?: string }>,
  platform: "IOS" | "ANDROID",
  backgroundColor?: string
): Promise<Buffer[]> {
  const screenTypeOrder: ("hero" | "feature" | "social_proof" | "cta")[] = [
    "hero", "feature", "feature", "social_proof", "cta",
  ];

  return Promise.all(
    screens.map((screen, i) =>
      generateMockupPng({
        platform,
        headline: screen.headline,
        subtext: screen.subtext,
        backgroundColor: backgroundColor ?? GRADIENT_PRESETS[screen.screenType ?? screenTypeOrder[i] ?? "hero"]?.from,
        screenType: (screen.screenType as any) ?? screenTypeOrder[i] ?? "feature",
      })
    )
  );
}
