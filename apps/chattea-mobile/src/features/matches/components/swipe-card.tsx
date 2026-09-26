import { Image } from "expo-image";
import { Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native-unistyles";

import {
  SWIPE_DISTANCE,
  SWIPE_EXIT_DURATION_MS,
  SWIPE_OFFSCREEN,
  SWIPE_ROTATION,
  SWIPE_VELOCITY,
} from "../constants";
import type { SwipeCardProps } from "../types";

const SwipeCard = ({ candidate, disabled, onPress, onSwipe }: SwipeCardProps) => {
  const { width } = useWindowDimensions();
  const offset = useSharedValue(0);
  const photo = candidate.photos[0]?.url;

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      offset.value = event.translationX;
    })
    .onEnd((event) => {
      const direction =
        event.translationX > SWIPE_DISTANCE || event.velocityX > SWIPE_VELOCITY
          ? "right"
          : event.translationX < -SWIPE_DISTANCE || event.velocityX < -SWIPE_VELOCITY
            ? "left"
            : null;
      if (!direction) {
        offset.value = withSpring(0, { damping: 16, stiffness: 160 });
        return;
      }
      offset.value = withTiming((direction === "right" ? 1 : -1) * width * SWIPE_OFFSCREEN, {
        duration: SWIPE_EXIT_DURATION_MS,
      });
      runOnJS(onSwipe)(direction);
    });

  const tap = Gesture.Tap()
    .enabled(!disabled && Boolean(onPress))
    .maxDuration(250)
    .onEnd(() => {
      if (onPress) runOnJS(onPress)();
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value },
      {
        rotate: `${interpolate(offset.value, [-width, width], [-SWIPE_ROTATION, SWIPE_ROTATION])}deg`,
      },
    ],
  }));

  return (
    <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
      <Animated.View style={[styles.card, cardStyle]}>
        {photo ? (
          <Image
            accessibilityLabel={`${candidate.userName}님의 대표 사진`}
            cachePolicy="memory-disk"
            contentFit="cover"
            onLoad={(event) => {
              if (__DEV__) {
                console.log("[image-cache] swipe-card", event.source.url, event.cacheType);
              }
            }}
            recyclingKey={candidate.id}
            source={{ uri: photo }}
            style={styles.photo}
            transition={150}
          />
        ) : (
          <View style={styles.photo} />
        )}
        <View style={styles.info}>
          <Text style={styles.name}>
            {candidate.userName} {candidate.age}
          </Text>
          <Text style={styles.sub}>{candidate.region}</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create((theme) => ({
  card: {
    backgroundColor: theme.colors.surfaceSoft,
    borderCurve: "continuous",
    borderRadius: theme.radii.card,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    flex: 1,
    marginHorizontal: theme.spacing.screen,
    overflow: "hidden",
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surfaceSoft,
  },
  info: {
    bottom: theme.spacing.card,
    left: theme.spacing.card,
    position: "absolute",
    right: theme.spacing.card,
  },
  name: {
    color: theme.colors.primaryText,
    fontSize: 20,
    fontWeight: "700",
    textShadowColor: theme.colors.overlay,
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 4,
  },
  sub: {
    color: theme.colors.primaryText,
    fontSize: 13,
    textShadowColor: theme.colors.overlay,
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 4,
  },
}));

export default SwipeCard;
