import { createContext, type PropsWithChildren, useContext } from "react";

import { useProviderInitMetric } from "./utils/provider-init-metrics";

const AuthenticatedUserContext = createContext<string | null>(null);

const AuthenticatedUserProvider = ({
  children,
  userId,
}: PropsWithChildren<{ userId: string | null }>) => {
  useProviderInitMetric("authenticated-user");
  return (
    <AuthenticatedUserContext.Provider value={userId}>{children}</AuthenticatedUserContext.Provider>
  );
};

export const useAuthenticatedUserId = (): string | null => useContext(AuthenticatedUserContext);

export default AuthenticatedUserProvider;
