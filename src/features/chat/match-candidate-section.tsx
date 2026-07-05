import { ReactElement } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { colors, spacing } from "@/theme/tokens";

import { MatchCandidate } from "./types";

type MatchCandidateSectionProps = {
  candidates: MatchCandidate[];
  renderCandidate: ({ item }: { item: MatchCandidate }) => ReactElement;
  title: string;
};

export const MatchCandidateSection = ({
  candidates,
  renderCandidate,
  title,
}: MatchCandidateSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.list}>
        {candidates.map((item) => (
          <View key={item.id}>{renderCandidate({ item })}</View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
});
