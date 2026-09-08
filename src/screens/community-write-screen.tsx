import { CommunityPostForm } from "@/features/community";
import { NativeScreen, NativeScroll } from "@/shared/components";
const CommunityWriteScreen = () => {
  return (
    <NativeScreen>
      <NativeScroll>
        <CommunityPostForm />
      </NativeScroll>
    </NativeScreen>
  );
};
export default CommunityWriteScreen;
