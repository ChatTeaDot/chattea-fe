import { LegendList } from "@legendapp/list/react-native";
import { useState } from "react";
import { StyleSheet } from "react-native-unistyles";

import { MatchCandidate, useMatchCandidates } from "@/features/match";
import { Screen } from "@/shared/components";
import { spacing } from "@/theme/tokens";

import { LikeCandidateRow, LikeTab, LikeTabs } from "./components";
import { useLikedMeCandidates } from "./hooks";

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
      <LikeTabs onChange={setActiveTab} value={activeTab} />
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

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  listFrame: {
    flex: 1,
  },
});
