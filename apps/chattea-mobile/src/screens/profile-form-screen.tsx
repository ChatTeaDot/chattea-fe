import { ProfileFormFields, useCurrentUser } from "@/features/profile";
import { ErrorState, LoadingState, NativeScreen, NativeScroll } from "@/shared/components";

const ProfileFormScreen = ({ completion = false }: { completion?: boolean }) => {
  const me = useCurrentUser();
  if (!me.data?.me) {
    return (
      <NativeScreen>
        <NativeScroll>{me.loading ? <LoadingState /> : <ErrorState />}</NativeScroll>
      </NativeScreen>
    );
  }
  return <ProfileFormFields key={me.data.me.id} user={me.data.me} completion={completion} />;
};

export default ProfileFormScreen;
