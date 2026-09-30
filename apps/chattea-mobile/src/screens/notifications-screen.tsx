import { memo, useCallback } from "react";

import { type AppNotification, useNotifications } from "@/features/notifications";
import { NotificationRow as NotificationRowComponent } from "@/features/notifications";
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation("notifications");
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
    <EmptyState title={t("emptyTitle")} body={t("emptyBody")} />
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
