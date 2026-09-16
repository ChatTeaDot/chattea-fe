import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

import {
  getLikesErrorKind,
  LikeGridCell,
  useLikes,
  VEIL_PLACEHOLDER_COUNT,
} from "@/features/matches";
import {
  AppButton,
  EmptyState,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeList,
  NativeScreen,
} from "@/shared/components";

const GridCell = memo(LikeGridCell);
GridCell.displayName = "LikeGridCell";

const VEIL_IDS = Array.from(
  { length: VEIL_PLACEHOLDER_COUNT },
  (_, index) => `veil-${index}`,
);

const keyExtractor = (item: { id: string }) => item.id;

const LikesScreen = () => {
  const { likes, likeState, sendInterest, refetchLikes } = useLikes();
  const errorKind = likes.error ? getLikesErrorKind(likes.error) : undefined;
  const locked = errorKind === "entitlement";
  const openPremium = useCallback(() => router.push("/premium"), []);
  const renderCell = useCallback(
    ({ item }: { item: { id: string; userName?: string; photos?: { url: string }[] } }) => (
      <GridCell
        disabled={likes.loading || likeState.loading}
        id={item.id}
        locked={locked}
        name={item.userName ?? ""}
        onPress={locked ? openPremium : sendInterest}
        photoUrl={item.photos?.[0]?.url}
      />
    ),
    [likeState.loading, likes.loading, locked, openPremium, sendInterest],
  );
  const empty = likes.loading ? (
    <LoadingState />
  ) : errorKind === "retryable" ? (
    <NativeCard>
      <Text style={styles.title}>좋아요를 불러오지 못했어요</Text>
      <MetaText>잠시 후 다시 시도해 주세요.</MetaText>
      <NativeButton label="다시 시도" onPress={() => void refetchLikes()} fullWidth />
    </NativeCard>
  ) : (
    <EmptyState title="아직 받은 관심이 없어요" body="오늘의 인연에서 먼저 마음을 전해 보세요." />
  );

  return (
    <NativeScreen>
      <NativeList
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.gridContent}
        data={locked ? VEIL_IDS.map((id) => ({ id })) : (likes.data?.likedMeCandidates ?? [])}
        keyExtractor={keyExtractor}
        ListEmptyComponent={locked ? null : empty}
        numColumns={2}
        renderItem={renderCell}
      />
      {locked ? (
        <SafeAreaView edges={["bottom"]} style={styles.cta}>
          <AppButton onPress={openPremium} title="누군지 확인하기" />
        </SafeAreaView>
      ) : null}
    </NativeScreen>
  );
};

const styles = StyleSheet.create((theme) => ({
  gridContent: {
    gap: theme.spacing.control,
    paddingBottom: theme.sizes.tabBar + theme.spacing.xl,
  },
  columns: {
    gap: theme.spacing.control,
  },
  cta: {
    paddingBottom: theme.sizes.tabBar + theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
}));

export default LikesScreen;
