import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import { CandidateDetailBody, useCandidateDetail } from "@/features/matches";
import { useTranslation } from "@/i18n";
import { AppButton, EmptyState, ErrorState, LoadingState, NativeScreen } from "@/shared/components";

const CandidateDetailScreen = () => {
  const { t } = useTranslation("matches");
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
            <AppButton
              disabled={likePending}
              onPress={() => void sendLike()}
              title={t("actions.likeCta")}
            />
          </SafeAreaView>
        </>
      ) : (
        <EmptyState title={t("candidate.notFoundTitle")} body={t("candidate.notFoundBody")} />
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
