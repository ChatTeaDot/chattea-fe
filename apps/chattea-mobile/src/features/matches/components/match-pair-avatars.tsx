import { Image } from "expo-image";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import type { MatchPairAvatarsProps } from "../types";

const MatchPairAvatars = ({ candidatePhoto, myPhoto }: MatchPairAvatarsProps) => {
  return (
    <View style={styles.avatars}>
      {candidatePhoto ? (
        <Image
          accessibilityLabel="매치된 상대의 사진"
          contentFit="cover"
          source={{ uri: candidatePhoto }}
          style={styles.avatar}
          transition={150}
        />
      ) : (
        <View style={styles.avatar} />
      )}
      {myPhoto ? (
        <Image
          accessibilityLabel="내 사진"
          contentFit="cover"
          source={{ uri: myPhoto }}
          style={styles.avatar}
          transition={150}
        />
      ) : (
        <View style={styles.avatar} />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  avatars: {
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "center",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    backgroundColor: theme.colors.surfaceSoft,
    borderCurve: "continuous",
    borderRadius: theme.radii.pill,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    height: 72,
    width: 72,
  },
}));

export default MatchPairAvatars;
