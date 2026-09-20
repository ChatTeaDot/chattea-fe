import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { CandidateDetailBody, useCandidateDetail } from "@/features/matches";
import { AppButton, EmptyState, ErrorState, LoadingState, NativeScreen } from "@/shared/components";

const CandidateDetailScreen = () => {
  const { candidate, error, likePending, loading, sendLike } = useCandidateDetail();
  return (
    <NativeScreen>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState />
      ) : candidate ? (
        <>
          <ScrollView contentInsetAdjustmentBehavior="automatic">
            <CandidateDetailBody candidate={candidate} />
          </ScrollView>
          <SafeAreaView edges={["bottom"]} style={styles.cta}>
            <AppButton disabled={likePending} onPress={() => void sendLike()} title="좋아요 ♥" />
          </SafeAreaView>
        </>
      ) : (
        <EmptyState
          title="프로필을 찾지 못했어요"
          body="이미 지나간 인연이에요. 오늘의 추천을 살펴봐 주세요."
        />
      )}
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  cta: {
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.sm,
  },
}));

export default CandidateDetailScreen;
