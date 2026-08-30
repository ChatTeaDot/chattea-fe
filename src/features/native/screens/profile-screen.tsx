import { useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { Text, View } from "react-native";

import { CONSUMABLE_BALANCE_QUERY, type ConsumableBalance } from "@/features/native/billing";
import {
  ContentPhoto,
  LoadingState,
  MetaText,
  NativeButton,
  NativeCard,
  NativeScreen,
  NativeScroll,
  SectionHeading,
} from "@/features/native/components";
import { ME_QUERY } from "@/features/native/operations";

import { ErrorState, type MeData, styles } from "./screen-shared";

export const ProfileScreen = () => {
  const me = useQuery<MeData>(ME_QUERY);
  const balance = useQuery<{ consumableBalance: ConsumableBalance }>(CONSUMABLE_BALANCE_QUERY);
  if (me.loading)
    return (
      <NativeScreen>
        <NativeScroll>
          <LoadingState />
        </NativeScroll>
      </NativeScreen>
    );
  if (!me.data?.me)
    return (
      <NativeScreen>
        <NativeScroll>
          <ErrorState />
        </NativeScroll>
      </NativeScreen>
    );
  const user = me.data.me;
  return (
    <NativeScreen>
      <NativeScroll>
        <NativeCard>
          <ContentPhoto height={144} label="내 대표 사진" uri={user.photos[0]?.url} />
          <Text style={styles.personName}>{user.userName || "프로필을 완성해 주세요"}</Text>
          <MetaText>{user.region ?? "지역을 설정해 주세요"}</MetaText>
          <Text style={styles.intro}>
            {user.intro || "소개를 작성하면 더 잘 맞는 인연을 추천해 드려요."}
          </Text>
          <NativeButton
            label="프로필 편집"
            onPress={() => router.push("/profile/edit")}
            fullWidth
          />
        </NativeCard>
        <SectionHeading title="내 이용권" />
        <NativeCard>
          <View style={styles.roomRow}>
            <View style={styles.roomText}>
              <Text style={styles.postTitle}>
                슈퍼라이크 {balance.data?.consumableBalance.superLikeCredits ?? 0}개
              </Text>
              <MetaText>부스트 {balance.data?.consumableBalance.boostCredits ?? 0}회</MetaText>
            </View>
            <NativeButton
              label="이용권 보기"
              onPress={() => router.push("/premium")}
              tone="quiet"
            />
          </View>
        </NativeCard>
        <View style={styles.stackTight}>
          <NativeButton
            label="알림"
            onPress={() => router.push("/notifications")}
            tone="secondary"
            fullWidth
          />
          <NativeButton
            label="설정"
            onPress={() => router.push("/settings")}
            tone="secondary"
            fullWidth
          />
        </View>
      </NativeScroll>
    </NativeScreen>
  );
};
