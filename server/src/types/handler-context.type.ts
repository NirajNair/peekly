import type { Context } from "elysia";

export type HandlerContext<TBody = unknown> = Context & {
  body: TBody;
};
