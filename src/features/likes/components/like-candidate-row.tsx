import { Image } from "expo-image";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MatchCandidate } from "@/features/match/types";
import type { AppTheme } from "@/theme/unistyles";

type LikeCandidateRowProps = {
  candidate: MatchCandidate;
};

export const LikeCandidateRow = ({ candidate }: LikeCandidateRowProps) => {
  const profileText = candidate.age
    ? `${candidate.userName}, ${candidate.age}`
    : candidate.userName;

  return (
    <View style={styles.row}>
      <View style={styles.photo}>
        {candidate.profileImageUrl ? (
          <Image source={{ uri: candidate.profileImageUrl }} style={styles.photoImage} />
        ) : (
          <Text style={styles.initial}>{candidate.userName.slice(0, 1)}</Text>
        )}
      </View>
      <View style={styles.rowText}>
        <Text style={styles.name}>{profileText}</Text>
        <Text style={styles.region}>{candidate.region ?? "지역 미입력"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  initial: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  name: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  photo: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.card,
    height: 56,
    justifyContent: "center",
    overflow: "hidden",
    width: 56,
  },
  photoImage: {
    height: "100%",
    width: "100%",
  },
  region: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.utility,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  rowText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
}));
