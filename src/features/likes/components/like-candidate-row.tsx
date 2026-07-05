import { Image } from "expo-image";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MatchCandidate } from "@/features/match";
import { colors, spacing } from "@/theme/tokens";

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

const styles = StyleSheet.create({
  initial: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  photo: {
    alignItems: "center",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 28,
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
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
});
