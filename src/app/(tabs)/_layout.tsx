import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useLikedMeCandidates } from "@/features/chat/hooks";
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
        <NativeTabs.Trigger.Label>추천</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "heart", selected: "heart.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="likes">
        <NativeTabs.Trigger.Label>LIKE</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "heart", selected: "heart.fill" }} />
        {likeCount > 0 ? (
          <NativeTabs.Trigger.Badge>{String(likeCount)}</NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rooms">
        <NativeTabs.Trigger.Label>대화</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "bubble.left.and.bubble.right",
            selected: "bubble.left.and.bubble.right.fill",
          }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="community">
        <NativeTabs.Trigger.Label>라운지</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="plans">
        <NativeTabs.Trigger.Label>멤버십</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "sparkles", selected: "sparkles" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
};

export default TabsLayout;
