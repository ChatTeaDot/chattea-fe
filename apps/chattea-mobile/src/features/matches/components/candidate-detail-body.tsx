import { Image } from "expo-image";
import { BadgeCheck } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme";

import type { CandidateDetailBodyProps } from "../types";

const CandidateDetailBody = ({ candidate }: CandidateDetailBodyProps) => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const photos = candidate.photos.length
    ? [...candidate.photos].sort((a, b) => a.position - b.position)
    : [null];
  return (
    <View>
      <ScrollView
        horizontal
        onMomentumScrollEnd={(event) =>
          setPage(Math.round(event.nativeEvent.contentOffset.x / width))
        }
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {photos.map((photo, index) =>
          photo ? (
            <Image
              accessibilityLabel={`${candidate.userName}님의 사진 ${index + 1}`}
              contentFit="cover"
              key={photo.url}
              recyclingKey={`${candidate.id}-${index}`}
              source={{ uri: photo.url }}
              style={[styles.stripPhoto, { width }]}
              transition={150}
            />
          ) : (
            <View key="placeholder" style={[styles.stripPhoto, { width }]} />
          ),
        )}
      </ScrollView>
      {photos.length > 1 ? (
        <View style={styles.dots}>
          {photos.map((photo, index) => (
            <View
              key={photo?.url ?? index}
              style={[styles.dot, index === page && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>
            {candidate.userName} {candidate.age}
          </Text>
          {candidate.blackRecommended ? <BadgeCheck color={theme.colors.accent} size={20} /> : null}
        </View>
        <Text style={styles.sub}>{candidate.region}</Text>
        <Text style={styles.bio}>{candidate.intro || "반가워요. 이야기를 나눠 보고 싶어요."}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  stripPhoto: {
    backgroundColor: theme.colors.surfaceSoft,
    height: 320,
  },
  dots: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
  },
  dot: {
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radii.pill,
    height: 8,
    width: 8,
  },
  dotActive: {
    backgroundColor: theme.colors.accent,
  },
  info: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.screen,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  sub: {
    color: theme.colors.muted,
    fontSize: 13,
    marginBottom: theme.spacing.sm,
  },
  bio: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
}));

export default CandidateDetailBody;
