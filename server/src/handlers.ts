import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import type { QueryRequestDto, QueryResponseDto } from '../../shared/dto/query.dto';
import { Mode } from '../../shared/enums/mode.enum';
import { detailedGraph } from './agent/detailed-graph';
import { quickGraph } from './agent/quick-graph';
import config from './config';
import { withTracing } from './utils/tracing-helper';

const queryHandler = async (requestDto: QueryRequestDto): Promise<QueryResponseDto> => {
  const vectorStore = new MemoryVectorStore(
    new GoogleGenerativeAIEmbeddings({
      apiKey: config.googleApiKey,
      modelName: 'gemini-embedding-001',
    })
  );

  const initialState = {
    user_text: requestDto.userText,
    user_prompt: requestDto.userPrompt,
  };

  let result: any;
  if (requestDto.mode == Mode.Quick) {
    const runQuickGraph = withTracing('graph.quick', (state) => quickGraph.invoke(state));
    result = await runQuickGraph(initialState);
  } else {
    const runDetailedGraph = withTracing('graph.detailed', (state, vectorStore) =>
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
