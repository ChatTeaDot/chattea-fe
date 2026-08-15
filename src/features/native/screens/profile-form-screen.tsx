import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import {
  ContentPhoto,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
  SectionHeading,
} from "../components";
import { ME_QUERY, UPDATE_PROFILE_MUTATION } from "../operations";
import { selectAndUploadProfilePhoto } from "../profile-photo-upload";
import type { CurrentUser } from "../types";
import {
  ErrorState,
  KOREAN_REGIONS,
  type MeData,
  NativeTextInput,
  showActionError,
  styles,
} from "./screen-shared";

export const ProfileFormScreen = ({ completion = false }: { completion?: boolean }) => {
  const me = useQuery<MeData>(ME_QUERY);
  if (!me.data?.me) {
    return (
      <NativeScreen>
        <NativeScroll>{me.loading ? <LoadingState /> : <ErrorState />}</NativeScroll>
      </NativeScreen>
    );
  }
  return <ProfileFormFields key={me.data.me.id} user={me.data.me} completion={completion} />;
};

const ProfileFormFields = ({ user, completion }: { user: CurrentUser; completion: boolean }) => {
  const [updateProfile, updateState] = useMutation<{ updateUserProfile: CurrentUser }>(
    UPDATE_PROFILE_MUTATION,
  );
  const [userName, setUserName] = useState(user.userName);
  const [birthDate, setBirthDate] = useState(user.birthDate ?? "");
  const [region, setRegion] = useState(user.region ?? "");
  const [interestedGender, setInterestedGender] = useState(user.interestedGender ?? "everyone");
  const [intro, setIntro] = useState(user.intro);
  const [photoUrls, setPhotoUrls] = useState(() =>
    [...user.photos].sort((a, b) => a.position - b.position).map((photo) => photo.url),
  );
  const [uploading, setUploading] = useState(false);

  const addPhoto = async () => {
    if (photoUrls.length >= 3) {
      Alert.alert("사진은 최대 3장까지 추가할 수 있어요");
      return;
    }
    setUploading(true);
    try {
      const publicUrl = await selectAndUploadProfilePhoto();
      if (publicUrl) setPhotoUrls((current) => [...current, publicUrl]);
    } catch (error) {
      showActionError(error);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (
      !userName.trim() ||
      !birthDate.trim() ||
      !region ||
      !intro.trim() ||
      photoUrls.length === 0
    ) {
      Alert.alert(
        "프로필을 모두 채워 주세요",
        "사진, 이름, 생년월일, 지역, 소개와 관심 대상을 확인해 주세요.",
      );
      return;
    }
    try {
      await updateProfile({
        variables: { input: { userName, birthDate, region, interestedGender, intro, photoUrls } },
        refetchQueries: [ME_QUERY],
      });
      if (completion) {
        router.replace("/matches");
      } else {
        router.back();
      }
    } catch (error) {
      showActionError(error);
    }
  };

  return (
    <NativeScreen>
      <NativeScroll>
        <Text style={styles.guide}>
          사진 1장은 꼭 올려 주세요. 추가 사진은 최대 2장까지 더 올릴 수 있어요.
        </Text>
        <SectionHeading title={`사진 ${photoUrls.length}/3`} />
        {photoUrls.map((url, index) => (
          <NativeCard key={url}>
            <ContentPhoto height={144} label={`프로필 사진 ${index + 1}`} uri={url} />
            <NativeButton
              label={index === 0 ? "대표 사진 삭제" : "사진 삭제"}
              onPress={() => setPhotoUrls((current) => current.filter((item) => item !== url))}
              tone="quiet"
              fullWidth
            />
          </NativeCard>
        ))}
        <NativeButton
          disabled={uploading || photoUrls.length >= 3}
          label={uploading ? "사진을 올리는 중" : "사진 추가"}
          onPress={() => void addPhoto()}
          tone="secondary"
          fullWidth
        />
        <FormLabel label="이름" />
        <NativeTextInput
          maxLength={40}
          onChangeText={setUserName}
          placeholder="이름"
          style={styles.input}
          value={userName}
        />
        <FormLabel label="생년월일" hint="YYYY-MM-DD" />
        <NativeTextInput
          keyboardType="numbers-and-punctuation"
          onChangeText={setBirthDate}
          placeholder="1998-01-01"
          style={styles.input}
          value={birthDate}
        />
        <FormLabel label="지역" />
        <View style={styles.choiceWrap}>
          {KOREAN_REGIONS.map((item) => (
            <ChoiceButton
              key={item}
              label={item}
              selected={region === item}
              onPress={() => setRegion(item)}
            />
          ))}
        </View>
        <FormLabel label="관심 대상" />
        <View style={styles.choiceWrap}>
          <ChoiceButton
            label="남성"
            selected={interestedGender === "male"}
            onPress={() => setInterestedGender("male")}
          />
          <ChoiceButton
            label="여성"
            selected={interestedGender === "female"}
            onPress={() => setInterestedGender("female")}
          />
          <ChoiceButton
            label="모두"
            selected={interestedGender === "everyone"}
            onPress={() => setInterestedGender("everyone")}
          />
        </View>
        <FormLabel label="소개" hint="60자 이내" />
        <NativeTextInput
          maxLength={60}
          multiline
          onChangeText={setIntro}
          placeholder="내 이야기를 짧게 들려주세요"
          style={[styles.input, styles.inputLarge]}
          textAlignVertical="top"
          value={intro}
        />
        <NativeButton
          disabled={updateState.loading}
          label={completion ? "프로필 완성하기" : "저장하기"}
          onPress={() => void save()}
          fullWidth
        />
      </NativeScroll>
    </NativeScreen>
  );
};

const ChoiceButton = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceSelected]}>
    <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
  </Pressable>
);

const FormLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <View style={styles.formLabel}>
    <Text style={styles.formLabelText}>{label}</Text>
    {hint ? <MetaText>{hint}</MetaText> : null}
  </View>
);
