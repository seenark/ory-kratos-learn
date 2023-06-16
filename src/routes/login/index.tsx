import {
  $,
  component$,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type {
  LoginFlow,
  UpdateLoginFlowWithPasswordMethod,
  UpdateLoginFlowWithTotpMethod,
} from "@ory/client";
import { ory } from "~/ory";

type NodeAttribute = {
  disable: boolean;
  name: string;
  node_type: string;
  required: boolean;
  type: string;
  value: string;
};

export default component$(() => {
  const location = useLocation();
  const flowId = location.url.searchParams.get("flow");

  const email = useSignal("");
  const password = useSignal("");
  const loginFlow = useSignal<LoginFlow | undefined>(undefined);
  const csrf = useSignal("");

  useVisibleTask$(async () => {
    if (!flowId) return;
    try {
      const flow = await ory.getLoginFlow({
        id: flowId,
      });
      loginFlow.value = flow.data;
      console.log("flow", flow.data);
      const node0 = flow.data.ui.nodes[0]
        .attributes as unknown as NodeAttribute;
      csrf.value = node0.value;
    } catch (error) {
      console.log("error", error);
    }
  });

  const onClickLogin = $(async () => {
    if (!flowId) return;
    const body: UpdateLoginFlowWithPasswordMethod = {
      method: "password",
      csrf_token: csrf.value,
      identifier: email.value,
      password: password.value,
    };
    const success = await ory.updateLoginFlow({
      flow: flowId,
      updateLoginFlowBody: body,
    });
    alert("login success: " + success.data.session.identity.traits.email);
    console.log("login success", success.data);
  });

  const googleOidc = useComputed$(() => {
    if (!loginFlow.value) return null;
    const nodes = loginFlow.value.ui.nodes;
    const oidcNodes = nodes.filter((node) => node.group === "oidc");
    const findGoogle = oidcNodes.find(
      (node) => (node.attributes as unknown as NodeAttribute).value === "google"
    );
    if (!findGoogle) return null;
    return {
      ...findGoogle,
      attributes: findGoogle.attributes as unknown as NodeAttribute,
    };
  });

  const totpNodes = useComputed$(() => {
    if (!loginFlow.value) return null;
    const originalNodes = loginFlow.value.ui.nodes;
    const nodes = originalNodes.filter((v) => v.group === "totp");
    return nodes;
  });

  const authenticatorCode = useSignal("");

  const onClickUseAuthenticator = $(async () => {
    if (!flowId) return;
    if (authenticatorCode.value === "") {
      alert("code is missing");
      return;
    }
    const body: UpdateLoginFlowWithTotpMethod = {
      csrf_token: csrf.value,
      method: "totp",
      totp_code: authenticatorCode.value,
    };

    const success = await ory.updateLoginFlow({
      flow: flowId,
      updateLoginFlowBody: body,
    });

    alert("use authenticatorCode success");
    console.log("success", success.data);
  });

  return (
    <div>
      <label>email</label>
      <input type="email" bind:value={email} />
      <label>password</label>
      <input bind:value={password} />
      <button onClick$={onClickLogin}>Login</button>
      {loginFlow.value && (
        <form method="POST" action={loginFlow.value.ui.action}>
          {googleOidc.value && <input {...googleOidc.value.attributes} />}
        </form>
      )}
      {loginFlow.value && totpNodes.value && (
        <div>
          <label>Authenticator code</label>
          <input bind:value={authenticatorCode} />
          <button onClick$={onClickUseAuthenticator}>use authenticator</button>
        </div>
      )}
    </div>
  );
});
