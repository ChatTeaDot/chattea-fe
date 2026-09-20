export const getSessionRedirect = (hydrated: boolean, hasSession: boolean) => {
  if (!hydrated) {
    return null;
  }

  return hasSession ? null : "/";
};

type NativeSessionNavigationState = {
  hasSession: boolean;
  hydrated: boolean;
  inTabs: boolean;
  isPublic: boolean;
  onCompletion: boolean;
  profileCompleted: boolean | null;
};

export const getNativeSessionDestination = (
  state: NativeSessionNavigationState,
  consumeInitialNotification: () => string | null,
): string | null => {
  if (!state.hydrated) return null;
  if (!state.hasSession) return state.isPublic ? null : "/";
  if (state.profileCompleted === null) return null;
  if (!state.profileCompleted) return state.onCompletion ? null : "/profile-completion";
  const notificationDestination = consumeInitialNotification();
  if (notificationDestination) return notificationDestination;
  if (state.onCompletion || (state.isPublic && !state.inTabs)) return "/matches";
  return null;
};
