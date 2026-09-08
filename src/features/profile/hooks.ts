import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

import { CONSUMABLE_BALANCE_QUERY, type ConsumableBalance } from "@/features/billing";

import { ME_QUERY, selectAndUploadProfilePhoto, UPDATE_PROFILE_MUTATION } from "./api";
import { MAX_PROFILE_PHOTOS } from "./constants";
import { type CurrentUser, type MeData, type VerifiedProfilePhoto } from "./types";
import { showProfileActionError } from "./utils";
import { buildProfileUpdateInput } from "./utils/profile-input";

export const useCurrentUser = () => useQuery<MeData>(ME_QUERY);

export const useProfile = () => {
  const me = useQuery<MeData>(ME_QUERY);
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY);

  return { me, balance };
};

export const useProfileForm = (user: CurrentUser, completion: boolean) => {
  const [updateProfile, updateState] = useMutation<{ updateUserProfile: CurrentUser }>(
    UPDATE_PROFILE_MUTATION,
  );
  const [userName, setUserName] = useState(user.userName);
  const [birthDate, setBirthDate] = useState(user.birthDate ?? "");
  const [region, setRegion] = useState(user.region ?? "");
  const [interestedGender, setInterestedGender] = useState(user.interestedGender ?? "everyone");
  const [intro, setIntro] = useState(user.intro);
  const [photos, setPhotos] = useState<VerifiedProfilePhoto[]>(() =>
    [...user.photos]
      .sort((a, b) => a.position - b.position)
      .map((photo) => ({ uploadId: photo.id, url: photo.url })),
  );
  const [uploading, setUploading] = useState(false);

  const addPhoto = async () => {
    if (photos.length >= MAX_PROFILE_PHOTOS) {
      Alert.alert(`사진은 최대 ${MAX_PROFILE_PHOTOS}장까지 추가할 수 있어요`);
      return;
    }
    setUploading(true);
    try {
      const photo = await selectAndUploadProfilePhoto();
      if (photo) setPhotos((current) => [...current, photo]);
    } catch (error) {
      showProfileActionError(error);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!userName.trim() || !birthDate.trim() || !region || !intro.trim() || photos.length === 0) {
      Alert.alert(
        "프로필을 모두 채워 주세요",
        "사진, 이름, 생년월일, 지역, 소개와 관심 대상을 확인해 주세요.",
      );
      return;
    }
    try {
      await updateProfile({
        variables: {
          input: buildProfileUpdateInput({
            birthDate,
            interestedGender,
            intro,
            photos,
            region,
            userName,
          }),
        },
        refetchQueries: [ME_QUERY],
      });
      if (completion) {
        router.replace("/matches");
      } else {
        router.back();
      }
    } catch (error) {
      showProfileActionError(error);
    }
  };

  return {
    userName,
    setUserName,
    birthDate,
    setBirthDate,
    region,
    setRegion,
    interestedGender,
    setInterestedGender,
    intro,
    setIntro,
    photos,
    setPhotos,
    uploading,
    addPhoto,
    save,
    updateState,
  };
};
