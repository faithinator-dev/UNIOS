import { useEffect, useState } from "react";
import "./index.css";

const tools = [
  {
    name: "Chat Brain",
    icon: "✦",
    description: "Plan, write, and think clearly.",
    placeholder: "Plan my week as a developer...",
  },
  {
    name: "StudyBuddy",
    icon: "◈",
    description: "Turn material into meaningful study.",
    placeholder: "Paste notes or learning material...",
  },
  {
    name: "Codex Debugger",
    icon: "⌘",
    description: "Understand errors and improve code.",
    placeholder: "Paste your code here...",
  },
  {
    name: "ELI5 Tutor",
    icon: "◌",
    description: "Make difficult ideas feel simple.",
    placeholder: "What is JavaScript?",
  },
];

function App() {
  const [view, setView] = useState("landing");
  const [page, setPage] = useState("Chat Brain");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("unios-theme") !== "light",
  );
  const activeTool = tools.find((tool) => tool.name === page) ?? tools[0];

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
    localStorage.setItem("unios-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const openWorkspace = () => setView("workspace");
  const selectTool = (name) => {
    setPage(name);
    setInput("");
    setOutput("");
    setMenuOpen(false);
  };

  const askUNIOS = async () => {
    if (!input.trim()) {
      setOutput("Please enter some text.");
      return;
    }

    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: input,
      },
    ];

    setMessages(updatedMessages);

    setLoading(true);
    setOutput("");

    try {
      const response = await fetch("https://unios.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOutput(data.message);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
        },
      ]);

      setOutput(data.message);

      setInput("");
    } catch (error) {
      console.error(error);

      setOutput("Unable to connect to the UNIOS backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`app-shell ${view === "workspace" ? "is-workspace" : "is-landing"}`}
    >
      <header className="site-header">
        <button
          className="brand"
          onClick={() => setView("landing")}
          aria-label="UNIOS home"
        >
          <span className="brand-mark">
            <img src="/logo.png" alt="" />
          </span>
          <span>UNIOS</span>
        </button>
        <nav aria-label="Primary navigation">
          <a href="#capabilities">Capabilities</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => setDarkMode((value) => !value)}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
          >
            {darkMode ? "☀" : "◐"}
          </button>
          <button className="button button-small" onClick={openWorkspace}>
            Open UNIOS <span aria-hidden="true">→</span>
          </button>
        </div>
      </header>

      {view === "landing" ? (
        <main className="landing page-enter">
          <section className="hero-section" aria-labelledby="hero-title">
            <div className="hero-copy">
              <p className="eyebrow">
                <span aria-hidden="true">✦</span> Your intelligent workspace
              </p>
              <h1 id="hero-title">
                One place to <em>think</em>, create, and grow.
              </h1>
              <p className="hero-text">
                UNIOS brings your planning, learning, and problem-solving into
                one focused AI workspace—so you can spend less time switching
                and more time moving forward.
              </p>
              <div className="hero-actions">
                <button
                  className="button button-primary"
                  onClick={openWorkspace}
                >
                  Start exploring <span aria-hidden="true">→</span>
                </button>
                <a className="text-link" href="#capabilities">
                  See what’s inside <span aria-hidden="true">↓</span>
                </a>
              </div>
              <p className="trust-line">
                <span aria-hidden="true">●</span> Built for curious minds and
                ambitious days
              </p>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="orb orb-one" />
              <div className="orb orb-two" />
              <div className="command-card">
                <div className="card-top">
                  <span className="mini-mark">U</span>
                  <span>Good morning, Alex</span>
                  <span className="status-dot" />
                </div>
                <p>What would you like to make progress on?</p>
                <div className="command-input">
                  <span>Ask anything...</span>
                  <b>↑</b>
                </div>
                <div className="suggestion-row">
                  <span>Plan my day</span>
                  <span>Explain a concept</span>
                </div>
              </div>
              <div className="floating-note note-one">
                ✦ &nbsp; Weekly plan ready
              </div>
              <div className="floating-note note-two">
                ◌ &nbsp; Learning streak: 7 days
              </div>
            </div>
          </section>

          <section
            className="capabilities"
            id="capabilities"
            aria-labelledby="capabilities-title"
          >
            <div className="section-heading">
              <p className="eyebrow">Four ways to move forward</p>
              <h2 id="capabilities-title">A calmer way to get things done.</h2>
            </div>
            <div className="tool-grid">
              {tools.map((tool, index) => (
                <article
                  className="tool-card"
                  key={tool.name}
                  style={{ "--delay": `${index * 90}ms` }}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <button
                    onClick={() => {
                      selectTool(tool.name);
                      openWorkspace();
                    }}
                    aria-label={`Open ${tool.name}`}
                  >
                    Explore <span aria-hidden="true">→</span>
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="how-it-works" id="how-it-works">
            <p className="eyebrow">Designed to feel effortless</p>
            <div>
              <h2>Your best work starts with a single conversation.</h2>
              <p>
                Choose a focused space, share what you’re working on, and let
                UNIOS help you find your next clear step.
              </p>
            </div>
          </section>
        </main>
      ) : (
        <main className="workspace page-enter">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="workspace-navigation"
          >
            {menuOpen ? "Close" : "Tools"} <span aria-hidden="true">☰</span>
          </button>
          <aside
            className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
            id="workspace-navigation"
            aria-label="UNIOS tools"
          >
            <p className="sidebar-label">Your spaces</p>
            {tools.map((tool) => (
              <button
                className={page === tool.name ? "tool-nav active" : "tool-nav"}
                key={tool.name}
                onClick={() => selectTool(tool.name)}
                aria-current={page === tool.name ? "page" : undefined}
              >
                <span>{tool.icon}</span>
                {tool.name}
              </button>
            ))}
            <div className="sidebar-footer">
              <span className="status-dot" /> All systems ready
            </div>
          </aside>
          <section
            className="workspace-content"
            aria-labelledby="workspace-title"
          >
            <div className="workspace-heading">
              <div>
                <p className="eyebrow">{activeTool.description}</p>
                <h1 id="workspace-title">{page}</h1>
              </div>
              <button className="back-link" onClick={() => setView("landing")}>
                ← Back home
              </button>
            </div>
            <div className="prompt-panel">
              <label htmlFor="unios-prompt">What’s on your mind?</label>
              <textarea
                id="unios-prompt"
                rows="9"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={activeTool.placeholder}
                disabled={loading}
              />
              <div className="prompt-footer">
                <span>{input.length} characters</span>
                <button
                  className="button button-primary"
                  onClick={askUNIOS}
                  disabled={loading}
                >
                  {loading ? "Thinking…" : "Ask UNIOS"}{" "}
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
            <section
              className="output"
              aria-live="polite"
              aria-busy={loading}
            >
              <div className="output-heading">
                <h2>Conversation</h2>
              </div>

              {messages.length === 0 ? (
                <p className="output-empty">
                  Start a conversation with UNIOS.
                </p>
              ) : (
                <div className="chat-window">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`message ${message.role === "user"
                          ? "user"
                          : "assistant"
                        }`}
                    >
                      <strong>
                        {message.role === "user"
                          ? "You"
                          : "UNIOS"}
                      </strong>

                      <p>{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        </main>
      )}
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} UNIOS</span>
        <span>One chat. More possibilities.</span>
        <a href="#capabilities">Explore the workspace</a>
      </footer>
    </div>
  );
}

export default App;
