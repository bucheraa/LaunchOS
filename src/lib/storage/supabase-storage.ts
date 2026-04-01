/**
 * Supabase Storage adapter.
 * Replaces the S3 client — same interface, Supabase backend.
 *
 * Setup in Supabase Dashboard:
 * 1. Storage → Create bucket "launchos-assets" (private)
 * 2. Create bucket "mockups" (public) for generated screenshot images
 */

import { getSupabaseAdmin } from "@/lib/db/supabase";
import { randomUUID } from "crypto";
import { logger } from "@/lib/utils/logger";

const ASSETS_BUCKET = "launchos-assets";
const MOCKUPS_BUCKET = "mockups";

// ─── Generic Upload ───────────────────────────────────────────────────────────

export async function uploadFile(
  file: Buffer,
  mimeType: string,
  folder = "uploads"
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseAdmin();
  const ext = mimeType.split("/")[1] ?? "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(key, file, { contentType: mimeType, upsert: false });

  if (error) {
    logger.error("Supabase Storage upload failed", error);
    throw new Error(error.message);
  }

  // Generate signed URL (1 hour)
  const { data } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUrl(key, 3600);

  return { key, url: data?.signedUrl ?? "" };
}

// ─── Screenshot Mockup Upload (public bucket) ─────────────────────────────────

export async function uploadMockup(
  pngBuffer: Buffer,
  projectId: string
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseAdmin();
  const key = `${projectId}/${randomUUID()}.png`;

  const { error } = await supabase.storage
    .from(MOCKUPS_BUCKET)
    .upload(key, pngBuffer, { contentType: "image/png", upsert: false });

  if (error) {
    logger.error("Supabase Storage mockup upload failed", error);
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(MOCKUPS_BUCKET).getPublicUrl(key);

  return { key, url: data.publicUrl };
}

// ─── Signed Download URL ──────────────────────────────────────────────────────

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUrl(key, expiresIn);

  if (error) throw new Error(error.message);
  return data?.signedUrl ?? "";
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteFile(key: string, bucket = ASSETS_BUCKET): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).remove([key]);
  if (error) logger.error("Supabase Storage delete failed", error);
}

// ─── Presigned Upload URL (for direct client uploads) ────────────────────────

export async function getSignedUploadUrl(
  folder: string,
  mimeType: string,
  expiresIn = 3600
): Promise<{ key: string; signedUrl: string; token: string }> {
  const supabase = getSupabaseAdmin();
  const ext = mimeType.split("/")[1] ?? "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .createSignedUploadUrl(key);

  if (error) throw new Error(error.message);
  return { key, signedUrl: data.signedUrl, token: data.token };
}
