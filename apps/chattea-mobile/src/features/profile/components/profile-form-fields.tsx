import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation("profile");
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
        <Text style={styles.guide}>{t("photos.guide")}</Text>
        <SectionHeading
          title={t("photos.count", { count: photos.length, max: MAX_PROFILE_PHOTOS })}
        />
        {photos.map((photo, index) => (
          <NativeCard key={photo.uploadId}>
            <ContentPhoto
              height={144}
              label={t("photos.label", { index: index + 1 })}
              uri={photo.url}
            />
            <NativeButton
              label={index === 0 ? t("photos.deleteMain") : t("photos.delete")}
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
          label={uploading ? t("photos.uploading") : t("photos.add")}
          onPress={() => void addPhoto()}
          tone="secondary"
          fullWidth
        />
        <FormLabel label={t("fields.name")} />
        <NativeTextInput
          accessibilityLabel={t("fields.name")}
          maxLength={PROFILE_NAME_MAX_LENGTH}
          onChangeText={setUserName}
          placeholder={t("fields.name")}
          style={styles.input}
          value={userName}
        />
        <FormLabel label={t("fields.birthDate")} hint={t("fields.birthDateHint")} />
        <NativeTextInput
          accessibilityLabel={t("fields.birthDate")}
          keyboardType="numbers-and-punctuation"
          onChangeText={setBirthDate}
          placeholder="1998-01-01"
          style={styles.input}
          value={birthDate}
        />
        <FormLabel label={t("fields.region")} />
        <View style={styles.choiceWrap}>
          {KOREAN_REGIONS.map((item) => (
            <ChoiceButton
              key={item}
              label={t(`regions.${item}`)}
              selected={region === item}
              onPress={() => setRegion(item)}
            />
          ))}
        </View>
        <FormLabel label={t("fields.interestedIn")} />
        <View style={styles.choiceWrap}>
          <ChoiceButton
            label={t("gender.male")}
            selected={interestedGender === "male"}
            onPress={() => setInterestedGender("male")}
          />
          <ChoiceButton
            label={t("gender.female")}
            selected={interestedGender === "female"}
            onPress={() => setInterestedGender("female")}
          />
          <ChoiceButton
            label={t("gender.everyone")}
            selected={interestedGender === "everyone"}
            onPress={() => setInterestedGender("everyone")}
          />
        </View>
        <FormLabel label={t("fields.intro")} hint={t("fields.introHint")} />
        <NativeTextInput
          accessibilityLabel={t("fields.intro")}
          maxLength={PROFILE_INTRO_MAX_LENGTH}
          multiline
          onChangeText={setIntro}
          placeholder={t("fields.introPlaceholder")}
          style={[styles.input, styles.inputLarge]}
          textAlignVertical="top"
          value={intro}
        />
        <NativeButton
          disabled={updateState.loading}
          label={completion ? t("actions.complete") : t("actions.save")}
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
