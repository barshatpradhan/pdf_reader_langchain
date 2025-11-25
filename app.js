// import { OpenAI } from "langchain/llms/openai";
// import { FaissStore } from "langchain/vectorstores/faiss";
// // import { OpenAIEmbeddings } from "langchain/embeddings/openai";
// // import { OpenAIEmbeddings } from "@langchain/openai";
// // import { loadQAStuffChain, loadQAMapReduceChain } from "langchain/chains";

// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { loadQAStuffChain } from "langchain/chains";


// import express from 'express'
// import http from 'http';
// import { fileURLToPath }  from 'url';
// import path, { dirname } from 'path';

// import * as dotenv from 'dotenv';
// dotenv.config();

// const app = express();
// const port = 3000;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// http.createServer(app).listen(port);
// console.info('listening on port' + port);

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// })

// app.get('/api/health' , async (req, res) =>{
//      res.json({
//         success: true,
//         message: 'Server is healthy'

//      })
// });

// app.get('/ask', async(req, res) => {
//     try {

//         const llmA = new OpenAI({ modelname: "gpt-3.5-turbo"});
//         const chainA = loadQAStuffChain(llmA);
//         const directory =  process.env.DIR;

//         const loadedVectorStore = await FaissStore.load(
//             directory,
//             new OpenAIEmbeddings()
//         );

//          const question = "what is this article about?"; //question goes here. 
//           const result = await loadedVectorStore.similaritySearch(question, 1);
//           const resA = await chainA.call({
//             input_documents: result,
//             question,
//           });
//           // console.log({ resA });
//           res.json({ result: resA }); // Send the response as JSO

//     } catch(error) {
//         console.error(error);
//       res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
//     }
// })

// -------------------- IMPORTS (NEW) --------------------
// import express from "express";
// import http from "http";
// import path, { dirname } from "path";
// import { fileURLToPath } from "url";
// import dotenv from "dotenv";
// dotenv.config();

// // LangChain (NEW IMPORTS)
// import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// // import { LLMChain } from "@langchain/core";
// import { loadQAStuffChain } from "@langchain/community/chains/question_answering/loadStuff";
// // import { loadQAStuffChain } from "langchain/chains";

// import { PromptTemplate } from "@langchain/core/prompts";
// import { RunnableSequence } from "@langchain/core/runnables";


// // -------------------- EXPRESS SETUP --------------------
// const app = express();
// const port = 3000;

// http.createServer(app).listen(port);
// console.log("listening on port " + port);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// // -------------------- HEALTH CHECK --------------------
// app.get("/api/health", async (req, res) => {
//   res.json({
//     success: true,
//     message: "Server is healthy",
//   });
// });

// // -------------------- ASK ENDPOINT --------------------
// app.get("/ask", async (req, res) => {
//   try {
//     const llmA = new ChatOpenAI({
//       model: "gpt-4o-mini",
//       apiKey: process.env.OPENAI_API_KEY,
//     });

//     const chainA = loadQAStuffChain(llmA);

//     const directory = process.env.DIR;

//     const loadedVectorStore = await FaissStore.load(
//       directory,
//       new OpenAIEmbeddings()
//     );

//     const question = "what is this article about?";

//     const similar = await loadedVectorStore.similaritySearch(question, 1);

//     const answer = await chainA.invoke({
//       input_documents: similar,
//       question,
//     });

//     res.json({ result: answer });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // -------------------- DOCUMENT INJECTION --------------------
// export const inject_docs = async () => {
//   const loader = new PDFLoader("10.1.1.83.5248.pdf");
//   const docs = await loader.load();
//   console.log("docs loaded");

//   const splitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });

//   const docsOutput = await splitter.splitDocuments(docs);

//   const vectorStore = await FaissStore.fromDocuments(
//     docsOutput,
//     new OpenAIEmbeddings()
//   );

//   console.log("saving...");

//   const directory = "C:/z-Local-Disk-D/langchain";
//   await vectorStore.save(directory);

//   console.log("saved!");
// };

// inject_docs();



import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

// LangChain (NEW IMPORTS)
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


    // const prompt = new PromptTemplate({
    //   inputVariables: ["context", "question"],
    //   template: "Answer the question based only on the following context:\n\n{context}\n\nQuestion: {question}\nAnswer:",
    // });

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


// -------------------- DOCUMENT INJECTION --------------------
