const INSTALL_ID_KEY = "chattea.installId";
const INSTALL_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
