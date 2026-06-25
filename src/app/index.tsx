import { Redirect } from "expo-router";
import { useSession } from "../providers/session-provider";
import { getSessionRedirect } from "../providers/session-routing";

export default function IndexRoute() {
  const { hydrated, session } = useSession();
  const redirect = getSessionRedirect(hydrated, Boolean(session));

  if (!redirect) {
    return null;
  }

  return <Redirect href={redirect} />;
}
