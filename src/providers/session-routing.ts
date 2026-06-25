export function getSessionRedirect(hydrated: boolean, hasSession: boolean) {
  if (!hydrated) {
    return null;
  }

  return hasSession ? "/matches" : "/phone";
}
