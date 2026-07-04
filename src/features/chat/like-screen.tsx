import { LegendList } from "@legendapp/list/react-native";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { Screen } from "@/shared/components/screen";
import { colors, spacing } from "@/theme/tokens";

import { useLikedMeCandidates, useMatchCandidates } from "./hooks";
import { MatchCandidate } from "./types";

type LikeTab = "received" | "sent";

const tabs: { key: LikeTab; label: string }[] = [
  { key: "received", label: "LIKE" },
  { key: "sent", label: "내가 보낸 LIKE" },
];

export const LikeScreen = () => {
  const [activeTab, setActiveTab] = useState<LikeTab>("received");
  const likedMeCandidates = useLikedMeCandidates(true);
  const matchCandidates = useMatchCandidates();
  const sentCandidates = (matchCandidates.data ?? []).filter((candidate) => candidate.likedByMe);
  const data = activeTab === "received" ? (likedMeCandidates.data ?? []) : sentCandidates;

  const renderCandidate = ({ item }: { item: MatchCandidate }) => {
    return <LikeCandidateRow candidate={item} />;
  };

  return (
    <Screen>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <LegendList
        contentContainerStyle={styles.list}
        data={data}
        keyExtractor={(item) => item.id}
        recycleItems={false}
        renderItem={renderCandidate}
        style={styles.listFrame}
      />
    </Screen>
  );
};

const LikeCandidateRow = ({ candidate }: { candidate: MatchCandidate }) => {
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
  activeTab: {
    backgroundColor: colors.primary,
  },
  activeTabText: {
    color: colors.primaryText,
  },
  initial: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  list: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  listFrame: {
    flex: 1,
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
  tab: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  tabs: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  tabText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "900",
  },
});
