/**
 * Google Play Developer API v3 client.
 * Uses OAuth2 service account authentication.
 * Docs: https://developers.google.com/android-publisher
 *
 * Setup:
 * 1. Google Cloud Console → APIs → Enable "Google Play Android Developer API"
 * 2. IAM → Service Accounts → Create → Download JSON key
 * 3. Google Play Console → Setup → API access → Link service account
 * 4. Grant "Release manager" or "App information" permission in Play Console
 */

import { SignJWT, importPKCS8 } from "jose";
import { logger } from "@/lib/utils/logger";

export interface GoogleCredentials {
  serviceAccountEmail: string;
  privateKey: string; // RSA private key PEM from JSON key file
  projectId?: string;
}

export interface PlayStoreListing {
  language: string; // BCP-47 locale, e.g. "en-US", "de-DE"
  title: string;
  shortDescription: string;
  fullDescription: string;
  video?: string;
}

export interface PlayStoreApp {
  packageName: string;
  title: string;
  description?: string;
}

export interface IntegrationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export class GooglePlayClient {
  private credentials: GoogleCredentials;
  private baseUrl = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(credentials: GoogleCredentials) {
    this.credentials = credentials;
  }

  // ─── Service Account JWT (OAuth2) ──────────────────────────────────────────

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    const now = Math.floor(Date.now() / 1000);
    const pem = this.credentials.privateKey.replace(/\\n/g, "\n");
    const privateKey = await importPKCS8(pem, "RS256");

    // Service account JWT for Google API
    const assertion = await new SignJWT({
      scope: "https://www.googleapis.com/auth/androidpublisher",
    })
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .setIssuer(this.credentials.serviceAccountEmail)
      .setSubject(this.credentials.serviceAccountEmail)
      .setAudience("https://oauth2.googleapis.com/token")
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);

    // Exchange JWT for access token
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(`Google OAuth error: ${JSON.stringify(body)}`);
    }

    const tokenData = await res.json();
    const expiresAt = (Date.now() + (tokenData.expires_in - 60) * 1000);
    this.tokenCache = { token: tokenData.access_token, expiresAt };

    return tokenData.access_token;
  }

  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<IntegrationResult<T>> {
    try {
      const token = await this.getAccessToken();
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        logger.error(`Google Play API error ${res.status}`, body);
        return {
          success: false,
          error: (body as any)?.error?.message ?? `HTTP ${res.status}`,
        };
      }

      const data = (await res.json()) as T;
      return { success: true, data };
    } catch (err: any) {
      logger.error("Google Play API request failed", err);
      return { success: false, error: err.message };
    }
  }

  // ─── Edit Session (required for all write operations) ────────────────────

  private async createEdit(packageName: string): Promise<IntegrationResult<string>> {
    const result = await this.request<any>(
      `${this.baseUrl}/${packageName}/edits`,
      { method: "POST", body: JSON.stringify({}) }
    );
    if (!result.success) return result as IntegrationResult<string>;
    return { success: true, data: result.data.id };
  }

  private async commitEdit(packageName: string, editId: string): Promise<IntegrationResult> {
    return this.request(
      `${this.baseUrl}/${packageName}/edits/${editId}:commit`,
      { method: "POST", body: JSON.stringify({}) }
    );
  }

  // ─── Listings ─────────────────────────────────────────────────────────────

  async getListings(packageName: string): Promise<IntegrationResult<PlayStoreListing[]>> {
    // Create a read-only edit to access current listings
    const editResult = await this.createEdit(packageName);
    if (!editResult.success) return editResult as IntegrationResult<PlayStoreListing[]>;

    const editId = editResult.data!;
    const result = await this.request<any>(
      `${this.baseUrl}/${packageName}/edits/${editId}/listings`
    );

    // Delete the read edit (don't commit)
    await this.request(
      `${this.baseUrl}/${packageName}/edits/${editId}`,
      { method: "DELETE" }
    );

    if (!result.success) return result as IntegrationResult<PlayStoreListing[]>;
    return { success: true, data: result.data?.listings ?? [] };
  }

  async updateListing(
    packageName: string,
    language: string,
    listing: Partial<PlayStoreListing>
  ): Promise<IntegrationResult> {
    // 1. Create edit
    const editResult = await this.createEdit(packageName);
    if (!editResult.success) return editResult;
    const editId = editResult.data!;

    // 2. Update listing
    const updateResult = await this.request(
      `${this.baseUrl}/${packageName}/edits/${editId}/listings/${language}`,
      {
        method: "PUT",
        body: JSON.stringify({
          language,
          title: listing.title,
          shortDescription: listing.shortDescription,
          fullDescription: listing.fullDescription,
        }),
      }
    );

    if (!updateResult.success) {
      await this.request(`${this.baseUrl}/${packageName}/edits/${editId}`, {
        method: "DELETE",
      });
      return updateResult;
    }

    // 3. Commit the edit
    return this.commitEdit(packageName, editId);
  }
}

export function createGooglePlayClientFromEnv(): GooglePlayClient | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !privateKey) return null;
  return new GooglePlayClient({
    serviceAccountEmail: email,
    privateKey,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  });
}

export function createGooglePlayClient(credentials: GoogleCredentials): GooglePlayClient {
  return new GooglePlayClient(credentials);
}
