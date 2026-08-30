import { createContext, useContext } from "react";

import type { RevenueCatContextValue } from "./types";

export const RevenueCatContext = createContext<RevenueCatContextValue | null>(null);

export const useRevenueCat = (): RevenueCatContextValue => {
  const value = useContext(RevenueCatContext);
  if (!value) throw new Error("RevenueCatProvider missing");
  return value;
};
