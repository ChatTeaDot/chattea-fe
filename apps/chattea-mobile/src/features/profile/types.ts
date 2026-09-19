import type {
  CreatedProfileUpload,
  CreateProfileUploadInput,
  CurrentUser,
  FinalizedProfileUpload,
  PickerResult,
  VerifiedProfilePhoto,
} from "./api/schemas";

export type ProfilePhotoUploadDependencies = {
  createUpload: (input: CreateProfileUploadInput) => Promise<CreatedProfileUpload>;
  finalizeUpload: (uploadId: string) => Promise<FinalizedProfileUpload>;
  launchPicker: () => Promise<PickerResult>;
  putObject: (
    url: string,
    input: { body: ArrayBuffer; headers: Record<string, string> },
  ) => Promise<{ ok: boolean }>;
  readLocalFile: (uri: string) => Promise<ArrayBuffer>;
  requestPermission: () => Promise<boolean>;
};

export type ProfileFormFieldsProps = { user: CurrentUser; completion: boolean };

export type ChoiceButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export type FormLabelProps = { label: string; hint?: string };

export type MyProfileEditorProps = {
  planId: "basic" | "black" | "free" | "gold" | undefined;
  user: CurrentUser;
};

export type PhotoGridProps = {
  photos: VerifiedProfilePhoto[];
  uploading: boolean;
  onAddPhoto: () => void;
};

export type PlanBadgeProps = { planId: "basic" | "black" | "free" | "gold" | undefined };
