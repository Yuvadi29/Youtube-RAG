import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Message {
  role: "user" | "assistant"
  content: string
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

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className=' flex justify-center p-6 items-center text-white'>
      <h1 className='text-3xl font-bold'>AI Chat with YouTube</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Drop a Youtube URL Here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button type="submit" disabled={loading} className="btn-submit">{loading ? "Processing..." : "Submit"}</button>
      </form>

      {loading && <div className="loading-spinner">Loading....</div>}
    </div>
  )
}

export default App