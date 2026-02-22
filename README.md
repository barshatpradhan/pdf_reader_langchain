# PDF Reader with LangChain + FAISS

A small Node.js API that:

1. Loads a local PDF.
2. Splits it into chunks.
3. Embeds the chunks with OpenAI embeddings.
4. Stores/reloads vectors with FAISS.
5. Answers a question using retrieved context and an OpenAI chat model.

## Tech Stack

- Node.js + Express
- LangChain JS
- OpenAI (`gpt-4o-mini` + embeddings)
- FAISS (`faiss-node`)
- PDF loader (`@langchain/community`)

## Project Structure

- `app.js` – Express API, retrieval + LLM response flow.
- `loader.js` – PDF ingestion, chunking, embedding, and FAISS index persistence.
- `buckler-node-js.pdf` – Sample PDF source document.
- `docstore.json` / `faiss.index` – Generated vector store artifacts (if saved locally in project).

## Prerequisites

- Node.js 18+
- An OpenAI API key
- Build tools needed by `faiss-node` on your OS

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the repository root:

```env
OPENAI_API_KEY=your_openai_api_key
DIR=path_to_saved_faiss_directory
```

- `OPENAI_API_KEY`: used by both embedding + chat model calls.
- `DIR`: directory from which `FaissStore.load(...)` reads the saved index.

## Running the App

```bash
node app.js
```

Server runs on:

- `http://localhost:3000`

Endpoints:

- `GET /api/health` → health check
- `GET /ask` → runs retrieval + LLM answer and returns JSON result

Example:

```bash
curl http://localhost:3000/ask
```

## Current Behavior (Important)

The current implementation has a few hardcoded values/behaviors:

- PDF path in `loader.js` is fixed to `buckler-node-js.pdf`.
- Save directory in `loader.js` is hardcoded to `C:/z-Local-Disk-D/langchain`.
- Question in `app.js` is hardcoded to: `"What is this article about?"`
- `inject_docs()` is called at module load in `loader.js` and again in `/ask`.

If you want to run this on another machine, update these paths and consider moving them to environment variables.

## Suggested Improvements

- Make PDF path, save path, chunk size, and overlap configurable via env vars.
- Accept a dynamic user question via query/body instead of using a fixed question.
- Remove duplicate server start (`http.createServer(...).listen(...)` and `app.listen(...)`).
- Avoid re-indexing on every request by indexing once and reusing the vector store.
- Add scripts (`start`, `dev`) and automated tests.

## License

ISC (as defined in `package.json`).
