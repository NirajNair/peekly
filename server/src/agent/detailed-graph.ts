import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { END, START, StateGraph } from '@langchain/langgraph';
import { z } from 'zod';
import { Nodes } from '../enums/nodes.enum';
import { withTracing } from '../utils/tracing-helper';
import { embedStore } from './nodes/embed-store';
import { llmNode } from './nodes/llm-node';
import { retrieve } from './nodes/retrieve';
import { searchWeb } from './nodes/search-web';

export const DetailedGraphStateSchema = z.object({
  user_text: z.string(),
  user_prompt: z.string(),
  docs: z.array(z.custom<Document>()).optional(),
  vector_store: z.instanceof(MemoryVectorStore),
  context: z.string().optional(),
  response: z.string().optional(),
});

export type DetailedGraphState = z.infer<typeof DetailedGraphStateSchema>;

const TracedNodes = {
  SearchWeb: withTracing('node.search_web', searchWeb),
  EmbedStore: withTracing('node.embed_store', embedStore),
  Retrieve: withTracing('node.retrieve', retrieve),
  LLM: withTracing('node.llm', llmNode),
};

export const detailedGraph = new StateGraph(DetailedGraphStateSchema)
  .addNode(Nodes.SearchWeb, TracedNodes.SearchWeb)
  .addNode(Nodes.EmbedStore, TracedNodes.EmbedStore)
  .addNode(Nodes.Retrieve, TracedNodes.Retrieve)
  .addNode(Nodes.Llm, TracedNodes.LLM)

  // connect nodes
  .addEdge(START, Nodes.SearchWeb)
  .addEdge(Nodes.SearchWeb, Nodes.EmbedStore)
  .addEdge(Nodes.EmbedStore, Nodes.Retrieve)
  .addEdge(Nodes.Retrieve, Nodes.Llm)
  .addEdge(Nodes.Llm, END)
  .compile();
