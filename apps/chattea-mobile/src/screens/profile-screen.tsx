import { MyProfileEditor, useProfile } from "@/features/profile";
import { ErrorState, LoadingState, NativeScreen, NativeScroll } from "@/shared/components";

const ProfileScreen = () => {
  const { me, subscription } = useProfile();
  if (me.loading)
    return (
      <NativeScreen>
        <NativeScroll>
          <LoadingState />
        </NativeScroll>
      </NativeScreen>
    );
  if (!me.data?.me)
    return (
      <NativeScreen>
        <NativeScroll>
          <ErrorState />
        </NativeScroll>
      </NativeScreen>
    );
  return (
    <MyProfileEditor
      key={me.data.me.id}
      planId={subscription.data?.currentSubscription.planId}
      user={me.data.me}
    />
  );
};

export default ProfileScreen;
