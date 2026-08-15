import * as ImagePicker from "expo-image-picker";

import { apolloClient } from "@/shared/graphql";

import { CREATE_UPLOAD_MUTATION } from "./operations";

type UploadResponse = {
  createUpload: {
    id: string;
    putUrl: string;
    publicUrl: string | null;
  };
};

const MAX_PROFILE_PHOTO_BYTES = 10 * 1024 * 1024;
const CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const selectAndUploadProfilePhoto = async (): Promise<string | null> => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("PHOTO_PERMISSION_REQUIRED");

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.9,
    selectionLimit: 1,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset?.uri) throw new Error("PHOTO_PICK_FAILED");
  if (asset.fileSize && asset.fileSize > MAX_PROFILE_PHOTO_BYTES)
    throw new Error("PHOTO_SIZE_INVALID");
  const contentType = normalizeContentType(asset.mimeType);
  const extension = extensionFor(contentType);
  const filename = safeFilename(asset.fileName, extension);

  const local = await fetch(asset.uri);
  const body = await local.arrayBuffer();
  if (body.byteLength < 1 || body.byteLength > MAX_PROFILE_PHOTO_BYTES)
    throw new Error("PHOTO_SIZE_INVALID");
  if (!matchesImageSignature(contentType, new Uint8Array(body)))
    throw new Error("PHOTO_CONTENT_INVALID");

  const { data } = await apolloClient.mutate<UploadResponse>({
    mutation: CREATE_UPLOAD_MUTATION,
    variables: { input: { filename, contentType, sizeBytes: body.byteLength } },
  });
  if (!data?.createUpload?.publicUrl) throw new Error("CREATE_UPLOAD_EMPTY_RESPONSE");

  const uploaded = await fetch(data.createUpload.putUrl, {
    method: "PUT",
    headers: {
      "content-length": String(body.byteLength),
      "content-type": contentType,
    },
    body,
  });
  if (!uploaded.ok) throw new Error("PROFILE_PHOTO_UPLOAD_FAILED");
  return data.createUpload.publicUrl;
};

const normalizeContentType = (value?: string | null): "image/jpeg" | "image/png" | "image/webp" => {
  const contentType =
    value?.trim().toLowerCase() === "image/jpg" ? "image/jpeg" : value?.trim().toLowerCase();
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
  if (!basename || basename.startsWith(".") || basename.includes(".."))
    return `profile-${Date.now()}.${extension}`;
  const dot = basename.lastIndexOf(".");
  if (dot < 1 || basename.slice(dot + 1).toLowerCase() !== extension) {
    return `${basename.replace(/\.[^.]*$/, "")}.${extension}`;
  }
  return basename;
};

const matchesImageSignature = (contentType: string, bytes: Uint8Array): boolean => {
  if (contentType === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") {
    return (
      bytes.length >= 8 &&
      bytes
        .slice(0, 8)
        .every((byte, index) => byte === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])
    );
  }
  return (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
};
