/**
 * RevenueCat integration stub.
 * Used for subscription analytics and entitlement management.
 * Docs: https://www.revenuecat.com/docs/api-v1
 */

import { logger } from "@/lib/utils/logger";

export interface RevenueCatCredentials {
  apiKey: string;
  projectId: string;
}

export class RevenueCatClient {
  private apiKey: string;
  private baseUrl = "https://api.revenuecat.com/v1";

  constructor(credentials: RevenueCatCredentials) {
    this.apiKey = credentials.apiKey;
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async getSubscriberCount(): Promise<number> {
    logger.info("RevenueCatClient.getSubscriberCount: STUB");
    return 0;
  }

  async getRevenue(period: "day" | "week" | "month" = "month"): Promise<number> {
    logger.info(`RevenueCatClient.getRevenue: STUB [${period}]`);
    return 0;
  }

  async getChurnRate(): Promise<number> {
    logger.info("RevenueCatClient.getChurnRate: STUB");
    return 0;
  }
}

export function createRevenueCatClient(credentials: RevenueCatCredentials) {
  return new RevenueCatClient(credentials);
}
