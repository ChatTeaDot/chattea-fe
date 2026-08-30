import { print } from "graphql";
import { describe, expect, it, vi } from "vitest";

import {
  CREATE_UPLOAD_MUTATION,
  FINALIZE_UPLOAD_MUTATION,
} from "../src/features/native/profile-upload/api";
import { buildProfileUpdateInput } from "../src/features/native/profile-upload/profile-input";
import {
  type ProfilePhotoUploadDependencies,
  selectAndUploadProfilePhoto,
} from "../src/features/native/profile-upload/upload-profile-photo";

const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43]).buffer;

const createDependencies = (): ProfilePhotoUploadDependencies => ({
  createUpload: vi.fn(async () => ({
    expiresAt: "2026-08-29T01:00:00.000Z",
    id: "upload-1",
    putUrl: "https://staging.example.com/upload",
  })),
  finalizeUpload: vi.fn(async () => ({
    id: "upload-1",
    publicUrl: "https://cdn.example.com/photo.jpg",
  })),
  launchPicker: vi.fn(async () => ({
    canceled: false,
    fileName: "photo.jpg",
    fileSize: jpeg.byteLength,
    mimeType: "image/jpeg",
    uri: "file:///photo.jpg",
  })),
  putObject: vi.fn(async () => ({ ok: true })),
  readLocalFile: vi.fn(async () => jpeg),
  requestPermission: vi.fn(async () => true),
});

describe("verified profile photo upload", () => {
  it("uses the verified-upload GraphQL contract", () => {
    const createOperation = print(CREATE_UPLOAD_MUTATION);
    const finalizeOperation = print(FINALIZE_UPLOAD_MUTATION);

    expect(createOperation).toMatch(
      /createUpload\(input: \$input\) \{\s+id\s+putUrl\s+expiresAt\s+\}/,
    );
    expect(createOperation).not.toContain("publicUrl");
    expect(finalizeOperation).toMatch(
      /mutation NativeFinalizeUpload\(\$uploadId: ID!\).*finalizeUpload\(uploadId: \$uploadId\)/s,
    );
    expect(finalizeOperation).toMatch(
      /finalizeUpload\(uploadId: \$uploadId\) \{\s+id\s+publicUrl\s+\}/,
    );
  });

  it("rejects local content before creating a staging upload", async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.readLocalFile).mockResolvedValue(
      new Uint8Array([0x00, 0x01, 0x02]).buffer,
    );

    await expect(selectAndUploadProfilePhoto(dependencies)).rejects.toThrow(
      "PHOTO_CONTENT_INVALID",
    );

    expect(dependencies.createUpload).not.toHaveBeenCalled();
  });

  it("creates, uploads, and finalizes in order and returns only the verified object", async () => {
    const order: string[] = [];
    const dependencies = createDependencies();
    vi.mocked(dependencies.createUpload).mockImplementation(async () => {
      order.push("create");
      return {
        expiresAt: "2026-08-29T01:00:00.000Z",
        id: "upload-1",
        publicUrl: "https://staging.example.com/untrusted.jpg",
        putUrl: "https://staging.example.com/upload",
      };
    });
    vi.mocked(dependencies.putObject).mockImplementation(async (url, input) => {
      order.push("put");
      expect(url).toBe("https://staging.example.com/upload");
      expect(input.headers).toEqual({
        "content-length": String(jpeg.byteLength),
        "content-type": "image/jpeg",
      });
      return { ok: true };
    });
    vi.mocked(dependencies.finalizeUpload).mockImplementation(async (uploadId) => {
      order.push("finalize");
      expect(uploadId).toBe("upload-1");
      return { id: "upload-1", publicUrl: "https://cdn.example.com/verified.jpg" };
    });

    const result = await selectAndUploadProfilePhoto(dependencies);

    expect(order).toEqual(["create", "put", "finalize"]);
    expect(result).toEqual({
      uploadId: "upload-1",
      url: "https://cdn.example.com/verified.jpg",
    });
    expect(result?.url).not.toContain("staging.example.com/untrusted");
  });

  it("does not finalize after a failed staging PUT", async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.putObject).mockResolvedValue({ ok: false });

    await expect(selectAndUploadProfilePhoto(dependencies)).rejects.toThrow(
      "PROFILE_PHOTO_UPLOAD_FAILED",
    );

    expect(dependencies.finalizeUpload).not.toHaveBeenCalled();
  });

  it("does not return an upload when finalize lacks a verified public URL", async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.finalizeUpload).mockResolvedValue({ id: "upload-1", publicUrl: "" });

    await expect(selectAndUploadProfilePhoto(dependencies)).rejects.toThrow(
      "FINALIZE_UPLOAD_EMPTY_RESPONSE",
    );
  });

  it("does not access the picker when media permission is denied", async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.requestPermission).mockResolvedValue(false);

    await expect(selectAndUploadProfilePhoto(dependencies)).rejects.toThrow(
      "PHOTO_PERMISSION_REQUIRED",
    );

    expect(dependencies.launchPicker).not.toHaveBeenCalled();
  });

  it("builds profile authority from verified upload IDs without raw URLs", () => {
    const input = buildProfileUpdateInput({
      birthDate: "1998-01-02",
      interestedGender: "everyone",
      intro: "hello",
      photos: [
        { uploadId: "upload-1", url: "https://cdn.example.com/1.jpg" },
        { uploadId: "upload-2", url: "https://cdn.example.com/2.jpg" },
      ],
      region: "서울",
      userName: "tea",
    });

    expect(input).toEqual({
      birthDate: "1998-01-02",
      interestedGender: "everyone",
      intro: "hello",
      photoUploadIds: ["upload-1", "upload-2"],
      region: "서울",
      userName: "tea",
    });
    expect(input).not.toHaveProperty("photoUrls");
  });
});
