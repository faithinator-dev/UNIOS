import { useState } from "react";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("Chat Brain");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const askUNIOS = async () => {
    if (!input.trim()) {
      setOutput("Please enter some text.");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const response = await fetch(
        "https://uniosback.vercel.app/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            input,
          }),
        }
      );

      const data = await response.json();

      setOutput(data.message);
    } catch (error) {
      console.log(error);

      setOutput(
        "Unable to connect to the server. Make sure your backend is running on port 3000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1>UNIOS</h1>

        <p className="tagline">
          The Universal AI Operating System
        </p>

        <button
          onClick={() => {
            setPage("Chat Brain");
            setInput("");
            setOutput("");
          }}
        >
          Chat Brain
        </button>

        <button
          onClick={() => {
            setPage("StudyBuddy");
            setInput("");
            setOutput("");
          }}
        >
          StudyBuddy
        </button>

        <button
          onClick={() => {
            setPage("Codex Debugger");
            setInput("");
            setOutput("");
          }}
        >
          Codex Debugger
        </button>

        <button
          onClick={() => {
            setPage("ELI5 Tutor");
            setInput("");
            setOutput("");
          }}
        >
          ELI5 Tutor
        </button>
      </aside>

      {/* Main Content */}
      <main className="main">
        <h2>{page}</h2>

        {/* Dynamic Placeholder */}
        <textarea
          rows="10"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            page === "Chat Brain"
              ? "Plan my week as a developer..."
              : page === "StudyBuddy"
              ? "Paste notes or learning material..."
              : page === "Codex Debugger"
              ? "Paste your code here..."
              : "What is JavaScript?"
          }
        />

        <button
          className="submit-btn"
          onClick={askUNIOS}
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask UNIOS"}
        </button>

        {/* Output */}
        <div className="output">
          <h3>Response</h3>

          {loading ? (
            <p>UNIOS is thinking...</p>
          ) : (
            <pre>{output}</pre>
          )}
        </div>
      </main>
    </div>
  );
}