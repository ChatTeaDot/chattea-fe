import { memo, useCallback } from "react";

import { type AppNotification, useNotifications } from "@/features/notifications";
import { NotificationRow as NotificationRowComponent } from "@/features/notifications";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  NativeList,
  NativeScreen,
} from "@/shared/components";

const NotificationRow = memo(NotificationRowComponent);
NotificationRow.displayName = "NotificationRow";

const keyExtractor = (item: AppNotification) => item.id;

const NotificationsScreen = () => {
  const { notifications, visit } = useNotifications();
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

export default NotificationsScreen;
