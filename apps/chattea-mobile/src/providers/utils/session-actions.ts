type InstallationLogoutInput = {
  clearCache: () => Promise<void>;
  clearSession: () => Promise<void>;
  logOutRevenueCat: () => Promise<void>;
  revokeSession: () => Promise<unknown>;
  unregisterPush: () => Promise<void>;
};

export const performInstallationLogout = async (input: InstallationLogoutInput): Promise<void> => {
  await input.unregisterPush();
  let failure: unknown;
  try {
    await input.revokeSession();
  } catch (error) {
    failure = error;
  }
  try {
    await input.logOutRevenueCat();
  } catch (error) {
    failure ??= error;
  }
  try {
    await input.clearSession();
  } catch (error) {
    failure ??= error;
  }
  try {
    await input.clearCache();
  } catch (error) {
    failure ??= error;
  }
  if (failure) throw failure;
};

type ForcedSessionTerminationInput = Omit<InstallationLogoutInput, "revokeSession">;

export const performForcedSessionTermination = async (
  input: ForcedSessionTerminationInput,
): Promise<unknown[]> => {
  const errors: unknown[] = [];
  try {
    await input.unregisterPush();
  } catch (error) {
    errors.push(error);
  }
  try {
    await input.logOutRevenueCat();
  } catch (error) {
    errors.push(error);
  }
  try {
    await input.clearSession();
  } catch (error) {
    errors.push(error);
  }
  try {
    await input.clearCache();
  } catch (error) {
    errors.push(error);
  }
  return errors;
};
