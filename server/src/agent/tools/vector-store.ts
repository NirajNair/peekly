import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import config from '../../config';

export const vectorStore = new MemoryVectorStore(
  new GoogleGenerativeAIEmbeddings({
    apiKey: config.googleApiKey,
    modelName: 'gemini-embedding-001',
  })
);
