import { Redirect, useLocalSearchParams } from "expo-router";

const LegacyRoomRoute = () => {
  const params = useLocalSearchParams<{ "room-id": string }>();
  return <Redirect href={`/rooms/${params["room-id"]}`} />;
};

export default LegacyRoomRoute;
