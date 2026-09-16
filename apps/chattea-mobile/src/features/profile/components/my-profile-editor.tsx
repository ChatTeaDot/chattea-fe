import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { AppButton, BottomCta, ListRow, NativeScreen, NativeTextInput } from "@/shared/components";

import { PROFILE_ATTRIBUTE_ROWS, PROFILE_INTRO_MAX_LENGTH } from "../constants";
import { useMyProfileEditor } from "../hooks";
import type { MyProfileEditorProps } from "../types";
import PhotoGrid from "./photo-grid";
import PlanBadge from "./plan-badge";

const MyProfileEditor = ({ user, planId }: MyProfileEditorProps) => {
  const { theme } = useUnistyles();
  const { intro, setIntro, photos, uploading, addPhoto, save, updateState } =
    useMyProfileEditor(user);
  return (
    <NativeScreen>
      <ScrollView
        automaticallyAdjustsScrollIndicatorInsets
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PhotoGrid photos={photos} uploading={uploading} onAddPhoto={() => void addPhoto()} />
        <PlanBadge planId={planId} />
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>소개 (60자)</Text>
          <NativeTextInput
            accessibilityLabel="소개"
            maxLength={PROFILE_INTRO_MAX_LENGTH}
            onChangeText={setIntro}
            placeholder="주말엔 전시 보러 다녀요…"
            style={styles.field}
            value={intro}
          />
        </View>
        <View>
          {PROFILE_ATTRIBUTE_ROWS.map((title, index) => (
            <ListRow
              key={title}
              last={index === PROFILE_ATTRIBUTE_ROWS.length - 1}
              onPress={() => router.push("/profile/edit")}
              side={<ChevronRight color={theme.colors.muted} size={20} strokeWidth={1.75} />}
              title={title}
            />
          ))}
        </View>
      </ScrollView>
      <BottomCta>
        <AppButton disabled={updateState.loading} onPress={() => void save()} title="저장" />
      </BottomCta>
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.section,
    paddingBottom: theme.spacing.lg,
  },
  fieldGroup: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
  },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
  field: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    color: theme.colors.text,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.control,
  },
}));

export default MyProfileEditor;
