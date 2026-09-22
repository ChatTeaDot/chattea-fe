import type { FastifyInstance } from "fastify";

import { API_GRAPHQL_PATH } from "@/shared/config/constants";

import { graphqlEndpoint } from "./graphql-upstream";

export const registerGraphqlProxy = (app: FastifyInstance) => {
  app.post(API_GRAPHQL_PATH, async (request, reply) => {
    const authorization = request.headers.authorization;
    let response: Response;
    try {
      response = await fetch(graphqlEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(typeof authorization === "string" ? { authorization } : {}),
        },
        body: JSON.stringify(request.body ?? {}),
      });
    } catch {
      return reply.code(502).send({ errors: [{ message: "GRAPHQL_UPSTREAM_UNAVAILABLE" }] });
    }
    const payload = await response.text();
    return reply.code(response.status).type("application/json").send(payload);
  });
};
