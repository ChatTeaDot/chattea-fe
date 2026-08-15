import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import {
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeCard,
  NativeScreen,
  NativeScroll,
} from "../components";
import { MARK_NOTIFICATION_READ_MUTATION, NOTIFICATIONS_QUERY } from "../operations";
import type { AppNotification } from "../types";
import { ErrorState, type NotificationsData, showActionError, styles } from "./screen-shared";

export const NotificationsScreen = () => {
  const notifications = useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
  const [markRead] = useMutation<{ markNotificationRead: boolean }>(
    MARK_NOTIFICATION_READ_MUTATION,
  );
  const visit = async (notification: AppNotification) => {
    try {
      if (!notification.readAt) await markRead({ variables: { notificationId: notification.id } });
      if (notification.route) router.push(notification.route);
      void notifications.refetch();
    } catch (error) {
      showActionError(error);
    }
  };
  return (
    <NativeScreen>
      <NativeScroll>
        {notifications.loading ? <LoadingState /> : null}
        {notifications.error ? <ErrorState /> : null}
        {!notifications.loading &&
        !notifications.error &&
        notifications.data?.notifications.length === 0 ? (
          <EmptyState
            title="새 알림이 없어요"
            body="좋아요, 매치, 메시지와 댓글 소식을 여기에서 알려드릴게요."
          />
        ) : null}
        {notifications.data?.notifications.map((notification) => (
          <Pressable
            key={notification.id}
            onPress={() => void visit(notification)}
            style={styles.pressableCard}
          >
            <NativeCard>
              <View style={styles.postMeta}>
                <MetaText>{notification.readAt ? "확인함" : "새 알림"}</MetaText>
                <MetaText>{formatRelativeDate(notification.createdAt)}</MetaText>
              </View>
              <Text style={styles.postTitle}>{notification.title}</Text>
              <Text style={styles.postBody}>{notification.body}</Text>
            </NativeCard>
          </Pressable>
        ))}
      </NativeScroll>
    </NativeScreen>
  );
};
