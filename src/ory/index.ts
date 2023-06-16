import { Configuration, FrontendApi } from "@ory/client";

export const oryUrl = "http://localhost:4000";

const configuration = new Configuration({
  basePath: oryUrl,
  baseOptions: {
    withCredentials: true,
  },
});
export const ory = new FrontendApi(configuration);
