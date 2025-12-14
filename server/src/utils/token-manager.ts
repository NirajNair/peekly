import { get_encoding, Tiktoken, TiktokenEncoding } from 'tiktoken';
import { getLLMSystemMessage } from '../agent/prompts/prompt-builder';
import config from '../config';
import { logger } from './logger';

class TokenManager {
  private encoder: Tiktoken;
  public systemPromptTokens: number | null = null;

  constructor() {
    this.encoder = get_encoding(config.llmTokenEncoder as TiktokenEncoding);
  }

  countTokens(text: string): number {
    try {
      return this.encoder.encode(text).length;
    } catch (error) {
      // Fallback: 1 token = 4 chars
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        'Token counting failed, falling back to 4 char per token assumption'
      );
      return Math.ceil(text.length / 4);
    }
  }

  truncateDocs(docs: Array<{ pageContent: string }>, maxTokens: number): string {
    let result = '';
    let tokens = 0;

    const separator = '\n\n---\n\n';
    const separatorTokens = this.countTokens(separator);

    for (const doc of docs) {
      const docTokens = this.countTokens(doc.pageContent);

      if (tokens + docTokens + separatorTokens <= maxTokens) {
        result += doc.pageContent + separator;
        tokens += docTokens + separatorTokens;
      } else {
        break;
      }
    }

    return result;
  }

  calculateContextBudget(): number {
    const OUTPUT_BUFFER = 2048;
    return Math.max(
      0,
      config.llmContextWindow - OUTPUT_BUFFER - tokenManager.getSystemPromptTokens()
    );
  }

  getSystemPromptTokens(): number {
    if (this.systemPromptTokens === null) {
      this.systemPromptTokens = this.countTokens(getLLMSystemMessage().content as string);
    }
    return this.systemPromptTokens;
  }
}

export const tokenManager = new TokenManager();
