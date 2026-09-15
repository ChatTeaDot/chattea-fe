import { useQuery } from "@apollo/client/react";
import * as Notifications from "expo-notifications";
import { router, useSegments } from "expo-router";
import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import {
  createNotificationNavigationCoordinator,
  NotificationNavigationContext,
} from "@/features/notifications";
import type { CurrentUser } from "@/features/profile";
import { ME_QUERY } from "@/features/profile";

import AuthenticatedUserProvider from "./authenticated-user";
import { PUBLIC_ROOTS } from "./constants";
import { useSession } from "./session-provider";
import { getNativeSessionDestination } from "./utils/session-routing";

type MeData = { me: CurrentUser };

const NativeSessionGate = ({ children }: PropsWithChildren) => {
  const { hydrated, requestSessionTermination, session } = useSession();
  const segments = useSegments() as string[];
  const user = useQuery<MeData>(ME_QUERY, {
    skip: !hydrated || !session,
    fetchPolicy: "cache-and-network",
  });
  const [notificationNavigation] = useState(() =>
    createNotificationNavigationCoordinator({
      clearLastResponse: Notifications.clearLastNotificationResponse,
      getLastResponse: Notifications.getLastNotificationResponse,
    }),
  );
  const firstSegment = segments[0];
  const onCompletion = segments.includes("profile-completion");
  const inTabs = segments.includes("(tabs)");
  const isPublic =
    segments.length === 0 || (typeof firstSegment === "string" && PUBLIC_ROOTS.has(firstSegment));
  const authenticationError =
    user.error &&
    (user.error.message.includes("UNAUTHENTICATED") || user.error.message.includes("Unauthorized"));
  const protectedContent = (
    <NotificationNavigationContext.Provider value={notificationNavigation}>
      <AuthenticatedUserProvider userId={session ? (user.data?.me.id ?? null) : null}>
        {children}
      </AuthenticatedUserProvider>
    </NotificationNavigationContext.Provider>
  );

  useEffect(() => {
    if (session && user.error) {
      if (authenticationError) requestSessionTermination();
      return;
    }
    const destination = getNativeSessionDestination(
      {
        hasSession: Boolean(session),
        hydrated,
        inTabs,
        isPublic,
        onCompletion,
        profileCompleted: user.data?.me.profileCompleted ?? null,
      },
      notificationNavigation.consumeInitial,
    );
    if (destination) router.replace(destination);
  }, [
    hydrated,
    authenticationError,
    inTabs,
    isPublic,
    notificationNavigation,
    onCompletion,
    requestSessionTermination,
    session,
    user.data?.me,
    user.error,
  ]);

  if (session && authenticationError) {
    return (
      <View style={styles.terminationRoot}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={styles.terminationContent}
        >
          {protectedContent}
        </View>
        <View accessibilityLiveRegion="polite" style={styles.terminationOverlay}>
          <Text style={styles.loadingText}>ChatTea를 준비하고 있어요.</Text>
        </View>
      </View>
    );
  }

  if (!hydrated || (session && user.loading && !user.data)) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>ChatTea를 준비하고 있어요.</Text>
      </View>
    );
  }

  if (session && user.error && !user.data) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>연결을 확인하지 못했어요. 네트워크를 확인해 주세요.</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void user.refetch()}
          style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
        >
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return protectedContent;
};

const styles = StyleSheet.create((theme) => ({
  loading: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    flex: 1,
    gap: theme.spacing.md,
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
  },
  retryButtonPressed: {
    opacity: 0.62,
  },
  retryButtonText: {
    color: theme.colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
  terminationContent: {
    flex: 1,
    opacity: 0,
  },
  terminationOverlay: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    padding: theme.spacing.md,
    position: "absolute",
    right: 0,
    top: 0,
  },
  terminationRoot: {
    flex: 1,
  },
}));

export default NativeSessionGate;
