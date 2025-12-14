import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Nodes } from '../../enums/nodes.enum';
import { circuitBreaker } from '../../utils/circuit-breaker';
import { logger } from '../../utils/logger';
import { retryWithDelay } from '../../utils/retry';
import type { DetailedGraphState } from '../detailed-graph';
import { vectorStore } from '../tools/vector-store';

export const embedStore = async (state: DetailedGraphState) => {
  if (circuitBreaker.shouldSkip(Nodes.EmbedStore)) {
    return { embedStoreFailed: true };
  }
  
  try {
    if (!state.docs) {
      return {};
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', '! ', '? ', '; ', ', ', ' ', ''],
      lengthFunction: (text: string) => text.length,
    });

    const chunks = await splitter.splitDocuments(state.docs);

    await retryWithDelay(() => vectorStore.addDocuments(chunks), {
      maxRetries: 2,
      delayMs: 300,
      operationName: 'Embed Store (Gemini embedding)',
    });

    logger.info(`Successfully embedded and stored ${chunks.length} chunks`);
    circuitBreaker.recordSuccess(Nodes.EmbedStore);

    return {};
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      'Embed store failed after retries, will use raw docs as fallback'
    );
    circuitBreaker.recordFailure(Nodes.EmbedStore);

    return { embedStoreFailed: true };
  }
};
