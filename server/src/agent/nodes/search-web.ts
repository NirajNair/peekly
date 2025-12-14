import { Document } from '@langchain/core/documents';
import { Nodes } from '../../enums/nodes.enum';
import { circuitBreaker } from '../../utils/circuit-breaker';
import { logger } from '../../utils/logger';
import { retryWithDelay } from '../../utils/retry';
import type { DetailedGraphState } from '../detailed-graph';
import tavilySearchTool from '../tools/tavily-search';

export const searchWeb = async (state: DetailedGraphState) => {
  if (circuitBreaker.shouldSkip(Nodes.SearchWeb)) {
    return {
      docs: [],
      webSearchFailed: true,
    };
  }

  try {
    const webSearchResults = await retryWithDelay(
      () =>
        tavilySearchTool.invoke({
          query: `${state.user_text}`,
        }),
      {
        maxRetries: 2,
        delayMs: 500,
        operationName: 'Web Search (Tavily)',
      }
    );

    const docs: Document[] = webSearchResults.results.map((result: any) => ({
      pageContent: result.content,
      metadata: {
        source: result.url,
        title: result.title,
      },
    }));

    logger.info(`Web search successful: ${docs.length} results found`);
    circuitBreaker.recordSuccess(Nodes.SearchWeb);

    return { docs, webSearchFailed: false };
  } catch (error: any) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      'Web search failed after retries, falling back to LLM without context'
    );
    circuitBreaker.recordFailure(Nodes.SearchWeb);

    return {
      docs: [],
      webSearchFailed: true,
    };
  }
};
