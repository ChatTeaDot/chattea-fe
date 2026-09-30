import type { DehydratedState } from "@tanstack/react-query";

const DEHYDRATED_GLOBAL = "window.__DEHYDRATED__";
const LANGUAGE_GLOBAL = "window.__CHATTEA_LANG__";

const isDehydratedState = (value: unknown): value is DehydratedState =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as DehydratedState).queries) &&
  Array.isArray((value as DehydratedState).mutations);

export const dehydratedStateScript = (state: unknown): string => {
  if (!isDehydratedState(state) || (state.queries.length === 0 && state.mutations.length === 0)) {
    return "";
  }
  const serialized = JSON.stringify(state).replace(/</g, "\\u003c");
  return `<script>${DEHYDRATED_GLOBAL}=${serialized}</script>`;
};

export const languageScript = (language: string): string =>
  `<script>${LANGUAGE_GLOBAL}=${JSON.stringify(language)}</script>`;

export const injectDehydratedState = (
  tail: string,
  state: unknown,
  language?: string,
): string =>
  tail.replace(
    "</body>",
    `${language ? languageScript(language) : ""}${dehydratedStateScript(state)}</body>`,
  );
