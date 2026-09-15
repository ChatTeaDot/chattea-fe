import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ContentPhoto, MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { MatchCandidateCardProps } from "../types";
const MatchCandidateCard = ({
  candidate,
  actionPending,
  act,
  undoLast,
}: MatchCandidateCardProps) => {
  return (
    <NativeCard>
      <ContentPhoto label={`${candidate.userName}님의 대표 사진`} uri={candidate.photos[0]?.url} />
      <View style={styles.profileHeader}>
        <View style={styles.stackTight}>
          <Text style={styles.personName}>
            {candidate.userName} {candidate.age}세
          </Text>
          <MetaText>{candidate.region}</MetaText>
        </View>
        {candidate.boostActive ? (
          <Text style={styles.statusText}>지금 더 많은 사람에게 보여지고 있어요</Text>
        ) : null}
      </View>
      <Text style={styles.intro}>{candidate.intro || "반가워요. 이야기를 나눠 보고 싶어요."}</Text>
      <View style={styles.actionRow}>
        <View style={styles.actionGrow}>
          <NativeButton
            disabled={actionPending}
            label="이번엔 넘기기"
            onPress={() => void act("skip")}
            tone="secondary"
            fullWidth
          />
        </View>
        <View style={styles.actionGrow}>
          <NativeButton
            disabled={actionPending}
            label="관심 보내기"
            onPress={() => void act("like")}
            fullWidth
          />
        </View>
      </View>
      <View style={styles.actionRow}>
        <View style={styles.actionGrow}>
          <NativeButton
            disabled={actionPending}
            label="슈퍼라이크"
            onPress={() => void act("superlike")}
            tone="quiet"
            fullWidth
          />
        </View>
        <View style={styles.actionGrow}>
          <NativeButton
            disabled={actionPending}
            label="되돌리기"
            onPress={() => void undoLast()}
            tone="quiet"
            fullWidth
          />
        </View>
      </View>
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  stackTight: { gap: theme.spacing.sm },
  profileHeader: { gap: theme.spacing.xs },
  personName: { color: theme.colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  intro: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
  statusText: { color: theme.colors.primary, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  actionRow: { flexDirection: "row", gap: theme.spacing.sm },
  actionGrow: { flex: 1 },
}));
export default MatchCandidateCard;
