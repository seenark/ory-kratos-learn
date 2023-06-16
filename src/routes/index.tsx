import { component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { logoutUrlContext } from "~/stores/session";

export default component$(() => {
  const logoutUrl = useContext(logoutUrlContext);

  useVisibleTask$(async () => {});

  return (
    <>
      <h1>Home</h1>
      <h1>
        <Link href="http://localhost:4000/self-service/registration/browser">
          register
        </Link>
      </h1>
      <h1>
        <Link href="http://localhost:4000/self-service/login/browser">
          login
        </Link>
      </h1>
      <h1>
        <Link href={logoutUrl.value}>logout</Link>
      </h1>
      <h1>
        <Link href="http://localhost:4000/self-service/settings/browser">
          settings
        </Link>
      </h1>
      <h1>
        <Link href="http://localhost:4000/self-service/recovery/browser">
          recovery
        </Link>
      </h1>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
