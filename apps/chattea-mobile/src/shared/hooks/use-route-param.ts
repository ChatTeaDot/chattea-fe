import { useLocalSearchParams } from "expo-router";

export const useRouteParam = (name: string): string | undefined => {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const value = params[name];
  return Array.isArray(value) ? value[0] : value;
};
