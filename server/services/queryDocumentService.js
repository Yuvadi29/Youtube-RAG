import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { createSupabaseClient } from '../helpers/supabaseClient.js'
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings
} from '@langchain/google-genai'
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts'
// import { createHistoryAwareRetriever } from '@langchain/core/retrievers'
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { createRetrievalChain } from "langchain/chains/retrieval";
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { Readable } from 'stream'

export async function queryDocument (req) {
  try {
    const { conversationId, query, documentIds } = req.body
    const supabase = createSupabaseClient()

    // Store user quey
    await supabase.from('conversation_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: query
    })

    // Grab conversation history
    const { data: previousMessages } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(14)

    // Initialise embedding models and LLM
    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: 'embedding-001', // ✅ Safe default
      apiKey: process.env.GEMINI_API_KEY
    })

    const llm = new ChatGoogleGenerativeAI({
      model: 'gemini-2.0-flash',
      apiKey: process.env.GEMINI_API_KEY,
      streamUsage: true
    })

    // Initialise the vector store
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'embedded_documents',
      queryName: 'match_documents',
      filter: {
        document_ids: documentIds
      }
    })

    // Change the prompt based on query and documents
    const contextSystemPrompt =
      'Given a chat history and latest user question ' +
      'which might reference context in the chat history ' +
      'formulate a standalone question which can be understood ' +
      'without the chat history. DO NO answer the question, ' +
      'just reformulate it if needed and otherwise return it as is.'

    // A set of instrucions how to rewrite the question
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', contextSystemPrompt],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}']
    ])

    // Retrieve the documents
    const retriever = vectorStore.asRetriever()
    const historyRetriver = createHistoryAwareRetriever({
      llm,
      retriever,
      rephrasePrompt: prompt
    })

    // Pass relevant documents to llm
    const systemPrompt =
      'You are an assistant for question answering tasks. ' +
      'Use the following pieces of retrived context to answer ' +
      'the question. ' +
      '\n\n' +
      '{context}'

    const qaPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}']
    ])

    const qAChain = await createStuffDocumentsChain({
      llm,
      prompt: qaPrompt
    })

    const ragChain = await createRetrievalChain({
      retriever: historyRetriver,
      combineDocsChain: qAChain
    })

    const history = (previousMessages || []).map(msg => {
      return msg.role === 'user'
        ? new HumanMessage(msg.content)
        : new AIMessage(msg.content)
    })

    const response = ragChain.stream({
      input: query,
      chat_history: history
    })

    const responseStream = new Readable({
      async read () {
        for await (const chunkk of response) {
          if (chunkk.answer) {
            console.log(answer)
            this.push(`data: ${JSON.stringify({ content: chunkk.answer })}\n\n`)
          }
        }
        this.push(null)
      }
    })

    return responseStream
  } catch (error) {
    console.error('❌ queryDocument Error:', error.message)
    throw error
  }
}
