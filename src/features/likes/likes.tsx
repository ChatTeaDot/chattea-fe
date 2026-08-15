import { LegendList } from "@legendapp/list/react-native";
import { useState } from "react";
import { StyleSheet } from "react-native-unistyles";

import { useMatchCandidates } from "@/features/match/hooks";
import { MatchCandidate } from "@/features/match/types";
import { ContentState, getContentViewState, Screen } from "@/shared/components";
import type { AppTheme } from "@/theme/unistyles";

import { LikeCandidateRow, LikeTab, LikeTabs } from "./components";
import { useLikedMeCandidates } from "./hooks";

export const LikeScreen = () => {
  const [activeTab, setActiveTab] = useState<LikeTab>("received");
  const likedMeCandidates = useLikedMeCandidates(true);
  const matchCandidates = useMatchCandidates();
  const sentCandidates = (matchCandidates.data ?? []).filter((candidate) => candidate.likedByMe);
  const data = activeTab === "received" ? (likedMeCandidates.data ?? []) : sentCandidates;
  const query = activeTab === "received" ? likedMeCandidates : matchCandidates;
  const viewState = getContentViewState(query.loading, Boolean(query.error), data.length);

  const renderCandidate = ({ item }: { item: MatchCandidate }) => {
    return <LikeCandidateRow candidate={item} />;
  };

  return (
    <Screen>
      <LikeTabs onChange={setActiveTab} value={activeTab} />
      {viewState === "loading" ? <ContentState kind="loading" /> : null}
      {viewState === "error" ? (
        <ContentState kind="error" onRetry={() => void query.refetch().catch(() => undefined)} />
      ) : null}
      {viewState === "empty" ? (
        <ContentState
          kind="empty"
          title={
            activeTab === "received" ? "아직 받은 좋아요가 없어요" : "아직 보낸 좋아요가 없어요"
          }
          message="부담 없이 둘러보고 마음이 가는 사람에게 좋아요를 보내보세요."
        />
      ) : null}
      {viewState === "content" ? (
        <LegendList
          contentContainerStyle={styles.list}
          data={data}
          keyExtractor={(item) => item.id}
          recycleItems={false}
          renderItem={renderCandidate}
          style={styles.listFrame}
        />
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create((theme: AppTheme) => ({
  list: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  listFrame: {
    flex: 1,
  },
}));
