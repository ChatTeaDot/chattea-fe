import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { StyleSheet } from "react-native-unistyles";

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "quiet" | "danger";
  fullWidth?: boolean;
};

export const NativeScreen = ({ children }: PropsWithChildren) => <>{children}</>;

export const NativeScroll = ({ children }: PropsWithChildren) => (
  <ScrollView
    style={styles.scrollFrame}
    contentContainerStyle={styles.scrollContent}
    contentInsetAdjustmentBehavior="automatic"
    automaticallyAdjustsScrollIndicatorInsets
    showsVerticalScrollIndicator={false}
  >
    {children}
  </ScrollView>
);

export const NativeButton = ({
  label,
  onPress,
  disabled = false,
  tone = "primary",
  fullWidth = false,
}: ButtonProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      buttonToneStyle(tone),
      fullWidth && styles.buttonWide,
      (pressed || disabled) && styles.buttonPressed,
    ]}
  >
    <Text style={[styles.buttonText, buttonTextToneStyle(tone)]}>{label}</Text>
  </Pressable>
);

export const NativeCard = ({ children }: PropsWithChildren) => (
  <View style={styles.card}>{children}</View>
);

export const SectionHeading = ({ title, action }: { title: string; action?: ReactNode }) => (
  <View style={styles.sectionHeading}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action}
  </View>
);

export const EmptyState = ({ title, body }: { title: string; body: string }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyBody}>{body}</Text>
  </View>
);

export const LoadingState = () => (
  <View style={styles.empty}>
    <Text style={styles.emptyBody}>잠시만요. 내용을 불러오고 있어요.</Text>
  </View>
);

export const ContentPhoto = ({
  uri,
  label,
  height = 360,
}: {
  uri?: string | null;
  label: string;
  height?: number;
}) => {
  const photoStyle = height > 200 ? styles.photoLarge : styles.photoSmall;
  const fallbackStyle = height > 200 ? styles.photoFallbackLarge : styles.photoFallbackSmall;
  if (!uri) {
    return (
      <View style={fallbackStyle}>
        <Text style={styles.photoFallbackText}>{label}</Text>
      </View>
    );
  }

  return (
    <Image accessibilityLabel={label} contentFit="cover" source={{ uri }} style={photoStyle} />
  );
};

export const MetaText = ({ children }: PropsWithChildren) => (
  <Text style={styles.meta}>{children}</Text>
);

export const formatRelativeDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (elapsedMinutes < 1) return "방금";
  if (elapsedMinutes < 60) return `${elapsedMinutes}분 전`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}시간 전`;
  return `${Math.floor(elapsedHours / 24)}일 전`;
};

const buttonToneStyle = (tone: NonNullable<ButtonProps["tone"]>) => {
  if (tone === "secondary") return styles.buttonSecondary;
  if (tone === "quiet") return styles.buttonQuiet;
  if (tone === "danger") return styles.buttonDanger;
  return styles.buttonPrimary;
};

const buttonTextToneStyle = (tone: NonNullable<ButtonProps["tone"]>) => {
  if (tone === "secondary") return styles.buttonTextSecondary;
  if (tone === "quiet") return styles.buttonTextQuiet;
  if (tone === "danger") return styles.buttonTextDanger;
  return styles.buttonTextPrimary;
};

const styles = StyleSheet.create((theme) => ({
  scrollFrame: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 40,
  },
  button: {
    alignItems: "center",
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  buttonWide: {
    alignSelf: "stretch",
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surfaceSoft,
  },
  buttonQuiet: {
    backgroundColor: "transparent",
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger,
  },
  buttonPressed: {
    opacity: 0.62,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: theme.colors.primaryText,
  },
  buttonTextSecondary: {
    color: theme.colors.text,
  },
  buttonTextQuiet: {
    color: theme.colors.primary,
  },
  buttonTextDanger: {
    color: theme.colors.primaryText,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 20,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  sectionHeading: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  empty: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceRaised,
    borderRadius: 20,
    gap: theme.spacing.sm,
    justifyContent: "center",
    minHeight: 180,
    padding: theme.spacing.lg,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyBody: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  photoLarge: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 20,
    height: 360,
    width: "100%",
  },
  photoSmall: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 16,
    height: 144,
    width: "100%",
  },
  photoFallbackLarge: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 20,
    height: 360,
    justifyContent: "center",
    width: "100%",
  },
  photoFallbackSmall: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: 16,
    height: 144,
    justifyContent: "center",
    width: "100%",
  },
  photoFallbackText: {
    color: theme.colors.muted,
    fontSize: 15,
    textAlign: "center",
  },
  meta: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
}));
