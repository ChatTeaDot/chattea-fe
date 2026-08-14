import * as ImagePicker from "expo-image-picker";

import { apolloClient } from "@/shared/graphql";

import { CREATE_UPLOAD_MUTATION } from "./operations";

type UploadResponse = {
  createUpload: {
    id: string;
    putUrl: string;
    publicUrl: string;
  };
};

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
  const contentType = asset.mimeType ?? "image/jpeg";
  const filename = asset.fileName ?? `profile-${Date.now()}.jpg`;
  const { data } = await apolloClient.mutate<UploadResponse>({
    mutation: CREATE_UPLOAD_MUTATION,
    variables: { input: { filename, contentType } },
  });
  if (!data?.createUpload) throw new Error("CREATE_UPLOAD_EMPTY_RESPONSE");

  const local = await fetch(asset.uri);
  const body = await local.blob();
  const uploaded = await fetch(data.createUpload.putUrl, {
    method: "PUT",
    headers: { "content-type": contentType },
    body,
  });
  if (!uploaded.ok) throw new Error("PROFILE_PHOTO_UPLOAD_FAILED");
  return data.createUpload.publicUrl;
};
