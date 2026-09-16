export const COMMUNITY_CATEGORIES = ["연애", "일상", "질문"] as const;

export const COMMUNITY_FILTERS = ["전체", ...COMMUNITY_CATEGORIES] as const;

export const COMMUNITY_TITLE_MAX_LENGTH = 80;

export const COMMUNITY_BODY_MAX_LENGTH = 1000;
