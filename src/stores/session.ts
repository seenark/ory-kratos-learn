import type { Signal } from "@builder.io/qwik";
import { createContextId } from "@builder.io/qwik";
import type { Session } from "@ory/client";

export const SessionContext = createContextId<Signal<Session>>("session");

export const logoutUrlContext = createContextId<Signal<string>>("logouturl");
