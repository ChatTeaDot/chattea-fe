import { useMutation, useQuery } from "@apollo/client/react";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";

import {
  EmptyState,
  formatRelativeDate,
  LoadingState,
  MetaText,
  NativeCard,
  NativeList,
  NativeScreen,
} from "@/features/native/components";
import {
  type AppNotification,
  MARK_NOTIFICATION_READ_MUTATION,
  NOTIFICATIONS_QUERY,
  parseNotificationRoute,
} from "@/features/native/notifications";

import { ErrorState, type NotificationsData, showActionError, styles } from "./screen-shared";

type NotificationRowProps = AppNotification & { onVisit: (notification: AppNotification) => void };

const NotificationRow = memo(
  ({ body, createdAt, id, onVisit, readAt, route, title, type }: NotificationRowProps) => {
    const visit = useCallback(
      () => onVisit({ body, createdAt, id, readAt, route, title, type }),
      [body, createdAt, id, onVisit, readAt, route, title, type],
    );
    return (
      <Pressable accessibilityRole="link" onPress={visit} style={styles.pressableCard}>
        <NativeCard>
          <View style={styles.postMeta}>
            <MetaText>{readAt ? "확인함" : "새 알림"}</MetaText>
            <MetaText>{formatRelativeDate(createdAt)}</MetaText>
          </View>
          <Text style={styles.postTitle}>{title}</Text>
          <Text style={styles.postBody}>{body}</Text>
        </NativeCard>
      </Pressable>
    );
  },
);
NotificationRow.displayName = "NotificationRow";

const keyExtractor = (item: AppNotification) => item.id;

export const NotificationsScreen = () => {
  const notifications = useQuery<NotificationsData>(NOTIFICATIONS_QUERY);
  const [markRead] = useMutation<{ markNotificationRead: boolean }>(
    MARK_NOTIFICATION_READ_MUTATION,
  );
  const refetchNotifications = notifications.refetch;
  const visit = useCallback(
    async (notification: AppNotification) => {
      try {
        if (!notification.readAt)
          await markRead({ variables: { notificationId: notification.id } });
        const route = parseNotificationRoute(notification.route);
        if (route) router.push(route);
        void refetchNotifications();
      } catch (error) {
        showActionError(error);
      }
    },
    [markRead, refetchNotifications],
  );
  const renderNotification = useCallback(
    ({ item }: { item: AppNotification }) => <NotificationRow {...item} onVisit={visit} />,
    [visit],
  );
  const empty = notifications.loading ? (
    <LoadingState />
  ) : notifications.error ? (
    <ErrorState />
  ) : (
    <EmptyState
      title="새 알림이 없어요"
      body="좋아요, 매치, 메시지와 댓글 소식을 여기에서 알려드릴게요."
    />
  );
  return (
    <NativeScreen>
      <NativeList
        data={notifications.data?.notifications ?? []}
        keyExtractor={keyExtractor}
        ListEmptyComponent={empty}
        renderItem={renderNotification}
      />
    </NativeScreen>
  );
};
