import { CONTENT_TYPES, MAX_PROFILE_PHOTO_BYTES } from "../constants";
import type { ProfilePhotoUploadDependencies, VerifiedProfilePhoto } from "../types";

const normalizeContentType = (value?: string | null): "image/jpeg" | "image/png" | "image/webp" => {
  const normalized = value?.trim().toLowerCase();
  const contentType = normalized === "image/jpg" ? "image/jpeg" : normalized;
  if (!contentType || !CONTENT_TYPES.has(contentType)) throw new Error("PHOTO_CONTENT_INVALID");
  return contentType as "image/jpeg" | "image/png" | "image/webp";
};

const extensionFor = (contentType: string): string =>
  contentType === "image/jpeg" ? "jpg" : contentType.slice("image/".length);

const safeFilename = (value: string | null | undefined, extension: string): string => {
  const basename = value
    ?.split(/[\\/]/)
    .pop()
    ?.replace(/[^A-Za-z0-9._-]/g, "_");
  if (!basename || basename.startsWith(".") || basename.includes("..")) {
    return `profile-${Date.now()}.${extension}`;
  }
  const dot = basename.lastIndexOf(".");
  if (dot < 1 || basename.slice(dot + 1).toLowerCase() !== extension) {
    return `${basename.replace(/\.[^.]*$/, "")}.${extension}`;
  }
  return basename;
};

const matchesImageSignature = (contentType: string, bytes: Uint8Array): boolean => {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (contentType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return (
      bytes.length >= signature.length && signature.every((byte, index) => bytes[index] === byte)
    );
  }
  return (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
};

const isSecureUrl = (value: string, allowQuery: boolean): boolean => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.hash &&
      (allowQuery || !url.search)
    );
  } catch {
    return false;
  }
};

export const uploadProfilePhoto = async (
  dependencies: ProfilePhotoUploadDependencies,
): Promise<VerifiedProfilePhoto | null> => {
  if (!(await dependencies.requestPermission())) throw new Error("PHOTO_PERMISSION_REQUIRED");
  const asset = await dependencies.launchPicker();
  if (asset.canceled) return null;
  if (
    typeof asset.fileSize === "number" &&
    (asset.fileSize < 1 || asset.fileSize > MAX_PROFILE_PHOTO_BYTES)
  ) {
    throw new Error("PHOTO_SIZE_INVALID");
  }
  const contentType = normalizeContentType(asset.mimeType);
  const filename = safeFilename(asset.fileName, extensionFor(contentType));
  const body = await dependencies.readLocalFile(asset.uri);
  if (body.byteLength < 1 || body.byteLength > MAX_PROFILE_PHOTO_BYTES) {
    throw new Error("PHOTO_SIZE_INVALID");
  }
  if (!matchesImageSignature(contentType, new Uint8Array(body))) {
    throw new Error("PHOTO_CONTENT_INVALID");
  }

  const created = await dependencies.createUpload({
    contentType,
    filename,
    sizeBytes: body.byteLength,
  });
  if (!created.id || !created.putUrl || !created.expiresAt || !isSecureUrl(created.putUrl, true)) {
    throw new Error("CREATE_UPLOAD_EMPTY_RESPONSE");
  }
  const uploaded = await dependencies.putObject(created.putUrl, {
    body,
    headers: {
      "content-length": String(body.byteLength),
      "content-type": contentType,
    },
  });
  if (!uploaded.ok) throw new Error("PROFILE_PHOTO_UPLOAD_FAILED");

  const finalized = await dependencies.finalizeUpload(created.id);
  if (!finalized.id || !finalized.publicUrl) throw new Error("FINALIZE_UPLOAD_EMPTY_RESPONSE");
  if (finalized.id !== created.id || !isSecureUrl(finalized.publicUrl, false)) {
    throw new Error("FINALIZE_UPLOAD_INVALID_RESPONSE");
  }
  return { uploadId: finalized.id, url: finalized.publicUrl };
};
