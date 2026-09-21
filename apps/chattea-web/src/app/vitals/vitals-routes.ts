import type { FastifyInstance } from "fastify";

import { VITALS_PATH } from "@/shared/config/constants";

import type { VitalsStore } from "./vitals-store";

export const registerVitalsRoutes = (app: FastifyInstance, store: VitalsStore) => {
  app.post(VITALS_PATH, async (request) => {
    store.record(request.body);
    return { accepted: true };
  });

  app.get(VITALS_PATH, async () => store.summarize());
};
