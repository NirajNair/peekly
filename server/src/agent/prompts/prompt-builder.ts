import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { DetailedGraphState } from '../detailed-graph';
import { QuickGraphState } from '../quick-graph';

export let llmSystemMessage: SystemMessage | null;

export function getLLMSystemMessage() {
  if (!llmSystemMessage) {
    llmSystemMessage = new SystemMessage(
      `
        You are a helpful assistant that can answer questions and provide information.
        You are given text selected by the user and a user's prompt which explains what the user wants you to do with the selected text.
        You are also given a context of external information, if context is not provided then use your own knowledge in the best capacity to answer the user's prompt.
        Your job is to use the selected text and the context to provide the most accurate answer possible.
        When uncertain, state the uncertainty clearly.
        Keep the answer consice and to the point in under 100 words strictly.
      `
    );
  }

  return llmSystemMessage;
}

export function getLLMUserMessage(state: DetailedGraphState | QuickGraphState) {
  return new HumanMessage(
    `User's selected text : ${state.user_text} \n User's prompt : ${
      state.user_prompt
    } \n Context : ${'context' in state && state.context ? state.context : 'No context provided.'}`
  );
}

export function buildLLMMessages(
  state: DetailedGraphState | QuickGraphState
): [SystemMessage, HumanMessage] {
  return [getLLMSystemMessage(), getLLMUserMessage(state)];
}
