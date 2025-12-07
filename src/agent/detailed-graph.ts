import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { Nodes } from "../enums/nodes.enum";
import { embedStore } from "./nodes/embed-store";
import { llmNode } from "./nodes/llm-node";
import { retrieve } from "./nodes/retrieve";
import { searchWeb } from "./nodes/search-web";

export const DetailedGraphStateSchema = z.object({
  user_text: z.string(),
  user_prompt: z.string(),
  docs: z.array(z.custom<Document>()).optional(),
  vector_store: z.instanceof(MemoryVectorStore),
  context: z.string().optional(),
  response: z.string().optional(),
});

export type DetailedGraphState = z.infer<typeof DetailedGraphStateSchema>;

export const detailedGraph = new StateGraph(DetailedGraphStateSchema)
  .addNode(Nodes.SearchWeb, searchWeb)
  .addNode(Nodes.EmbedStore, embedStore)
  .addNode(Nodes.Retrieve, retrieve)
  .addNode(Nodes.Llm, llmNode)

  // connect nodes
  .addEdge(START, Nodes.SearchWeb)
  .addEdge(Nodes.SearchWeb, Nodes.EmbedStore)
  .addEdge(Nodes.EmbedStore, Nodes.Retrieve)
  .addEdge(Nodes.Retrieve, Nodes.Llm)
  .addEdge(Nodes.Llm, END)
  .compile();
