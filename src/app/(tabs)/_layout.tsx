import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useUnistyles } from "react-native-unistyles";

import type { AppTheme } from "@/theme/unistyles";

const TabsLayout = () => {
  const { theme } = useUnistyles() as { theme: AppTheme };

  return (
    <NativeTabs
      blurEffect="systemDefault"
      iconColor={{ default: theme.colors.muted, selected: theme.colors.primary }}
      minimizeBehavior="automatic"
      shadowColor={theme.colors.transparent}
      tabBarRespectsIMEInsets
      tintColor={theme.colors.primary}
    >
      <NativeTabs.Trigger name="matches">
        <NativeTabs.Trigger.Label>인연</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "favorite_border", selected: "favorite" }}
          sf={{ default: "heart", selected: "heart.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Label>커뮤니티</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "groups", selected: "groups" }}
          sf={{ default: "person.2", selected: "person.2.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="likes">
        <NativeTabs.Trigger.Label>좋아요</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "favorite_border", selected: "favorite" }}
          sf={{ default: "heart", selected: "heart.fill" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rooms">
        <NativeTabs.Trigger.Label>채팅</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "message",
            selected: "message.fill",
          }}
          md={{ default: "chat_bubble_outline", selected: "chat_bubble" }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>프로필</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          md={{ default: "account_circle", selected: "account_circle" }}
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
