import type { DetailedGraphState } from "../detailed-graph";
import { vectorStore } from "../tools/vector-store";

export const retrieve = async (state: DetailedGraphState) => {
  const query = `${state.user_text} ${state.user_prompt}`;

  const docs = await vectorStore.similaritySearch(query, 5);
  const context =
    docs.length > 0
      ? docs.map((doc) => doc.pageContent).join("\n\n---\n\n")
      : "No external context found.";
    
  return { context };
};
