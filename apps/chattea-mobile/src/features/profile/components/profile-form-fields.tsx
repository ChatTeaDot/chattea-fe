import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import {
  ContentPhoto,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
  NativeTextInput,
  SectionHeading,
} from "@/shared/components";

import {
  KOREAN_REGIONS,
  MAX_PROFILE_PHOTOS,
  PROFILE_INTRO_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
} from "../constants";
import { useProfileForm } from "../hooks";
import type { ProfileFormFieldsProps } from "../types";
import ChoiceButton from "./choice-button";
import FormLabel from "./form-label";

const ProfileFormFields = ({ user, completion }: ProfileFormFieldsProps) => {
  const {
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
  } = useProfileForm(user, completion);
  return (
    <NativeScreen>
      <NativeScroll>
        <Text style={styles.guide}>
          사진 1장은 꼭 올려 주세요. 추가 사진은 최대 2장까지 더 올릴 수 있어요.
        </Text>
        <SectionHeading title={`사진 ${photos.length}/3`} />
        {photos.map((photo, index) => (
          <NativeCard key={photo.uploadId}>
            <ContentPhoto height={144} label={`프로필 사진 ${index + 1}`} uri={photo.url} />
            <NativeButton
              label={index === 0 ? "대표 사진 삭제" : "사진 삭제"}
              onPress={() =>
                setPhotos((current) => current.filter((item) => item.uploadId !== photo.uploadId))
              }
              tone="quiet"
              fullWidth
            />
          </NativeCard>
        ))}
        <NativeButton
          disabled={uploading || photos.length >= MAX_PROFILE_PHOTOS}
          label={uploading ? "사진을 올리는 중" : "사진 추가"}
          onPress={() => void addPhoto()}
          tone="secondary"
          fullWidth
        />
        <FormLabel label="이름" />
        <NativeTextInput
          accessibilityLabel="이름"
          maxLength={PROFILE_NAME_MAX_LENGTH}
          onChangeText={setUserName}
          placeholder="이름"
          style={styles.input}
          value={userName}
        />
        <FormLabel label="생년월일" hint="YYYY-MM-DD" />
        <NativeTextInput
          accessibilityLabel="생년월일"
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
          accessibilityLabel="소개"
          maxLength={PROFILE_INTRO_MAX_LENGTH}
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
const styles = StyleSheet.create((theme) => ({
  guide: { color: theme.colors.muted, fontSize: 15, lineHeight: 22 },
  input: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 14,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 13,
  },
  inputLarge: { minHeight: 150 },
  choiceWrap: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.sm },
}));
export default ProfileFormFields;
