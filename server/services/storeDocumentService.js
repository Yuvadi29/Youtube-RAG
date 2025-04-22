import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { createSupabaseClient } from '../helpers/supabaseClient.js'
import { TaskType } from '@google/generative-ai'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube'

export async function storeDocument (req) {
  try {
    if (!req?.body?.url) {
      throw new Error('URL is required in the request body');
    }
    const { url } = req.body;
    // Init Supabase client
    const supabase = createSupabaseClient()

    // Initialise the embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'gemini-embedding-001',
      taskType: TaskType.RETRIEVAL_DOCUMENT,
      title: 'Youtube Rag'
    })

    // Initialise the vector store
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'embedded_documents',
      queryName: 'match_documents'
    })

    // Getting youtube video
    const loader = await YoutubeLoader.createFromUrl(url, {
      addVideoInfo: true
    })

    const docs = await loader.load();

    console.log("Youtube Video Data: ", docs);
  } catch (error) {
    console.error(error)
  }

  return {
    ok: true,
  }
}
