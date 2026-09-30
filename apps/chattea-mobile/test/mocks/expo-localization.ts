// Vitest stub: the native ExpoLocalization module is unavailable in Node.
export const getLocales = () => [
  { languageCode: "ko", languageTag: "ko-KR", regionCode: "KR" },
];

export const getCalendars = () => [];

export const useLocales = () => getLocales();
