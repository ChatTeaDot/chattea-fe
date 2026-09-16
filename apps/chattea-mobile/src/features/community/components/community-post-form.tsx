import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { NativeTextInput } from "@/shared/components";

import {
  COMMUNITY_BODY_MAX_LENGTH,
  COMMUNITY_CATEGORIES,
  COMMUNITY_TITLE_MAX_LENGTH,
} from "../constants";
import { useCommunityPostDraft } from "../hooks";
import type { CommunityCategory } from "../types";
import { updateCommunityPostDraft } from "../utils";
import ChipRow from "./chip-row";

const CommunityPostForm = () => {
  const { draft, setDraft, submit, state } = useCommunityPostDraft();
  const [category, setCategory] = useState<CommunityCategory>(COMMUNITY_CATEGORIES[0]);
  const disabled = !draft.title.trim() || !draft.body.trim() || state.loading;

  return (
    <View style={styles.container}>
      <ChipRow items={COMMUNITY_CATEGORIES} onSelect={setCategory} selected={category} />
      <View style={styles.fields}>
        <NativeTextInput
          maxLength={COMMUNITY_TITLE_MAX_LENGTH}
          onChangeText={(title) =>
            setDraft((current) => updateCommunityPostDraft(current, { title }))
          }
          placeholder="제목"
          style={styles.field}
          value={draft.title}
        />
        <NativeTextInput
          maxLength={COMMUNITY_BODY_MAX_LENGTH}
          multiline
          onChangeText={(body) => setDraft((current) => updateCommunityPostDraft(current, { body }))}
          placeholder="익명으로 올라가요. 편하게 써요…"
          style={[styles.field, styles.area]}
          textAlignVertical="top"
          value={draft.body}
        />
      </View>
      <KeyboardStickyView>
        <SafeAreaView edges={["bottom"]} style={styles.ctaArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => void submit()}
            style={({ pressed }) => [styles.cta, (pressed || disabled) && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>등록</Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardStickyView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  fields: {
    flex: 1,
    gap: theme.spacing.control,
  },
  field: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    color: theme.colors.text,
    fontSize: 14,
    marginHorizontal: theme.spacing.screen,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  area: {
    flex: 1,
    minHeight: 160,
    paddingVertical: theme.spacing.md,
  },
  ctaArea: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.surface,
    borderTopWidth: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.xs,
  },
  cta: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.cta,
    height: 52,
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaText: {
    color: theme.colors.accentText,
    fontSize: 16,
    fontWeight: "600",
  },
}));

export default CommunityPostForm;
