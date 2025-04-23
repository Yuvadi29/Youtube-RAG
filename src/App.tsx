import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createSupabaseClient } from "./api/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const App = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Generate ids for conversation and video
      const convId = uuidv4();
      const docId = uuidv4();

      // Generate conversation
      const supabase = createSupabaseClient();
      await supabase.from("conversations").insert({
        id: convId,
      });

      // Generate document id
      await supabase.from("documents").insert({
        id: docId,
      });

      // Link conversation and document
      await supabase.from("conversation_documents").insert({
        conversation_id: convId,
        document_id: docId
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center text-white">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-400">
          AI Chat with YouTube
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Drop a YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white cursor-pointer ${
              loading
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-500 hover:bg-indigo-600"
            }`}
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </form>
        {loading && (
          <div className="mt-4 flex justify-center">
            <div className="loading-spinner border-t-4 border-indigo-500 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;