import type { ProfileUpdateFields } from "../api";

export const buildProfileUpdateInput = (fields: ProfileUpdateFields) => ({
  birthDate: fields.birthDate,
  interestedGender: fields.interestedGender,
  intro: fields.intro,
  photoUploadIds: fields.photos.map((photo) => photo.uploadId),
  region: fields.region,
  userName: fields.userName,
});
