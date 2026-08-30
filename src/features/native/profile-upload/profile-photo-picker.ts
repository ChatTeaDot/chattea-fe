import * as ImagePicker from "expo-image-picker";

import { createProfileUpload, finalizeProfileUpload } from "./api";
import {
  type ProfilePhotoUploadDependencies,
  selectAndUploadProfilePhoto as uploadProfilePhoto,
} from "./upload-profile-photo";

const dependencies: ProfilePhotoUploadDependencies = {
  createUpload: createProfileUpload,
  finalizeUpload: finalizeProfileUpload,
  launchPicker: async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      selectionLimit: 1,
    });
    if (result.canceled) return { canceled: true };
    const asset = result.assets[0];
    if (!asset?.uri) throw new Error("PHOTO_PICK_FAILED");
    return {
      canceled: false,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      mimeType: asset.mimeType,
      uri: asset.uri,
    };
  },
  putObject: async (url, input) =>
    fetch(url, {
      body: input.body,
      headers: input.headers,
      method: "PUT",
    }),
  readLocalFile: async (uri) => (await fetch(uri)).arrayBuffer(),
  requestPermission: async () => (await ImagePicker.requestMediaLibraryPermissionsAsync()).granted,
};

export const selectAndUploadProfilePhoto = () => uploadProfilePhoto(dependencies);
