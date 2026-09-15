export const INSTALL_ID_KEY = "chattea.installId";

export const INSTALL_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const endpoint = process.env.EXPO_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";
