import { ReactElement } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

import { MatchCandidate } from "../types";

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

const styles = StyleSheet.create((theme: AppTheme) => ({
  list: {
    gap: theme.spacing.sm,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
}));
