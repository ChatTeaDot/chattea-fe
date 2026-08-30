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
