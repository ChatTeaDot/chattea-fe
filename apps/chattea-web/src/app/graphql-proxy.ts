import type { FastifyInstance } from "fastify";

import { API_GRAPHQL_PATH, TRACE_FORWARD_HEADERS } from "@/shared/config/constants";

import { graphqlEndpoint } from "./graphql-upstream";

export const registerGraphqlProxy = (app: FastifyInstance) => {
  app.post(API_GRAPHQL_PATH, async (request, reply) => {
    const headers: Record<string, string> = { "content-type": "application/json" };
    for (const name of ["authorization", ...TRACE_FORWARD_HEADERS]) {
      const value = request.headers[name];
      if (typeof value === "string") headers[name] = value;
    }
    let response: Response;
    try {
      response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(request.body ?? {}),
      });
    } catch {
      return reply.code(502).send({ errors: [{ message: "GRAPHQL_UPSTREAM_UNAVAILABLE" }] });
    }
    const payload = await response.text();
    return reply.code(response.status).type("application/json").send(payload);
  });
};
