import { gql } from "@apollo/client";

import { apolloClient } from "@/shared/graphql";

import type { ProfilePhotoUploadDependencies } from "../types";
import { uploadProfilePhoto } from "../utils/upload-profile-photo";
import type {
  CreatedProfileUpload,
  CreateProfileUploadInput,
  FinalizedProfileUpload,
} from "./schemas";

export const CREATE_UPLOAD_MUTATION = gql`
  mutation NativeCreateUpload($input: CreateUploadInput!) {
    createUpload(input: $input) {
      id
      putUrl
      expiresAt
    }
  }
`;

export const FINALIZE_UPLOAD_MUTATION = gql`
  mutation NativeFinalizeUpload($uploadId: ID!) {
    finalizeUpload(uploadId: $uploadId) {
      id
      publicUrl
    }
  }
`;

export const createProfileUpload = async (
  input: CreateProfileUploadInput,
): Promise<CreatedProfileUpload> => {
  const result = await apolloClient.mutate<{ createUpload: CreatedProfileUpload }>({
    mutation: CREATE_UPLOAD_MUTATION,
    variables: { input },
  });
  if (!result.data?.createUpload) throw new Error("CREATE_UPLOAD_EMPTY_RESPONSE");
  return result.data.createUpload;
};

export const finalizeProfileUpload = async (uploadId: string): Promise<FinalizedProfileUpload> => {
  const result = await apolloClient.mutate<{ finalizeUpload: FinalizedProfileUpload }>({
    mutation: FINALIZE_UPLOAD_MUTATION,
    variables: { uploadId },
  });
  if (!result.data?.finalizeUpload) throw new Error("FINALIZE_UPLOAD_EMPTY_RESPONSE");
  return result.data.finalizeUpload;
};

export const ME_QUERY = gql`
  query NativeMe {
    me {
      id
      email
      phone
      userName
      gender
      intro
      birthDate
      region
      interestedGender
      profileCompleted
      photos {
        id
        url
        position
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateNativeProfile($input: UpdateUserProfileInput!) {
    updateUserProfile(input: $input) {
      id
      email
      phone
      userName
      gender
      intro
      birthDate
      region
      interestedGender
      profileCompleted
      photos {
        id
        url
        position
      }
    }
  }
`;

const dependencies: ProfilePhotoUploadDependencies = {
  createUpload: createProfileUpload,
  finalizeUpload: finalizeProfileUpload,
  launchPicker: async () => {
    const ImagePicker = await import("expo-image-picker");
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
  requestPermission: async () => {
    const ImagePicker = await import("expo-image-picker");
    return (await ImagePicker.requestMediaLibraryPermissionsAsync()).granted;
  },
};

export const selectAndUploadProfilePhoto = () => uploadProfilePhoto(dependencies);
