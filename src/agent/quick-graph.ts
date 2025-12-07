import { END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { Nodes } from "../enums/nodes.enum";
import { llmNode } from "./nodes/llm-node";

export const QuickGraphStateSchema = z.object({
  user_text: z.string(),
  user_prompt: z.string(),
  response: z.string().optional(),
});

export type QuickGraphState = z.infer<typeof QuickGraphStateSchema>;

export const quickGraph = new StateGraph(QuickGraphStateSchema)
  .addNode(Nodes.Llm, llmNode)
  // connect nodes
  .addEdge(START, Nodes.Llm)
  .addEdge(Nodes.Llm, END)
  .compile();
