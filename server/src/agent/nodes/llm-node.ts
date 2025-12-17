import { InternalServerError } from 'elysia';
import { Nodes } from '../../../../shared/enums/nodes.enum';
import { circuitBreaker } from '../../utils/circuit-breaker';
import { logger } from '../../utils/logger';
import { retryWithDelay } from '../../utils/retry';
import type { DetailedGraphState } from '../detailed-graph';
import { buildLLMMessages } from '../prompts/prompt-builder';
import type { QuickGraphState } from '../quick-graph';
import { llm } from '../tools/llm';

export const llmNode = async (state: DetailedGraphState | QuickGraphState) => {
  if (circuitBreaker.shouldSkip(Nodes.LLM)) {
    throw new InternalServerError('Uh-oh! Something went wrong on our end. Please try again soon.');
  }

  try {
    const response = await retryWithDelay(() => llm.invoke(buildLLMMessages(state)), {
      maxRetries: 3,
      delayMs: 1000,
      operationName: 'LLM',
    });

    logger.info('LLM generation successful');
    return { response: response.content };
  } catch (error: any) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      'LLM generation failed after retries'
    );
    throw new InternalServerError('Uh-oh! Something went wrong on our end. Please try again soon.');
  }
};
