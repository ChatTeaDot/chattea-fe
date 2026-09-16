export const getLikesErrorKind = (error: unknown): "entitlement" | "retryable" => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.includes("LIKED_ME_NOT_AVAILABLE") ? "entitlement" : "retryable";
};
