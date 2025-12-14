import { logger } from '../../utils/logger';
import { tokenManager } from '../../utils/token-manager';
import type { DetailedGraphState } from '../detailed-graph';
import { vectorStore } from '../tools/vector-store';

function prepareContext(
  docs: Array<{ pageContent: string }> | undefined,
  tokenBudget: number
): string {
  if (!docs || docs.length === 0) {
    return '';
  }

  const context = tokenManager.truncateDocs(docs, tokenBudget);
  return context || '';
}

export const retrieve = async (state: DetailedGraphState) => {
  const tokenBudget = tokenManager.calculateContextBudget();

  if (state.embedStoreFailed) {
    logger.info('Using raw docs as context fallback due to embed failure');
    return { context: prepareContext(state.docs, tokenBudget) };
  }

  try {
    const query = `${state.user_text} ${state.user_prompt}`;
    const docs = await vectorStore.similaritySearch(query, 5);

    logger.info(`Retrieved ${docs.length} relevant chunks from vector store`);
    return { context: prepareContext(docs, tokenBudget) };
  } catch (error: any) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      'Retrieval failed, falling back to raw docs'
    );

    logger.info('Using raw docs as context fallback due to vector search failure');
    return { context: prepareContext(state.docs, tokenBudget) };
  }
};
