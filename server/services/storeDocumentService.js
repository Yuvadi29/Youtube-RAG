import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createSupabaseClient } from '../helpers/supabaseClient';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

export async function storeDocument (req) {
  try {
    // Init Supabase client
    const supabase = createSupabaseClient();

    // Initialise the embeddings
    const ai = new GoogleGenerativeAI({apiKey: process.env.GEMINI_API_KEY});

    const embeddings = new GoogleGenerativeAIEmbeddings({
        model: "gemini-embedding-001",
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Youtube Rag"
    });

    // Initialise the vector store
    const vectorStore = new SupabaseVectorStore(embeddings, {
        client: supabase,
        tableName: "embedded_documents",
        queryName: "match_documents"
    })

  } catch (error) {
    console.error(error)

    return {
      ok: false
    }
  }

  return {
    ok: true
  }
}
