import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { DetailedGraphState } from "../detailed-graph";
import type { QuickGraphState } from "../quick-graph";
import { llm } from "../tools/llm";

export const llmNode = async (state: DetailedGraphState | QuickGraphState) => {
  const response = await llm.invoke([
    new SystemMessage(`
        You are a helpful assistant that can answer questions and provide information.
        You are given text selected by the user and a user's prompt which explains what the user wants you to do with the selected text.
        You are also given a context of external information, if context is not provided then use your own knowledge in the best capacity to answer the user's prompt.
        Your job is to use the selected text and the context to provide the most accurate answer possible.
        When uncertain, state the uncertainty clearly.
        Keep the answer consice and to the point in under 100 words strictly.
    `),
    new HumanMessage(
      `User's selected text : ${state.user_text} \n User's prompt : ${
        state.user_prompt
      } \n Context : ${
        "context" in state && state.context
          ? state.context
          : "No context provided."
      }`
    ),
  ]);

  return { response: response.content };
};
