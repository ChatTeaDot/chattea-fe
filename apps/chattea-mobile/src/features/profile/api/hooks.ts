import { useQuery } from "@apollo/client/react";

import { ME_QUERY } from "./fetchers";
import type { MeData } from "./schemas";

export const useCurrentUser = () => useQuery<MeData>(ME_QUERY);
