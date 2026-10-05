import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useTranslation } from "@/i18n";

import type { MatchPairAvatarsProps } from "../types";

const MatchPairAvatars = ({ candidatePhoto, myPhoto }: MatchPairAvatarsProps) => {
  const { t } = useTranslation("matches");
  return (
    <View style={styles.avatars}>
      {candidatePhoto ? (
        <Image
          accessibilityLabel={t("sheet.matchPhotoA11y")}
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: candidatePhoto }}
          style={styles.avatar}
          transition={150}
        />
      ) : (
        <View style={styles.avatar} />
      )}
      {myPhoto ? (
        <Image
          accessibilityLabel={t("sheet.myPhotoA11y")}
          cachePolicy="memory-disk"
          contentFit="cover"
          source={{ uri: myPhoto }}
          style={styles.avatar}
          transition={150}
        />
      ) : (
        <View style={styles.avatar} />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  avatars: {
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    backgroundColor: theme.colors.surfaceSoft,
    borderCurve: "continuous",
    borderRadius: theme.radii.pill,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    height: 72,
    width: 72,
  },
}));

export default MatchPairAvatars;
