import { TavilySearch } from "@langchain/tavily";

const tool = new TavilySearch({
  maxResults: 5,
  topic: "general",
  searchDepth: "basic",
});

export default tool;
