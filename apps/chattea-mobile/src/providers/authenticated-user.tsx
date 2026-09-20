import { createContext, type PropsWithChildren, useContext } from "react";

const AuthenticatedUserContext = createContext<string | null>(null);

const AuthenticatedUserProvider = ({
  children,
  userId,
}: PropsWithChildren<{ userId: string | null }>) => {
  return (
    <AuthenticatedUserContext.Provider value={userId}>{children}</AuthenticatedUserContext.Provider>
  );
};

export const useAuthenticatedUserId = (): string | null => useContext(AuthenticatedUserContext);

export default AuthenticatedUserProvider;
