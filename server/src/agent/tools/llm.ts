import { ChatOpenAI } from '@langchain/openai';
import config from '../../config';

export const llm = new ChatOpenAI({
  model: 'openai/gpt-oss-20b:free',
  temperature: 0.8,
  apiKey: config.openRouterApiKey,
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
});
