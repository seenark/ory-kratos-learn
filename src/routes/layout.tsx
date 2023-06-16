import {
  component$,
  Slot,
  useContextProvider,
  useSignal,
  useStyles$,
  useVisibleTask$,
} from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";

import Header from "~/components/starter/header/header";
import Footer from "~/components/starter/footer/footer";

import styles from "./styles.css?inline";
import type { Identity, Session } from "@ory/client";
import { ory } from "~/ory";
import { logoutUrlContext, SessionContext } from "~/stores/session";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.builder.io/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  useStyles$(styles);
  const session = useSignal<Session | null>(null);
  const logoutUrl = useSignal<string | undefined>(undefined);

  useContextProvider(SessionContext, session);
  useContextProvider(logoutUrlContext, logoutUrl);

  const getUserName = (identity?: Identity) => {
    if (!identity) return "no user";
    return identity.traits.email || identity.traits.username;
  };

  useVisibleTask$(async () => {
    try {
      const { data: sessionData } = await ory.toSession();
      session.value = sessionData;
      console.log("session", sessionData);
      const { data: loginFlowData } = await ory.createBrowserLogoutFlow();
      logoutUrl.value = loginFlowData.logout_url;
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <>
      <Header />
      <h1>Welcome to Qwik {getUserName(session.value?.identity)}</h1>

      <main>
        <Slot />
      </main>
      <Footer />
    </>
  );
});
