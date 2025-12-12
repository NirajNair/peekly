import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import type { DetailedGraphState } from "../detailed-graph";
import { vectorStore } from "../tools/vector-store";

export const embedStore = async (state: DetailedGraphState) => {
  if (!state.docs) {
    return {};
  }

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
    lengthFunction: (text: string) => text.length,
  });

  const chunks = await splitter.splitDocuments(state.docs);

  await vectorStore.addDocuments(chunks);

  return {};
};
