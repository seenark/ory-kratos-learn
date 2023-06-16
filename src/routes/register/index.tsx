import {
  component$,
  useComputed$,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import type { RegistrationFlow } from "@ory/client";
import { ory } from "~/ory";

type NodeAttribute = {
  name: string;
  type: string;
  value: string;
  disabled: boolean;
  node_type: string;
};
export default component$(() => {
  const location = useLocation();
  const email = useSignal("a@a.com");
  const password = useSignal("At123At123");
  const flowId = location.url.searchParams.get("flow");
  const csrf = useSignal("");

  const registrationFlow = useSignal<RegistrationFlow | undefined>(undefined);

  useVisibleTask$(async () => {
    // const regisFlow = await ory.createBrowserRegistrationFlow({
    //   afterVerificationReturnTo: "http://localhost:5173/",
    //   returnTo: "http://localhost:5173/",
    // });
    // console.log("flow", regisFlow.data);
    if (!flowId) return;
    const regisFlow = await ory.getRegistrationFlow({
      id: flowId,
    });
    console.log("flow", regisFlow.data);
    registrationFlow.value = regisFlow.data;
    csrf.value = (regisFlow.data.ui.nodes[0].attributes as any).value;
    console.log("csrf", csrf.value);
  });

  const googleOidc = useComputed$(() => {
    if (!registrationFlow.value) return null;
    const nodes = registrationFlow.value.ui.nodes;
    const oidcNodes = nodes.filter((node) => node.group === "oidc");
    const findGoogle = oidcNodes.find(
      (node) => (node.attributes as NodeAttribute).value === "google"
    );
    if (!findGoogle) return null;
    return {
      ...findGoogle,
      attributes: findGoogle.attributes as NodeAttribute,
    };
  });

  // const onClickRegister = $(async () => {
  //   if (!flowId) return;
  //   if (email.value === "" || password.value === "") {
  //     console.log("empty fields");
  //     return;
  //   }
  //   // throw new Error();
  //   const body: UpdateRegistrationFlowWithPasswordMethod = {
  //     csrf_token: csrf.value,
  //     method: "password",
  //     password: password.value,
  //     traits: {
  //       email: email.value,
  //     },
  //   };
  //   const successfulRegis = await ory.updateRegistrationFlow({
  //     flow: flowId,
  //     updateRegistrationFlowBody: body,
  //   });
  //   console.log("successfulRegis", successfulRegis.data);
  // });

  return (
    <div>
      {/* <div>register</div> */}
      {/* <label>email</label> */}
      {/* <input */}
      {/*   type="email" */}
      {/*   name="email" */}
      {/*   value={email.value} */}
      {/*   onChange$={(e) => (email.value = e.target.value)} */}
      {/* /> */}
      {/* <label>password</label> */}
      {/* <input */}
      {/*   name="password" */}
      {/*   value={password.value} */}
      {/*   onChange$={(e) => (password.value = e.target.value)} */}
      {/* /> */}
      {/* <button onClick$={onClickRegister}>register</button> */}
      {registrationFlow.value && (
        <form
          method={registrationFlow.value.ui.method}
          action={registrationFlow.value.ui.action}
          encType="application/x-www-form-urlencoded"
        >
          {registrationFlow.value.ui.nodes.map((node, i) => (
            <div key={i}>
              {Object.keys(node.meta).length > 0 && (
                <label>{(node.meta as any).label.text}</label>
              )}
              {(node.attributes as any).type === "submit" && (
                <label>
                  submit
                  <input hidden {...node.attributes} title="" />
                </label>
              )}
              {(node.attributes as any).type !== "submit" && (
                <input {...node.attributes} title="" />
              )}
            </div>
          ))}
          {registrationFlow.value.ui.messages &&
            registrationFlow.value.ui.messages.map((m, i) => (
              <h2 key={i}>{m.text}</h2>
            ))}
        </form>
      )}
      <br />
      {registrationFlow.value && (
        <form
          method={registrationFlow.value.ui.method}
          action={registrationFlow.value.ui.action}
        >
          {googleOidc.value && <input {...googleOidc.value.attributes} />}
        </form>
      )}
    </div>
  );
});
