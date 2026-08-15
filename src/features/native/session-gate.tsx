import { useQuery } from "@apollo/client/react";
import { router, useSegments } from "expo-router";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useSession } from "@/providers/session-provider";

import { ME_QUERY } from "./operations";
import type { CurrentUser } from "./types";

type MeData = { me: CurrentUser };

const PUBLIC_ROOTS = new Set(["index", "phone", "code", "signup"]);

export const NativeSessionGate = ({ children }: PropsWithChildren) => {
  const { hydrated, session, setSession } = useSession();
  const segments = useSegments() as string[];
  const user = useQuery<MeData>(ME_QUERY, {
    skip: !hydrated || !session,
    fetchPolicy: "cache-and-network",
  });
  const firstSegment = segments[0];
  const onCompletion = segments.includes("profile-completion");
  const inTabs = segments.includes("(tabs)");
  const isPublic =
    segments.length === 0 || (typeof firstSegment === "string" && PUBLIC_ROOTS.has(firstSegment));

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      if (!isPublic) router.replace("/");
      return;
    }
    if (user.error) {
      const message = user.error.message;
      if (message.includes("UNAUTHENTICATED") || message.includes("Unauthorized")) {
        setSession(null);
        router.replace("/");
      }
      return;
    }
    if (!user.data?.me) return;
    if (!user.data.me.profileCompleted && !onCompletion) {
      router.replace("/profile-completion");
      return;
    }
    if (user.data.me.profileCompleted && onCompletion) {
      router.replace("/matches");
      return;
    }
    if (user.data.me.profileCompleted && isPublic && !inTabs) {
      router.replace("/matches");
    }
  }, [hydrated, inTabs, isPublic, onCompletion, session, setSession, user.data?.me, user.error]);

  if (!hydrated || (session && user.loading && !user.data)) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>ChatTea를 준비하고 있어요.</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create((theme) => ({
  loading: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 15,
  },
}));
