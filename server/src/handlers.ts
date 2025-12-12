import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { detailedGraph } from "./agent/detailed-graph";
import { quickGraph } from "./agent/quick-graph";
import config from "./config";
import type { QueryRequestDto, QueryResponseDto } from "./dto/query.dto";
import { Mode } from "./enums/mode.enum";
import type { HandlerContext } from "./types/handler-context.type";
import { withTracing } from "./utils/tracing-helper";

const queryHandler = async (
  ctx: HandlerContext<QueryRequestDto>
): Promise<QueryResponseDto> => {
  const queryDto = ctx.body;

  const vectorStore = new MemoryVectorStore(
    new GoogleGenerativeAIEmbeddings({
      apiKey: config.googleApiKey,
      modelName: "gemini-embedding-001",
    })
  );

  const initialState = {
    user_text: queryDto.userText,
    user_prompt: queryDto.userPrompt,
  };

  let result: any;
  if (queryDto.mode == Mode.Quick) {
    const runQuickGraph = withTracing("graph.quick", (state) =>
      quickGraph.invoke(state)
    );
    result = runQuickGraph(initialState);
  } else {
    const runDetailedGraph = withTracing(
      "graph.detailed",
      (state, vectorStore) =>
        detailedGraph.invoke({
          ...state,
          vector_store: vectorStore,
        })
    );
    result = await runDetailedGraph(initialState, vectorStore);
  }

  return {
    response: result.response,
  };
};

export default queryHandler;
