import { BufferMemory } from "langchain/memory/index";
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { XataChatMessageHistory } from "@langchain/community/stores/message/xata";
import { BaseClient } from "@xata.io/client";

// if you use the generated client, you don't need this function.
// Just import getXataClient from the generated xata.ts instead.
const getXataClient = () => {
  if (!process.env.XATA_API_KEY) {
    throw new Error("XATA_API_KEY not set");
  }

  if (!process.env.XATA_DB_URL) {
    throw new Error("XATA_DB_URL not set");
  }
  const xata = new BaseClient({
    databaseURL: process.env.XATA_DB_URL,
    apiKey: process.env.XATA_API_KEY,
    branch: process.env.XATA_BRANCH || "main",
  });
  return xata;
};

const memory = new BufferMemory({
  chatHistory: new XataChatMessageHistory({
    table: "messages",
    sessionId: new Date().toISOString(), // Or some other unique identifier for the conversation
    client: getXataClient(),
    apiKey: process.env.XATA_API_KEY, // The API key is needed for creating the table.
  }),
});

const model = new ChatOpenAI();
const chain = new ConversationChain({ llm: model, memory });

const res1 = await chain.invoke({ input: "Hi! I'm Jim." });
console.log({ res1 });
/*
{
  res1: {
    text: "Hello Jim! It's nice to meet you. My name is AI. How may I assist you today?"
  }
}
*/

const res2 = await chain.invoke({ input: "What did I just say my name was?" });
console.log({ res2 });

/*
{
  res1: {
    text: "You said your name was Jim."
  }
}
*/
