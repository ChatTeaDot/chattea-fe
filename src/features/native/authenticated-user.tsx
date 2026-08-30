import { createContext, type PropsWithChildren, useContext } from "react";

const AuthenticatedUserContext = createContext<string | null>(null);

export const AuthenticatedUserProvider = ({
  children,
  userId,
}: PropsWithChildren<{ userId: string | null }>) => (
  <AuthenticatedUserContext.Provider value={userId}>{children}</AuthenticatedUserContext.Provider>
);

export const useAuthenticatedUserId = (): string | null => useContext(AuthenticatedUserContext);
