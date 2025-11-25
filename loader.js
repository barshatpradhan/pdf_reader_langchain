// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { FaissStore } from "@langchain/community/vectorstores/faiss";   // <-- missing
import { OpenAIEmbeddings } from "@langchain/openai";      

export const inject_docs = async () => {
  const loader = new PDFLoader("buckler-node-js.pdf", {
    splitPages: true,
    });
  const docs = await loader.load();
  docs.forEach((doc, i) => {
    doc.metadata = { ...doc.metadata, author: "Craig Buckler"}
  })
  console.log("docs loaded");

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docsOutput = await splitter.splitDocuments(docs);

  const vectorStore = await FaissStore.fromDocuments(
    docsOutput,
    new OpenAIEmbeddings()
  );

  console.log("saving...");
  const directory = "C:/z-Local-Disk-D/langchain";
  await vectorStore.save(directory);
  console.log("saved!");
};

inject_docs();

