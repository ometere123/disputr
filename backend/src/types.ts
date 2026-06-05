import type { ApiScope, DbClient } from "@disputr/db";
import type { RuntimeEnv } from "./env.js";

export type WebhookRetryJob = {
  deliveryId: string;
};

export type WorkerBindings = Partial<Record<keyof RuntimeEnv, string>> & {
  WEBHOOK_RETRY_QUEUE?: Queue<WebhookRetryJob>;
};

export type ApiIdentity = {
  id: string;
  userId: string;
  scopes: ApiScope[];
};

export type AppVariables = {
  apiIdentity: ApiIdentity;
  db: DbClient | undefined;
  requestId: string;
  runtimeEnv: RuntimeEnv;
};

export type AppEnv = {
  Bindings: WorkerBindings;
  Variables: AppVariables;
};
