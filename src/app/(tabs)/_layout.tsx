import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useUnistyles } from "react-native-unistyles";

import { useLikedMeCandidates } from "@/features/likes/hooks";
import type { AppTheme } from "@/theme/unistyles";

const TabsLayout = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };
  const likedMeCandidates = useLikedMeCandidates(true);
  const likeCount = likedMeCandidates.data?.length ?? 0;

  return (
    <NativeTabs
      blurEffect="systemDefault"
      iconColor={{ default: theme.colors.muted, selected: theme.colors.primary }}
      minimizeBehavior="automatic"
      shadowColor={theme.colors.transparent}
      tintColor={theme.colors.primary}
    >
      <NativeTabs.Trigger name="matches">
        <NativeTabs.Trigger.Label>추천</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="home" sf={{ default: "house", selected: "house" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Label>커뮤니티</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="groups"
          sf={{ default: "person.2", selected: "person.2.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="likes">
        <NativeTabs.Trigger.Label>좋아요</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon md="favorite" sf={{ default: "heart", selected: "heart.fill" }} />
        {likeCount > 0 ? (
          <NativeTabs.Trigger.Badge>{String(likeCount)}</NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rooms">
        <NativeTabs.Trigger.Label>채팅</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "message",
            selected: "message.fill",
          }}
          md="chat"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>프로필</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md="account_circle"
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
