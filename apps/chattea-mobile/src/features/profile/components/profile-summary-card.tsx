import { router } from "expo-router";
import { Text } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { ContentPhoto, MetaText, NativeButton, NativeCard } from "@/shared/components";

import type { ProfileSummaryCardProps } from "../types";
const ProfileSummaryCard = ({ user }: ProfileSummaryCardProps) => {
  return (
    <NativeCard>
      <ContentPhoto height={144} label="내 대표 사진" uri={user.photos[0]?.url} />
      <Text style={styles.personName}>{user.userName || "프로필을 완성해 주세요"}</Text>
      <MetaText>{user.region ?? "지역을 설정해 주세요"}</MetaText>
      <Text style={styles.intro}>
        {user.intro || "소개를 작성하면 더 잘 맞는 인연을 추천해 드려요."}
      </Text>
      <NativeButton label="프로필 편집" onPress={() => router.push("/profile/edit")} fullWidth />
    </NativeCard>
  );
};
const styles = StyleSheet.create((theme) => ({
  personName: { color: theme.colors.text, fontSize: 26, fontWeight: "800", letterSpacing: -0.6 },
  intro: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
}));
export default ProfileSummaryCard;
