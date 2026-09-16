export type CreateProfileUploadInput = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  filename: string;
  sizeBytes: number;
};

export type CreatedProfileUpload = {
  expiresAt: string;
  id: string;
  putUrl: string;
};

export type FinalizedProfileUpload = {
  id: string;
  publicUrl: string;
};

export type VerifiedProfilePhoto = {
  uploadId: string;
  url: string;
};

export type ProfileUpdateFields = {
  birthDate: string;
  interestedGender: string;
  intro: string;
  photos: VerifiedProfilePhoto[];
  region: string;
  userName: string;
};

export type ProfilePhoto = {
  id: string;
  url: string;
  position: number;
};

export type CurrentUser = {
  id: string;
  email: string;
  phone: string | null;
  userName: string;
  gender: string;
  intro: string;
  birthDate: string | null;
  region: string | null;
  interestedGender: string | null;
  photos: ProfilePhoto[];
  profileCompleted: boolean;
};

export type MeData = { me: CurrentUser };

export type PickerResult =
  | { canceled: true }
  | {
      canceled: false;
      fileName?: string | null;
      fileSize?: number;
      mimeType?: string | null;
      uri: string;
    };

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
