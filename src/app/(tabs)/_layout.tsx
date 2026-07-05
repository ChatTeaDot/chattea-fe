import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useLikedMeCandidates } from "@/features/likes/hooks";
import { colors } from "@/theme/tokens";

const TabsLayout = () => {
  const likedMeCandidates = useLikedMeCandidates(true);
  const likeCount = likedMeCandidates.data?.length ?? 0;

  return (
    <NativeTabs
      blurEffect="systemDefault"
      iconColor={{ default: colors.muted, selected: colors.primary }}
      minimizeBehavior="automatic"
      shadowColor="transparent"
      tintColor={colors.primary}
    >
      <NativeTabs.Trigger name="matches">
        <NativeTabs.Trigger.Label>스와이프</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Label>커뮤니티</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="likes">
        <NativeTabs.Trigger.Label>LIKE</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "heart", selected: "heart.fill" }} />
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
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>프로필</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person.crop.circle", selected: "person.crop.circle.fill" }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
