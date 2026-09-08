import { INSTALL_ID_KEY, INSTALL_ID_PATTERN } from "@/shared/graphql/constants";

let installId: string | null = null;
let installIdInitialization: Promise<string> | null = null;

const initializeInstallId = async () => {
  const SecureStore = await import("expo-secure-store");
  const stored = await SecureStore.getItemAsync(INSTALL_ID_KEY);
  if (stored && INSTALL_ID_PATTERN.test(stored)) return stored;

  const { randomUUID } = await import("expo-crypto");
  const installId = randomUUID();
  await SecureStore.setItemAsync(INSTALL_ID_KEY, installId);
  return installId;
};

export const getInstallId = () => {
  if (installId) return Promise.resolve(installId);
  installIdInitialization ??= initializeInstallId()
    .then((value) => {
      installId = value;
      return value;
    })
    .catch((error: unknown) => {
      installIdInitialization = null;
      throw error;
    });
  return installIdInitialization;
};
