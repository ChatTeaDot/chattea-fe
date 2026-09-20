import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { MatchPairAvatars } from "@/features/matches";
import { useCurrentUser } from "@/features/profile";
import { AppButton } from "@/shared/components";
import { useRouteParam } from "@/shared/hooks";

const MatchSheetScreen = () => {
  const roomId = useRouteParam("room-id");
  const name = useRouteParam("name") ?? "상대";
  const photo = useRouteParam("photo");
  const me = useCurrentUser();
  const startChat = () => {
    if (!roomId) return router.back();
    router.replace(`/rooms/${roomId}`);
  };
  return (
    <View style={styles.sheet}>
      <Text style={styles.title}>매치됐어요!</Text>
      <Text style={styles.sub}>{name}님도 회원님을 좋아해요</Text>
      <MatchPairAvatars candidatePhoto={photo} myPhoto={me.data?.me.photos[0]?.url} />
      <AppButton onPress={startChat} title="채팅하기" />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.later, pressed && styles.laterPressed]}
      >
        <Text style={styles.laterText}>나중에</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  sheet: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "800",
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  sub: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  later: {
    alignItems: "center",
    padding: theme.spacing.sm,
  },
  laterPressed: {
    opacity: 0.62,
  },
  laterText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
}));

export default MatchSheetScreen;
