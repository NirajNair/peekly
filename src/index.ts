import { Elysia } from "elysia";
import router from "./router";
import { initTelemetry } from "./telemetry/tracer";

initTelemetry();

const app = new Elysia().use(router).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
