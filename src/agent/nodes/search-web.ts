import { Document } from "@langchain/core/documents";
import type { DetailedGraphState } from "../detailed-graph";
import tavilySearchTool from "../tools/tavily-search";

export const searchWeb = async (state: DetailedGraphState) => {
  const webSearchResults = await tavilySearchTool.invoke({
    query: `${state.user_text}`,
  });

  const docs: Document[] = webSearchResults.results.map((result: any) => ({
    pageContent: result.content,
    metadata: {
      source: result.url,
      title: result.title,
    },
  }));

  return { docs };
};
