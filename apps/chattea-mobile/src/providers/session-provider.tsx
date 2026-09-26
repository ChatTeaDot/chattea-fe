import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { setGraphQLSession, setGraphQLSessionHandlers } from "@/shared/graphql";
import { getInstallId } from "@/shared/graphql/utils";

import { measureProviderInit, useProviderInitMetric } from "./utils/provider-init-metrics";
import { loadStoredSession, saveStoredSession, type StoredSession } from "./utils/session-storage";

type Session = StoredSession;

type SessionContextValue = {
  completeSessionTermination: () => void;
  hydrated: boolean;
  requestSessionTermination: () => void;
  session: Session | null;
  setSession: (session: Session | null) => Promise<void>;
  terminationRequested: boolean;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export const publishSession = (
  session: Session | null,
  updateReactSession: (session: Session | null) => void,
) => {
  setGraphQLSession(session);
  updateReactSession(session);
};

export const completeSessionHydration = (
  session: Session | null,
  updateReactSession: (session: Session | null) => void,
  updateHydrated: (hydrated: boolean) => void,
) => {
  publishSession(session, updateReactSession);
  updateHydrated(true);
};

const SessionProvider = ({ children }: PropsWithChildren) => {
  useProviderInitMetric("session");
  const [session, updateSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [terminationRequested, setTerminationRequested] = useState(false);
  const setSession = useCallback(async (nextSession: Session | null) => {
    if (nextSession) {
      await saveStoredSession(nextSession);
      publishSession(nextSession, updateSession);
      return;
    }

    let persistenceError: unknown;
    try {
      await saveStoredSession(null);
    } catch (error) {
      persistenceError = error;
    }
    publishSession(null, updateSession);
    if (persistenceError) throw persistenceError;
  }, []);
  const requestSessionTermination = useCallback(() => setTerminationRequested(true), []);
  const completeSessionTermination = useCallback(() => setTerminationRequested(false), []);
  setGraphQLSessionHandlers({
    onSessionPublished: (refreshedSession) => {
      updateSession(refreshedSession);
    },
    onSessionRefreshed: async (refreshedSession) => {
      await saveStoredSession(refreshedSession);
    },
    onTerminationRequired: requestSessionTermination,
  });
  const value = useMemo(
    () => ({
      completeSessionTermination,
      hydrated,
      requestSessionTermination,
      session,
      setSession,
      terminationRequested,
    }),
    [
      completeSessionTermination,
      hydrated,
      requestSessionTermination,
      session,
      setSession,
      terminationRequested,
    ],
  );

  useEffect(() => {
    let active = true;

    const sessionPromise = measureProviderInit("session:hydration", loadStoredSession);
    void measureProviderInit("install-id:preload", getInstallId).catch(() => undefined);

    sessionPromise
      .then((storedSession) => {
        if (active) {
          completeSessionHydration(storedSession, updateSession, setHydrated);
        }
      })
      .catch(() => {
        if (active) {
          completeSessionHydration(null, updateSession, setHydrated);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("SessionProvider missing");
  }
  return value;
};

export default SessionProvider;
