import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();


import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { inject_docs } from "./loader.js";

const app = express();
const port = 3000;

http.createServer(app).listen(port);
console.log("listening on port " + port);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get("/api/health", async (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

app.get("/ask", async (req, res) => {
  try {

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
      configuration: {
        apiKey: process.env.OPENAI_API_KEY,
      },
    });

    const prompt = new PromptTemplate({
  inputVariables: ["context", "question"],
  template: "Answer the question based only on the following context:\n\n{context}\n\nQuestion: {question}",
});


    const chain = RunnableSequence.from([prompt, llm]);

    await inject_docs();
    const directory = process.env.DIR;
    const loadedVectorStore = await FaissStore.load(
      directory,
      new OpenAIEmbeddings()
    );

    const question = "What is this article about?";
    const similar = await loadedVectorStore.similaritySearch(question, 1);


    const context = similar.map(d => d.pageContent).join("\n");

    const answer = await chain.invoke({ context, question });

    console.log(answer.content); 


    res.json({ result: answer.content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

