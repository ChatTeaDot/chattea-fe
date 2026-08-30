import { gql } from "@apollo/client";

import { apolloClient } from "@/shared/graphql";

import type {
  CreatedProfileUpload,
  CreateProfileUploadInput,
  FinalizedProfileUpload,
} from "./types";

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
