// import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
// import { createSupabaseClient } from '../helpers/supabaseClient.js'
// // Removed unused TaskType import
// import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
// import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube'
// import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
// import { v4 as uuidv4 } from 'uuid'

// export async function storeDocument (req) {
//   try {
//     if (!req?.body?.url) {
//       throw new Error('URL is required in the request body')
//     }
//     const { url } = req.body
//     // Init Supabase client
//     const supabase = createSupabaseClient()

//     // Initialise the embeddings
//     const embeddings = new GoogleGenerativeAIEmbeddings({
//       model: 'gemini-embedding-004'
//     })

//     // Initialise the vector store
//     const vectorStore = new SupabaseVectorStore(embeddings, {
//       client: supabase,
//       tableName: 'embedded_documents',
//       queryName: 'match_documents'
//     })

//     // Getting youtube video
//     const loader = await YoutubeLoader.createFromUrl(url, {
//       addVideoInfo: true
//     })

//     const docs = await loader.load()

//     if (docs[0]) {
//       docs[0].pageContent = `Video title: ${docs[0].metadata.title} | Video context: ${docs[0].pageContent}`
//     }

//     // Splitting the docs into smaller chunks
//     const textSplitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 1000,
//       chunkOverlap: 200
//     })

//     const texts = await textSplitter.splitDocuments(docs)

//     // console.log(texts)

//     const documentId = uuidv4();
//     console.log('Generated DocumentID: ', documentId);
    

//     // Adding metadata to the documents
//     const docsWithMetaData = texts?.map((text) => ({
//       ...text,
//       metadata: {
//         ...text.metadata,
//         documentId
//       }
//     }))

//     // Adding documents to the vector store
//     await vectorStore.addDocuments(docsWithMetaData)
//   } catch (error) {
//     console.error(error)
//   }

//   return {
//     ok: true
//   }
// }


import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { createSupabaseClient } from '../helpers/supabaseClient.js'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { v4 as uuidv4 } from 'uuid'

export async function storeDocument(req) {
  try {
    if (!req?.body?.url) {
      throw new Error('URL is required in the request body')
    }

    const { url, documentId } = req.body
    const supabase = createSupabaseClient()

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'embedding-001' // ✅ Safe default
    })

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'embedded_documents',
      queryName: 'match_documents'
    })

    // ✅ Await loader creation
    const loader = await YoutubeLoader.createFromUrl(url, {
      addVideoInfo: true
    })

    const docs = await loader.load()

    if (docs[0]) {
      docs[0].pageContent = `Video title: ${docs[0].metadata.title} | Video context: ${docs[0].pageContent}`
    }

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    })

    const texts = await textSplitter.splitDocuments(docs)

    if (!texts.length || !texts[0].pageContent) {
      throw new Error('Document has no content to embed.')
    }

    const docsWithMetaData = texts.map((text) => ({
      ...text,
      metadata: {
        ...(text.metadata || {}),
        documentId
      }
    }))

    await vectorStore.addDocuments(docsWithMetaData)
  } catch (error) {
    console.error('❌ storeDocument Error:', error.message)
  }

  return {
    ok: true
  }
}
