"use client"

import { useState, useRef } from "react"

export default function Home() {

    const [file, setFile] = useState(null)
    const [question, setQuestion] = useState("")
    const [history, setHistory] = useState([])
    const [uploadState, setUploadState] = useState("idle") // idle | uploading | ready | error
    const [asking, setAsking] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const inputRef = useRef(null)
    const [url, setUrl] = useState("http://localhost:9000")

    const mood = asking ? "thinking" : uploadState

    function pickFile(f) {
        if (!f) return
        setFile(f)
        setUploadState("idle")
    }

    async function upload() {
        if (!file) return
        setUploadState("uploading")

        const data = new FormData()
        data.append("file", file)

        try {
            const res = await fetch(`${url}/upload`, {
                method: "POST",
                body: data
            })
            if (!res.ok) throw new Error("Upload failed")
            setUploadState("ready")
        } catch (err) {
            setUploadState("error")
        }
    }

    async function ask() {
        const q = question.trim()
        if (!q || asking) return

        setAsking(true)
        setQuestion("")
        const entryId = Date.now()
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        setHistory((h) => [...h, { id: entryId, q, a: null, time, error: false }])

        try {
            const res = await fetch(`${url}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q })
            })
            if (!res.ok) throw new Error("Chat failed")
            const result = await res.json()

            setHistory((h) =>
                h.map((entry) => (entry.id === entryId ? { ...entry, a: result.answer } : entry))
            )
        } catch (err) {
            setHistory((h) =>
                h.map((entry) =>
                    entry.id === entryId
                        ? { ...entry, a: "Hmm, couldn't reach the server. Is it running?", error: true }
                        : entry
                )
            )
        } finally {
            setAsking(false)
        }
    }

    function resetDocument() {
        setFile(null)
        setUploadState("idle")
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") ask()
    }

    function handleDrop(e) {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) pickFile(f)
    }

    return (
        <div className="pb-root">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');

                * { box-sizing: border-box; }

                .pb-root {
                    min-height: 100vh;
                    background: #FFF6E9;
                    background-image:
                        radial-gradient(circle at 12% 20%, #FFE2A8 0%, transparent 40%),
                        radial-gradient(circle at 88% 10%, #C9F5EC 0%, transparent 38%),
                        radial-gradient(circle at 90% 85%, #FFD3DC 0%, transparent 40%);
                    font-family: 'Nunito', sans-serif;
                    color: #1A1A2E;
                    padding: 48px 20px 72px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .pb-shell { width: 100%; max-width: 980px; }

                .pb-header {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 40px;
                    flex-wrap: wrap;
                }

                .pb-mascot-box { flex-shrink: 0; }

                .pb-mascot-body { transition: fill 0.5s ease; }

                @keyframes pb-bob {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                .pb-mascot-anim { animation: pb-bob 2.6s ease-in-out infinite; }

                @keyframes pb-blink-dot {
                    0%, 100% { opacity: 0.3; transform: translateY(0); }
                    50% { opacity: 1; transform: translateY(-3px); }
                }
                .pb-tdot { animation: pb-blink-dot 1s ease-in-out infinite; }
                .pb-tdot:nth-child(2) { animation-delay: 0.15s; }
                .pb-tdot:nth-child(3) { animation-delay: 0.3s; }

                .pb-title {
                    font-family: 'Baloo 2', sans-serif;
                    font-weight: 800;
                    font-size: 40px;
                    margin: 0 0 6px;
                    color: #1A1A2E;
                }

                .pb-sub {
                    font-size: 16px;
                    font-weight: 600;
                    color: #5B5673;
                    margin: 0;
                    max-width: 42ch;
                }

                .pb-grid {
                    display: grid;
                    grid-template-columns: 0.9fr 1.1fr;
                    gap: 24px;
                    align-items: start;
                }

                .pb-grid-single {
                    grid-template-columns: minmax(0, 460px);
                    justify-content: center;
                }

                .pb-grid-chat {
                    grid-template-columns: minmax(0, 1fr);
                }

                .pb-chat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                    gap: 12px;
                }

                .pb-reupload-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 14px;
                    border: 3px solid #1A1A2E;
                    border-radius: 12px;
                    background: #C9F5EC;
                    color: #0D3B34;
                    font-family: 'Baloo 2', sans-serif;
                    font-weight: 700;
                    font-size: 13px;
                    cursor: pointer;
                    box-shadow: 3px 3px 0 #1A1A2E;
                    transition: transform 0.08s ease, box-shadow 0.08s ease;
                    flex-shrink: 0;
                }

                .pb-reupload-btn:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 #1A1A2E; }
                .pb-reupload-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 #1A1A2E; }
                .pb-reupload-btn:focus-visible { outline: 3px solid #6C5CE7; outline-offset: 2px; }

                @media (max-width: 760px) {
                    .pb-grid { grid-template-columns: 1fr; }
                    .pb-title { font-size: 30px; }
                }

                .pb-card {
                    background: #FFFFFF;
                    border: 3px solid #1A1A2E;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 6px 6px 0 #1A1A2E;
                }

                .pb-card-label {
                    font-family: 'Baloo 2', sans-serif;
                    font-weight: 700;
                    font-size: 15px;
                    color: #6C5CE7;
                    margin: 0 0 14px;
                }

                .pb-drop {
                    border: 3px dashed #C7C2E0;
                    border-radius: 18px;
                    padding: 30px 14px;
                    text-align: center;
                    cursor: pointer;
                    transition: border-color 0.2s ease, background 0.2s ease;
                }

                .pb-drop:hover, .pb-drop:focus-visible { border-color: #6C5CE7; background: #F6F4FF; }
                .pb-drop-active { border-color: #6C5CE7; background: #F0EEFF; }

                .pb-drop-icon { font-size: 30px; margin-bottom: 8px; }
                .pb-filename { font-family: 'Space Mono', monospace; font-size: 13px; font-weight: 700; word-break: break-all; }
                .pb-hint { font-size: 13px; font-weight: 600; color: #8A85A3; margin: 4px 0 0; }

                .pb-btn {
                    width: 100%;
                    margin-top: 16px;
                    padding: 13px 16px;
                    border: 3px solid #1A1A2E;
                    border-radius: 14px;
                    background: #FFD23F;
                    color: #1A1A2E;
                    font-family: 'Baloo 2', sans-serif;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    box-shadow: 4px 4px 0 #1A1A2E;
                    transition: transform 0.08s ease, box-shadow 0.08s ease;
                }

                .pb-btn:hover:not(:disabled) { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 #1A1A2E; }
                .pb-btn:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #1A1A2E; }
                .pb-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: 4px 4px 0 #1A1A2E; }

                .pb-btn:focus-visible, .pb-drop:focus-visible, .pb-input:focus-visible, .pb-ask-btn:focus-visible {
                    outline: 3px solid #00C2A8;
                    outline-offset: 2px;
                }

                .pb-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 14px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #5B5673;
                }

                .pb-dot { width: 9px; height: 9px; border-radius: 50%; background: #C7C2E0; flex-shrink: 0; }
                .pb-dot-ready { background: #00C2A8; }
                .pb-dot-error { background: #FF6B6B; }

                .pb-chat-card {
                    background: #FFFFFF;
                    border: 3px solid #1A1A2E;
                    border-radius: 24px;
                    padding: 20px;
                    box-shadow: 6px 6px 0 #1A1A2E;
                    display: flex;
                    flex-direction: column;
                    min-height: 440px;
                }

                .pb-bubbles {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    overflow-y: auto;
                    max-height: 420px;
                    padding: 4px 4px 8px;
                }

                .pb-empty {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    font-weight: 700;
                    color: #ADA8C4;
                    padding: 30px 20px;
                }

                .pb-row { display: flex; }
                .pb-row-user { justify-content: flex-end; }
                .pb-row-bot { justify-content: flex-start; }

                .pb-bubble {
                    max-width: 78%;
                    padding: 10px 16px;
                    border: 3px solid #1A1A2E;
                    font-size: 14.5px;
                    font-weight: 600;
                    line-height: 1.5;
                }

                .pb-bubble-user {
                    background: #FF6B6B;
                    color: #3D0C0C;
                    border-radius: 18px 18px 4px 18px;
                    box-shadow: 3px 3px 0 #1A1A2E;
                }

                .pb-bubble-bot {
                    background: #C9F5EC;
                    color: #0D3B34;
                    border-radius: 18px 18px 18px 4px;
                    box-shadow: 3px 3px 0 #1A1A2E;
                }

                .pb-bubble-bot-error { background: #FFE1E1; color: #7A1F1F; }

                .pb-time {
                    display: block;
                    font-family: 'Space Mono', monospace;
                    font-size: 10px;
                    font-weight: 400;
                    margin-top: 6px;
                    opacity: 0.6;
                }

                .pb-thinking { display: inline-flex; gap: 4px; }
                .pb-tdot { width: 6px; height: 6px; border-radius: 50%; background: #0D3B34; display: inline-block; }

                .pb-ask-row {
                    display: flex;
                    gap: 10px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 3px solid #F0EEFF;
                }

                .pb-input {
                    flex: 1;
                    background: #FBFAFF;
                    border: 3px solid #1A1A2E;
                    border-radius: 14px;
                    padding: 11px 16px;
                    color: #1A1A2E;
                    font-family: 'Nunito', sans-serif;
                    font-weight: 600;
                    font-size: 14.5px;
                }

                .pb-input::placeholder { color: #ADA8C4; font-weight: 600; }
                .pb-input:focus { outline: none; }

                .pb-ask-btn {
                    padding: 0 22px;
                    border: 3px solid #1A1A2E;
                    border-radius: 14px;
                    background: #6C5CE7;
                    color: #fff;
                    font-family: 'Baloo 2', sans-serif;
                    font-weight: 700;
                    font-size: 14.5px;
                    cursor: pointer;
                    box-shadow: 4px 4px 0 #1A1A2E;
                    transition: transform 0.08s ease, box-shadow 0.08s ease;
                }

                .pb-ask-btn:hover:not(:disabled) { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 #1A1A2E; }
                .pb-ask-btn:active:not(:disabled) { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #1A1A2E; }
                .pb-ask-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                @media (prefers-reduced-motion: reduce) {
                    .pb-mascot-anim { animation: none !important; }
                    .pb-tdot { animation: none !important; opacity: 0.7; }
                }
            `}</style>

            <div className="pb-shell">
                <div className="pb-header">
                    <div className="pb-mascot-box">
                        <Mascot mood={mood} />
                    </div>
                    <div>
                        <h1 className="pb-title">Notebooks Docs !</h1>
                        <p className="pb-sub">Drop in a document and start asking it questions. I'll do the reading.</p>
                    </div>
                </div>

                <div className={`pb-grid ${uploadState === "ready" ? "pb-grid-chat" : "pb-grid-single"}`}>
                    {uploadState !== "ready" && (
                    <div className="pb-card">
                        <p className="pb-card-label">The documents upload like(PDF, docx, text, json)</p>

                        <div
                            className={`pb-drop ${dragOver ? "pb-drop-active" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => inputRef.current?.click()}
                            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <div className="pb-drop-icon">{file ? "📄" : "📥"}</div>
                            {file ? (
                                <p className="pb-filename">{file.name}</p>
                            ) : (
                                <>
                                    <p className="pb-filename">Drop a PDF here</p>
                                    <p className="pb-hint">or tap to browse</p>
                                </>
                            )}
                            <input
                                ref={inputRef}
                                type="file"
                                accept=".pdf, .docx, .txt, .json, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain, application/json"
                                style={{ display: "none" }}
                                onChange={(e) => pickFile(e.target.files?.[0])}
                            />
                        </div>

                        <button className="pb-btn" onClick={upload} disabled={!file || uploadState === "uploading"}>
                            {uploadState === "uploading" ? "Munching..." : "Upload PDF"}
                        </button>

                        <div className="pb-status">
                            <span className={`pb-dot ${uploadState === "ready" ? "pb-dot-ready" : uploadState === "error" ? "pb-dot-error" : ""}`} />
                            {uploadState === "idle" && !file && "Waiting for a snack"}
                            {uploadState === "idle" && file && "Ready when you are"}
                            {uploadState === "uploading" && "Reading it now..."}
                            {uploadState === "ready" && "All read! Ask away."}
                            {uploadState === "error" && "Couldn't reach the server."}
                        </div>
                    </div>
                    )}

                    {uploadState === "ready" && (
                        <div className="pb-chat-card">
                            <div className="pb-chat-header">
                                <p className="pb-card-label" style={{ margin: 0 }}>The document search chat</p>
                                <button className="pb-reupload-btn" onClick={resetDocument}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="17 8 12 3 7 8" />
                                        <line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                    Upload document
                                </button>
                            </div>

                            <div className="pb-bubbles">
                                {history.length === 0 && (
                                    <div className="pb-empty">Ask me something about your document and I'll answer right here.</div>
                                )}

                                {history.map((entry) => (
                                    <div key={entry.id}>
                                        <div className="pb-row pb-row-user">
                                            <div className="pb-bubble pb-bubble-user">
                                                {entry.q}
                                                <span className="pb-time">{entry.time}</span>
                                            </div>
                                        </div>
                                        <div className="pb-row pb-row-bot" style={{ marginTop: 8 }}>
                                            <div className={`pb-bubble pb-bubble-bot ${entry.error ? "pb-bubble-bot-error" : ""}`}>
                                                {entry.a === null ? (
                                                    <span className="pb-thinking"><span className="pb-tdot" /><span className="pb-tdot" /><span className="pb-tdot" /></span>
                                                ) : (
                                                    entry.a
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pb-ask-row">
                                <input
                                    className="pb-input"
                                    placeholder="Ask something..."
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button className="pb-ask-btn" onClick={ask} disabled={asking || !question.trim()}>
                                    {asking ? "..." : "Ask"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Mascot({ mood }) {
    const bodyColor = mood === "error" ? "#FFB4B4" : mood === "ready" ? "#FFD23F" : mood === "thinking" ? "#C9F5EC" : "#E4E1F5"
    const animate = mood === "ready" || mood === "thinking"

    return (
        <svg width="88" height="96" viewBox="0 0 88 96" className={animate ? "pb-mascot-anim" : ""}>
            <path
                d="M12 8 H62 L76 22 V84 A6 6 0 0 1 70 90 H12 A6 6 0 0 1 6 84 V14 A6 6 0 0 1 12 8 Z"
                className="pb-mascot-body"
                fill={bodyColor}
                stroke="#1A1A2E"
                strokeWidth="3.5"
                strokeLinejoin="round"
            />
            <path d="M62 8 V22 H76 Z" fill="#1A1A2E" opacity="0.15" />

            {mood === "error" ? (
                <>
                    <line x1="28" y1="42" x2="38" y2="52" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="38" y1="42" x2="28" y2="52" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="48" y1="42" x2="58" y2="52" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                    <line x1="58" y1="42" x2="48" y2="52" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M30 68 Q41 60 56 68" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                </>
            ) : mood === "thinking" ? (
                <>
                    <circle cx="33" cy="46" r="4" fill="#1A1A2E" />
                    <circle cx="53" cy="46" r="4" fill="#1A1A2E" />
                    <circle cx="60" cy="30" r="3" fill="#1A1A2E" className="pb-tdot" />
                    <circle cx="68" cy="22" r="2" fill="#1A1A2E" className="pb-tdot" />
                    <path d="M32 66 Q43 62 54 66" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                </>
            ) : mood === "ready" ? (
                <>
                    <circle cx="33" cy="46" r="5" fill="#1A1A2E" />
                    <circle cx="53" cy="46" r="5" fill="#1A1A2E" />
                    <circle cx="31" cy="44" r="1.6" fill="#fff" />
                    <circle cx="51" cy="44" r="1.6" fill="#fff" />
                    <path d="M28 64 Q43 78 58 64" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                </>
            ) : (
                <>
                    <path d="M28 46 Q33 42 38 46" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M48 46 Q53 42 58 46" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                    <path d="M33 66 Q43 70 53 66" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
                </>
            )}
        </svg>
    )
}