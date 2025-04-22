import { createSupabaseClient } from '../helpers/supabaseClient';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function storeDocument (req) {
  try {
    // Init Supabase client
    const supabase = createSupabaseClient();

    // Initialise the embeddings
    const ai = new GoogleGenerativeAI({apiKey: process.env.GEMINI_API_KEY});

    const model = await ai.getGenerativeModel({
        model: "gemini-embedding-001",
    });

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
