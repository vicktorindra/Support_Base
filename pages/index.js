import { useState, useRef, useEffect } from "react";
import Head from "next/head";

const SUGGESTIONS = [
  "Cara reset password user di Active Directory",
  "Error ORA-12541 tidak bisa connect ke database",
  "Troubleshooting koneksi VPN gagal",
  "HTTP 502 Bad Gateway cara atasi",
];

function formatMessage(text) {
  const parts = [];
  const codeRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = codeRegex.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", content: text.slice(last, m.index) });
    parts.push({ type: "code", lang: m[1], content: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });
  return parts;
}

function escHtml(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await r.json();
      setMessages([...next, { role: "assistant", content: data.reply || data.error }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "Koneksi error. Coba lagi." }]);
    }
    setLoading(false);
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      <Head>
        <title>IT Support AI</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="root">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div>
              <div className="brand-name">IT Support AI</div>
              <div className="brand-sub">powered by Gemini</div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Knowledge Base</div>
            <div className="kb-hint">
              Tambah atau edit file <code>.txt</code> di folder <code>/knowledge</code> pada repository GitHub. AI otomatis pakai data terbaru setelah deploy.
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Pertanyaan Cepat</div>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="suggestion" onClick={() => send(s)}>{s}</button>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="team-badge">Tim IT Support</div>
            <div className="free-badge">Gemini Flash — Gratis</div>
          </div>
        </aside>

        <main className="chat-area">
          {isEmpty ? (
            <div className="empty">
              <div className="empty-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="empty-title">Halo, ada yang bisa dibantu?</h1>
              <p className="empty-desc">Tanya kode error, cara troubleshooting, atau prosedur IT apapun dari knowledge base tim.</p>
              <div className="empty-chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg msg-${m.role}`}>
                  <div className="msg-avatar">{m.role === "assistant" ? "AI" : "Anda"}</div>
                  <div className={`bubble bubble-${m.role}`}>
                    {formatMessage(m.content).map((part, j) =>
                      part.type === "code" ? (
                        <div key={j} className="code-block">
                          {part.lang && <div className="code-lang">{part.lang}</div>}
                          <pre>{part.content}</pre>
                        </div>
                      ) : (
                        <p key={j} dangerouslySetInnerHTML={{ __html: escHtml(part.content).replace(/\n/g, "<br/>") }} />
                      )
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg msg-assistant">
                  <div className="msg-avatar">AI</div>
                  <div className="bubble bubble-assistant">
                    <div className="typing"><span /><span /><span /></div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="input-bar">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Tanya masalah IT atau kode error..."
              className="input"
            />
            <button onClick={() => send()} disabled={!input.trim() || loading} className="send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </main>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'IBM Plex Sans', sans-serif; background: #0f1117; color: #e2e8f0; height: 100vh; overflow: hidden; }
      `}</style>

      <style jsx>{`
        .root { display: flex; height: 100vh; }

        .sidebar { width: 260px; flex-shrink: 0; background: #0a0c12; border-right: 1px solid #1e2330; display: flex; flex-direction: column; padding: 20px 16px; gap: 24px; overflow-y: auto; }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-icon { width: 36px; height: 36px; background: #1a3a2a; border: 1px solid #2a6a4a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #4ade80; flex-shrink: 0; }
        .brand-name { font-size: 14px; font-weight: 600; color: #f1f5f9; letter-spacing: 0.02em; }
        .brand-sub { font-size: 10px; color: #64748b; font-family: 'IBM Plex Mono', monospace; }

        .sidebar-section { display: flex; flex-direction: column; gap: 8px; }
        .sidebar-label { font-size: 10px; font-weight: 600; color: #475569; letter-spacing: 0.1em; text-transform: uppercase; font-family: 'IBM Plex Mono', monospace; padding-bottom: 4px; border-bottom: 1px solid #1e2330; }

        .kb-hint { font-size: 12px; color: #64748b; line-height: 1.6; }
        .kb-hint code { background: #1e2330; padding: 1px 5px; border-radius: 3px; font-family: 'IBM Plex Mono', monospace; color: #94a3b8; }

        .suggestion { background: none; border: 1px solid #1e2330; border-radius: 6px; padding: 8px 10px; font-size: 12px; color: #94a3b8; cursor: pointer; text-align: left; line-height: 1.4; transition: all 0.15s; font-family: 'IBM Plex Sans', sans-serif; }
        .suggestion:hover { background: #1e2330; color: #e2e8f0; border-color: #2d3748; }

        .sidebar-footer { margin-top: auto; display: flex; flex-direction: column; gap: 6px; }
        .team-badge { font-size: 11px; color: #475569; font-family: 'IBM Plex Mono', monospace; border: 1px solid #1e2330; border-radius: 4px; padding: 6px 10px; text-align: center; }
        .free-badge { font-size: 11px; color: #4ade80; font-family: 'IBM Plex Mono', monospace; border: 1px solid #2a4a2a; border-radius: 4px; padding: 6px 10px; text-align: center; background: #0f1f0f; }

        .chat-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        .empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 24px; gap: 16px; }
        .empty-icon { width: 60px; height: 60px; background: #1a3a2a; border: 1px solid #2a6a4a; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #4ade80; }
        .empty-title { font-size: 22px; font-weight: 600; color: #f1f5f9; }
        .empty-desc { font-size: 14px; color: #64748b; text-align: center; max-width: 400px; line-height: 1.6; }
        .empty-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 500px; margin-top: 8px; }
        .chip { background: #0a0c12; border: 1px solid #1e2330; border-radius: 20px; padding: 8px 14px; font-size: 12px; color: #94a3b8; cursor: pointer; transition: all 0.15s; font-family: 'IBM Plex Sans', sans-serif; }
        .chip:hover { background: #1e2330; color: #e2e8f0; }

        .messages { flex: 1; overflow-y: auto; padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; }
        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-track { background: transparent; }
        .messages::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 2px; }

        .msg { display: flex; gap: 12px; align-items: flex-start; max-width: 800px; margin: 0 auto; width: 100%; }
        .msg-user { flex-direction: row-reverse; }
        .msg-avatar { width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; flex-shrink: 0; font-family: 'IBM Plex Mono', monospace; }
        .msg-assistant .msg-avatar { background: #1a3a2a; border: 1px solid #2a6a4a; color: #4ade80; }
        .msg-user .msg-avatar { background: #1a2a3a; border: 1px solid #2a4a6a; color: #60a5fa; }

        .bubble { padding: 12px 16px; border-radius: 8px; font-size: 14px; line-height: 1.7; max-width: calc(100% - 42px); }
        .bubble p { margin: 0; }
        .bubble p + p { margin-top: 8px; }
        .bubble-assistant { background: #0f1623; border: 1px solid #1e2330; color: #e2e8f0; border-radius: 4px 8px 8px 8px; }
        .bubble-user { background: #0f1f2f; border: 1px solid #1a3a5a; color: #bfdbfe; border-radius: 8px 4px 8px 8px; }

        .code-block { margin: 12px 0; border-radius: 6px; overflow: hidden; border: 1px solid #1e2330; }
        .code-lang { background: #1e2330; padding: 4px 12px; font-size: 11px; color: #64748b; font-family: 'IBM Plex Mono', monospace; }
        .code-block pre { background: #080a0f; padding: 12px 14px; font-size: 12px; color: #a8d8a8; font-family: 'IBM Plex Mono', monospace; overflow-x: auto; line-height: 1.6; white-space: pre-wrap; }

        .typing { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
        .typing span { width: 7px; height: 7px; border-radius: 50%; background: #475569; animation: blink 1.2s infinite; }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100%{opacity:0.3;transform:scale(0.9)} 40%{opacity:1;transform:scale(1)} }

        .input-bar { padding: 16px 20px; border-top: 1px solid #1e2330; display: flex; gap: 10px; background: #0a0c12; }
        .input { flex: 1; background: #0f1117; border: 1px solid #1e2330; border-radius: 8px; padding: 12px 16px; font-size: 14px; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; outline: none; transition: border-color 0.15s; }
        .input:focus { border-color: #2a6a4a; }
        .input::placeholder { color: #475569; }
        .send { width: 42px; height: 42px; border-radius: 8px; border: 1px solid #2a6a4a; background: #1a3a2a; color: #4ade80; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
        .send:hover { background: #2a5a3a; }
        .send:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>
    </>
  );
}
