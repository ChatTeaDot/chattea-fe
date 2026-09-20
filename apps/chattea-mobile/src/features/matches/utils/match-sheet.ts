import { router } from "expo-router";

import type { MatchCandidate } from "../api";

export const openMatchSheet = (candidate: MatchCandidate, roomId: string) => {
  router.push({
    pathname: "/match-sheet",
    params: {
      name: candidate.userName,
      photo: candidate.photos[0]?.url ?? "",
      "room-id": roomId,
    },
  });
};
