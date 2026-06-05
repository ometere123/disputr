import { app } from "./app.js";
import { handleQueue, handleScheduled } from "./worker-events.js";
import type { WorkerBindings } from "./types.js";

export default {
  fetch: app.fetch,
  scheduled: handleScheduled,
  queue: handleQueue
} satisfies ExportedHandler<WorkerBindings>;
