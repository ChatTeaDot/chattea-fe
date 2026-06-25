import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { setGraphQLSessionToken } from "../shared/graphql/client";
import { loadStoredSession, saveStoredSession } from "./session-storage";

type Session = {
  token: string;
  userId: string;
};

type SessionContextValue = {
  hydrated: boolean;
  session: Session | null;
  setSession: (session: Session | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const value = useMemo(() => ({ hydrated, session, setSession }), [hydrated, session]);

  useEffect(() => {
    let active = true;

    loadStoredSession()
      .then((storedSession) => {
        if (active) {
          setSession(storedSession);
        }
      })
      .finally(() => {
        if (active) {
          setHydrated(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setGraphQLSessionToken(session?.token ?? null);
  }, [session?.token]);

  useEffect(() => {
    if (hydrated) {
      void saveStoredSession(session);
    }
  }, [hydrated, session]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("SessionProvider missing");
  }
  return value;
}
