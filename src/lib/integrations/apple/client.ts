/**
 * Apple App Store Connect API v1 client.
 * Uses ES256 JWT authentication as required by Apple.
 * Docs: https://developer.apple.com/documentation/appstoreconnectapi
 *
 * Required credentials (from App Store Connect → Users & Access → Integrations → App Store Connect API):
 *   - Issuer ID (UUID)
 *   - Key ID (10-char alphanumeric)
 *   - Private Key (.p8 file content, PEM format)
 */

import { SignJWT, importPKCS8 } from "jose";
import { logger } from "@/lib/utils/logger";

export interface AppleCredentials {
  issuerId: string;
  keyId: string;
  privateKey: string; // PEM content of the .p8 file
}

export interface AppStoreApp {
  id: string;
  name: string;
  bundleId: string;
  sku: string;
  primaryLocale: string;
}

export interface AppStoreListing {
  locale: string;
  name: string;
  subtitle?: string;
  description: string;
  promotionalText?: string;
  keywords?: string;
  whatsNewText?: string;
}

export interface IntegrationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export class AppleAppStoreClient {
  private credentials: AppleCredentials;
  private baseUrl = "https://api.appstoreconnect.apple.com/v1";
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(credentials: AppleCredentials) {
    this.credentials = credentials;
  }

  // ─── JWT Token Generation ──────────────────────────────────────────────────

  private async generateToken(): Promise<string> {
    // Reuse token if it's still valid (within 15-minute window, Apple max is 20min)
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 15 * 60; // 15 minutes

    // Normalize the private key — handle escaped newlines from env vars
    const pem = this.credentials.privateKey.replace(/\\n/g, "\n");

    const privateKey = await importPKCS8(pem, "ES256");

    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "ES256", kid: this.credentials.keyId, typ: "JWT" })
      .setIssuer(this.credentials.issuerId)
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .setAudience("appstoreconnect-v1")
      .sign(privateKey);

    this.tokenCache = { token, expiresAt: (exp - 60) * 1000 }; // expire 1min early

    return token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<IntegrationResult<T>> {
    try {
      const token = await this.generateToken();
      const res = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        logger.error(`Apple API error ${res.status}: ${path}`, body);
        return {
          success: false,
          error: (body as any)?.errors?.[0]?.detail ?? `HTTP ${res.status}`,
          status: res.status,
        };
      }

      const data = await res.json();
      return { success: true, data: data as T };
    } catch (err: any) {
      logger.error(`Apple API request failed: ${path}`, err);
      return { success: false, error: err.message };
    }
  }

  // ─── Apps ─────────────────────────────────────────────────────────────────

  async getApps(): Promise<IntegrationResult<AppStoreApp[]>> {
    const result = await this.request<any>("/apps?limit=200&fields[apps]=name,bundleId,sku,primaryLocale");
    if (!result.success) return result as IntegrationResult<AppStoreApp[]>;

    const apps: AppStoreApp[] = (result.data?.data ?? []).map((a: any) => ({
      id: a.id,
      name: a.attributes.name,
      bundleId: a.attributes.bundleId,
      sku: a.attributes.sku,
      primaryLocale: a.attributes.primaryLocale,
    }));

    return { success: true, data: apps };
  }

  // ─── App Store Versions ───────────────────────────────────────────────────

  async getEditableVersion(appId: string): Promise<IntegrationResult<{ id: string; versionString: string }>> {
    const result = await this.request<any>(
      `/apps/${appId}/appStoreVersions?filter[appStoreState]=PREPARE_FOR_SUBMISSION,DEVELOPER_REJECTED,REJECTED&limit=1&fields[appStoreVersions]=versionString,appStoreState`
    );
    if (!result.success) return result as IntegrationResult<any>;

    const version = result.data?.data?.[0];
    if (!version) return { success: false, error: "No editable version found" };

    return {
      success: true,
      data: {
        id: version.id,
        versionString: version.attributes.versionString,
      },
    };
  }

  // ─── Localized Listings ────────────────────────────────────────────────────

  async getListings(versionId: string): Promise<IntegrationResult<AppStoreListing[]>> {
    const result = await this.request<any>(
      `/appStoreVersions/${versionId}/appStoreVersionLocalizations?fields[appStoreVersionLocalizations]=locale,name,subtitle,description,promotionalText,keywords,whatsNewText`
    );
    if (!result.success) return result as IntegrationResult<AppStoreListing[]>;

    const listings: AppStoreListing[] = (result.data?.data ?? []).map((l: any) => ({
      locale: l.attributes.locale,
      name: l.attributes.name,
      subtitle: l.attributes.subtitle,
      description: l.attributes.description,
      promotionalText: l.attributes.promotionalText,
      keywords: l.attributes.keywords,
      whatsNewText: l.attributes.whatsNewText,
    }));

    return { success: true, data: listings };
  }

  async updateListing(
    localizationId: string,
    data: Partial<AppStoreListing>
  ): Promise<IntegrationResult> {
    return this.request(`/appStoreVersionLocalizations/${localizationId}`, {
      method: "PATCH",
      body: JSON.stringify({
        data: {
          type: "appStoreVersionLocalizations",
          id: localizationId,
          attributes: {
            name: data.name,
            subtitle: data.subtitle,
            description: data.description,
            promotionalText: data.promotionalText,
            keywords: data.keywords,
            whatsNewText: data.whatsNewText,
          },
        },
      }),
    });
  }

  // ─── Convenience: Push a full listing ─────────────────────────────────────

  async pushListing(
    appId: string,
    locale: string,
    listing: Partial<AppStoreListing>
  ): Promise<IntegrationResult> {
    // 1. Get editable version
    const versionResult = await this.getEditableVersion(appId);
    if (!versionResult.success) return versionResult;

    const versionId = versionResult.data!.id;

    // 2. Get localizations
    const locResult = await this.request<any>(
      `/appStoreVersions/${versionId}/appStoreVersionLocalizations?filter[locale]=${locale}&limit=1`
    );
    if (!locResult.success) return locResult;

    const locId = locResult.data?.data?.[0]?.id;
    if (!locId) {
      return { success: false, error: `No localization found for locale ${locale}` };
    }

    // 3. Update
    return this.updateListing(locId, listing);
  }
}

export function createAppleClientFromEnv(): AppleAppStoreClient | null {
  const issuerId = process.env.APPLE_ISSUER_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!issuerId || !keyId || !privateKey) return null;
  return new AppleAppStoreClient({ issuerId, keyId, privateKey });
}

export function createAppleClientFromCredentials(
  credentials: AppleCredentials
): AppleAppStoreClient {
  return new AppleAppStoreClient(credentials);
}
