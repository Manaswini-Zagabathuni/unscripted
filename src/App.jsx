import { useState, useEffect, useRef } from "react";

const PROMPTS = [
  "How was your day?",
  "Wanna share a moment?",
  "What made you smile today?",
  "Tell me something that happened...",
  "What's one thing you won't forget about today?",
  "Any little moment worth remembering?",
  "What did today feel like?",
  "Something caught your eye today?",
  "What's your today's story?",
  "Drop your moment here...",
];

const CLAUDE_API_KEY = "YOUR_NEW_KEY_HERE";

function getStorage() {
  try { return JSON.parse(localStorage.getItem("unscripted_data") || "{}"); } catch { return {}; }
}
function setStorage(data) { localStorage.setItem("unscripted_data", JSON.stringify(data)); }
function getUserData(username) {
  const all = getStorage();
  return all[username] || { password: "", entries: [], episodes: [], promptIndex: 0 };
}
function saveUserData(username, data) {
  const all = getStorage(); all[username] = data; setStorage(all);
}
function userExists(username) { return !!getStorage()[username]; }

function FilmGrain() {
  return (
    <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.04, zIndex: 9999 }} xmlns="http://www.w3.org/2000/svg">
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
      <rect width="100%" height="100%" filter="url(#grain)" opacity="1"/>
    </svg>
  );
}

function SprocketHoles() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "36px", height: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center", zIndex: 10, background: "#0a0a0a", borderRight: "1px solid #1a1a1a" }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{ width: "14px", height: "10px", borderRadius: "2px", background: "#1a1a1a", border: "1px solid #2a2a2a" }} />
      ))}
    </div>
  );
}

function Logo({ size = 28 }) {
  return (
    <span style={{ fontFamily: "'Georgia', serif", fontSize: size, fontWeight: 700, color: "#f5f0e8", letterSpacing: "-0.5px" }}>
      Unscripted
    </span>
  );
}

async function generateScenePrompt(entry) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": CLAUDE_API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{
          role: "user",
          content: `Convert this diary entry into two things:
1. A SHORT silent film title card (max 6 words, poetic, old-fashioned style like "A Chance Encounter" or "The Quiet Hour")
2. A detailed image prompt for Pollinations.AI in this style: vintage silent film still, sepia toned, cinematic, film grain, dramatic lighting, illustrated, storybook quality

Entry: "${entry}"

Respond ONLY as JSON: {"title": "...", "imagePrompt": "..."}`
        }]
      })
    });
    const data = await res.json();
    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch {
    return { title: "A Quiet Moment", imagePrompt: `vintage silent film still, sepia toned, cinematic scene of: ${entry}, film grain, dramatic lighting` };
  }
}

function generateImageUrl(prompt) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", vintage silent film, sepia, cinematic, film grain, 1920s style")}&width=640&height=400&nologo=true&seed=${Math.floor(Math.random() * 9999)}`;
}

function SceneCard({ entry, index }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [countdown, setCountdown] = useState(90);
  const [imgSrc, setImgSrc] = useState(entry.imageUrl);
  const timerRef = useRef(null);
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  useEffect(() => {
    if (imgLoaded || imgError) return;
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); setImgError(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [imgLoaded, imgError]);

  const retry = () => {
    setImgError(false);
    setImgLoaded(false);
    setCountdown(60);
    setImgSrc(entry.imageUrl + "&retry=" + Date.now());
  };

  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "4px", overflow: "hidden" }}>
      <div style={{ position: "relative", aspectRatio: "16/10", background: "#111", overflow: "hidden" }}>
        {!imgLoaded && !imgError && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <div style={{ width: 24, height: 24, border: "2px solid #333", borderTop: "2px solid #c9b99a", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <span style={{ fontSize: 12, color: "#666", fontFamily: "Georgia, serif", fontStyle: "italic" }}>developing scene...</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 80, height: 2, background: "#1a1a1a", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ width: `${Math.round(((25 - countdown) / 25) * 100)}%`, height: "100%", background: "#c9b99a", transition: "width 1s linear" }} />
              </div>
              <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>~{countdown}s</span>
            </div>
          </div>
        )}
        {imgError && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#555", fontFamily: "Georgia, serif", fontStyle: "italic" }}>scene timed out</span>
            <button onClick={retry} style={{ background: "none", border: "1px solid #333", color: "#c9b99a", padding: "6px 16px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" }}>Retry</button>
          </div>
        )}
        <img
          src={imgSrc}
          alt={entry.title}
          onLoad={() => { setImgLoaded(true); clearInterval(timerRef.current); }}
          onError={() => { setImgError(true); clearInterval(timerRef.current); }}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.5s", filter: "sepia(0.6) contrast(1.1)" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)", pointerEvents: "none" }} />
        {imgLoaded && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#f5f0e8", margin: 0, fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 8 }}>"{entry.title}"</p>
          </div>
        )}
        <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", padding: "2px 8px", borderRadius: 2 }}>
          <span style={{ fontSize: 10, color: "#c9b99a", fontFamily: "monospace" }}>Scene {index + 1}</span>
        </div>
      </div>
      <div style={{ padding: "10px 14px" }}>
        <p style={{ fontSize: 11, color: "#555", margin: 0, fontFamily: "Georgia, serif" }}>{dateStr}</p>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0", fontStyle: "italic" }}>"{entry.text}"</p>
      </div>
    </div>
  );
}

function EpisodeCard({ episode, onWatch }) {
  return (
    <div style={{ background: "#0d0d0d", border: "1px solid #c9b99a44", borderRadius: "4px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 10, background: "#c9b99a22", color: "#c9b99a", padding: "2px 8px", borderRadius: 2, fontFamily: "monospace" }}>EPISODE {episode.number}</span>
        </div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#f5f0e8", margin: 0 }}>{episode.title}</p>
        <p style={{ fontSize: 12, color: "#555", margin: "4px 0 0" }}>{episode.scenes.length} scenes · {episode.dateRange}</p>
      </div>
      <button onClick={() => onWatch(episode)} style={{ background: "#c9b99a", color: "#0a0a0a", border: "none", borderRadius: 2, padding: "8px 18px", fontSize: 13, fontFamily: "Georgia, serif", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}>
        Watch
      </button>
    </div>
  );
}

function EpisodePlayer({ episode, onClose }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setCurrent(prev => {
          if (prev >= episode.scenes.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, episode.scenes.length]);

  const scene = episode.scenes[current];

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 10 }}>
        <Logo size={20} />
        <button onClick={onClose} style={{ background: "none", border: "1px solid #333", color: "#888", padding: "6px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" }}>Exit</button>
      </div>
      <div style={{ width: "min(90vw, 720px)" }}>
        <div style={{ background: "#111", borderTop: "8px solid #1a1a1a", borderBottom: "8px solid #1a1a1a", position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
          <img src={scene.imageUrl} alt={scene.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "sepia(0.7) contrast(1.15)", animation: "kenburns 3s ease-out" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.85)", padding: "12px 20px", textAlign: "center" }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#f5f0e8", margin: 0, fontStyle: "italic" }}>— {scene.title} —</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", gap: 12 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {episode.scenes.map((_, i) => (
              <div key={i} onClick={() => { setCurrent(i); setPlaying(false); }} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? "#c9b99a" : "#333", cursor: "pointer", transition: "all 0.3s" }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setCurrent(Math.max(0, current - 1)); setPlaying(false); }} style={{ background: "none", border: "1px solid #333", color: "#888", padding: "4px 12px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}>Prev</button>
            <button onClick={() => setPlaying(!playing)} style={{ background: "#c9b99a22", border: "1px solid #c9b99a44", color: "#c9b99a", padding: "4px 16px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" }}>
              {playing ? "Pause" : "Play"}
            </button>
            <button onClick={() => { setCurrent(Math.min(episode.scenes.length - 1, current + 1)); setPlaying(false); }} style={{ background: "none", border: "1px solid #333", color: "#888", padding: "4px 12px", borderRadius: 2, cursor: "pointer", fontSize: 12 }}>Next</button>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#333", fontFamily: "Georgia, serif", marginTop: 8 }}>Episode {episode.number} · {episode.dateRange}</p>
      <style>{`@keyframes kenburns { from { transform: scale(1); } to { transform: scale(1.05); } }`}</style>
    </div>
  );
}

function LandingPage({ onLogin, onSignup }) {
  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", position: "relative", overflow: "hidden" }}>
      <SprocketHoles />
      <FilmGrain />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #0f0f0f 39px, #0f0f0f 40px)", opacity: 0.4 }} />
      <div style={{ position: "relative", textAlign: "center", maxWidth: 520, marginLeft: 36 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#555", letterSpacing: 4, fontFamily: "monospace" }}>A SILENT FILM OF YOUR LIFE</span>
        </div>
        <Logo size={52} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#888", margin: "20px 0 40px", fontStyle: "italic", lineHeight: 1.7 }}>
          Your life. One scene at a time.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onSignup} style={{ background: "#c9b99a", color: "#080808", border: "none", padding: "12px 32px", fontSize: 15, fontFamily: "Georgia, serif", borderRadius: 2, cursor: "pointer", fontWeight: 700, letterSpacing: 0.5 }}>
            Begin Your Story
          </button>
          <button onClick={onLogin} style={{ background: "none", color: "#888", border: "1px solid #333", padding: "12px 32px", fontSize: 15, fontFamily: "Georgia, serif", borderRadius: 2, cursor: "pointer" }}>
            Sign In
          </button>
        </div>
        <div style={{ marginTop: 60, display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
          {["One moment a day", "Cinematic scenes", "Weekly episodes"].map(f => (
            <div key={f}><p style={{ fontSize: 12, color: "#444", fontFamily: "Georgia, serif", fontStyle: "italic", margin: 0 }}>{f}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthPage({ mode, onAuth, onToggle, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handle = () => {
    setError("");
    if (!username.trim() || !password.trim()) return setError("Please fill in all fields.");
    if (mode === "signup") {
      if (password !== confirm) return setError("Passwords don't match.");
      if (userExists(username)) return setError("Username already taken.");
      const data = getUserData(username);
      data.password = password;
      saveUserData(username, data);
      onAuth(username);
    } else {
      if (!userExists(username)) return setError("Username not found.");
      const data = getUserData(username);
      if (data.password !== password) return setError("Wrong password.");
      onAuth(username);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <FilmGrain /><SprocketHoles />
      <div style={{ width: "100%", maxWidth: 380, marginLeft: 36 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13, marginBottom: 32, padding: 0 }}>← Back</button>
        <Logo size={28} />
        <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#555", marginTop: 8, marginBottom: 32 }}>
          {mode === "signup" ? "Begin your silent film." : "Welcome back."}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={{ background: "#111", border: "1px solid #222", color: "#f5f0e8", padding: "12px 16px", borderRadius: 2, fontSize: 14, fontFamily: "Georgia, serif", outline: "none" }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ background: "#111", border: "1px solid #222", color: "#f5f0e8", padding: "12px 16px", borderRadius: 2, fontSize: 14, fontFamily: "Georgia, serif", outline: "none" }} />
          {mode === "signup" && (
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" style={{ background: "#111", border: "1px solid #222", color: "#f5f0e8", padding: "12px 16px", borderRadius: 2, fontSize: 14, fontFamily: "Georgia, serif", outline: "none" }} />
          )}
          {error && <p style={{ color: "#c9613a", fontSize: 13, fontFamily: "Georgia, serif", margin: 0 }}>{error}</p>}
          <button onClick={handle} style={{ background: "#c9b99a", color: "#080808", border: "none", padding: "13px", fontSize: 15, fontFamily: "Georgia, serif", borderRadius: 2, cursor: "pointer", fontWeight: 700, marginTop: 4 }}>
            {mode === "signup" ? "Create Account" : "Enter"}
          </button>
        </div>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#444", marginTop: 24, textAlign: "center" }}>
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <span onClick={onToggle} style={{ color: "#c9b99a", cursor: "pointer" }}>{mode === "signup" ? "Sign in" : "Create account"}</span>
        </p>
      </div>
    </div>
  );
}

function GeneratingOverlay({ step, countdown, total }) {
  const progress = Math.min(100, Math.round(((total - countdown) / total) * 100));
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #c9b99a33", borderRadius: 4, padding: "20px 24px", marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 16, height: 16, border: "2px solid #333", borderTop: "2px solid #c9b99a", borderRadius: "50%", animation: "spin 1s linear infinite", flexShrink: 0 }} />
        <span style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#888", fontStyle: "italic" }}>{step}</span>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#444", marginLeft: "auto" }}>~{countdown}s remaining</span>
      </div>
      <div style={{ background: "#1a1a1a", borderRadius: 2, height: 3, overflow: "hidden" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#c9b99a", transition: "width 1s linear", borderRadius: 2 }} />
      </div>
      <p style={{ fontFamily: "monospace", fontSize: 10, color: "#333", margin: "8px 0 0", textAlign: "right" }}>{progress}% complete</p>
    </div>
  );
}

function DiaryPage({ username, onSettings, onLogout }) {
  const [userData, setUserData] = useState(() => getUserData(username));
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState("");
  const [genCountdown, setGenCountdown] = useState(0);
  const [genTotal, setGenTotal] = useState(30);
  const [watchEpisode, setWatchEpisode] = useState(null);
  const [tab, setTab] = useState("scenes");
  const [newEntry, setNewEntry] = useState(null);
  const countdownRef = useRef(null);

  const prompt = PROMPTS[userData.promptIndex % PROMPTS.length];
  const nextEpisodeIn = 7 - (userData.entries.length % 7);

  const startCountdown = (seconds) => {
    setGenTotal(seconds);
    setGenCountdown(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setGenCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const generate = async () => {
    if (!text.trim() || generating) return;
    setGenerating(true);
    setNewEntry(null);
    try {
      setGenStep("Writing your scene title..."); startCountdown(5);
      const { title, imagePrompt } = await generateScenePrompt(text);

      setGenStep("Painting your illustration..."); startCountdown(20);
      const imageUrl = generateImageUrl(imagePrompt);

      setGenStep("Developing the film..."); startCountdown(5);
      const entry = { id: Date.now(), date: new Date().toISOString(), text: text.trim(), title, imageUrl };
      const updated = { ...userData };
      updated.entries = [entry, ...updated.entries];
      updated.promptIndex = (updated.promptIndex + 1) % PROMPTS.length;

      if (updated.entries.length % 7 === 0) {
        setGenStep("Splicing your episode together..."); startCountdown(8);
        const episodeScenes = updated.entries.slice(0, 7);
        const ep = {
          number: Math.floor(updated.entries.length / 7),
          title: `Episode ${Math.floor(updated.entries.length / 7)}: A Week Unscripted`,
          scenes: episodeScenes,
          dateRange: `${new Date(episodeScenes[episodeScenes.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(episodeScenes[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        };
        updated.episodes = [ep, ...(updated.episodes || [])];
      }

      saveUserData(username, updated);
      setUserData(updated);
      setNewEntry(entry);
      setText("");
    } catch (e) { console.error(e); }
    clearInterval(countdownRef.current);
    setGenerating(false);
    setGenStep("");
    setGenCountdown(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f5f0e8" }}>
      <FilmGrain /><SprocketHoles />
      {watchEpisode && <EpisodePlayer episode={watchEpisode} onClose={() => setWatchEpisode(null)} />}
      <div style={{ marginLeft: 36 }}>
        <div style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size={22} />
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#444", fontFamily: "Georgia, serif" }}>{username}</span>
            <button onClick={onSettings} style={{ background: "none", border: "1px solid #222", color: "#666", padding: "5px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" }}>Settings</button>
            <button onClick={onLogout} style={{ background: "none", border: "none", color: "#444", padding: "5px 0", cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" }}>Sign out</button>
          </div>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 22, color: "#888", fontStyle: "italic", marginBottom: 16 }}>{prompt}</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe your moment..."
              rows={3}
              disabled={generating}
              style={{ width: "100%", background: generating ? "#0a0a0a" : "#0f0f0f", border: "1px solid #222", color: "#f5f0e8", padding: "16px", borderRadius: 2, fontSize: 15, fontFamily: "Georgia, serif", resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.6, opacity: generating ? 0.5 : 1 }}
              onKeyDown={e => { if (e.key === "Enter" && e.metaKey) generate(); }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "#333", fontFamily: "Georgia, serif" }}>
                {nextEpisodeIn === 7 ? "Start logging to create your first episode" : `${nextEpisodeIn} more scene${nextEpisodeIn !== 1 ? "s" : ""} until your next episode`}
              </span>
              <button onClick={generate} disabled={!text.trim() || generating} style={{ background: generating ? "#111" : "#c9b99a", color: generating ? "#444" : "#080808", border: generating ? "1px solid #222" : "none", padding: "10px 24px", borderRadius: 2, fontSize: 14, fontFamily: "Georgia, serif", cursor: generating ? "not-allowed" : "pointer", fontWeight: 700, transition: "all 0.2s" }}>
                {generating ? "In the darkroom..." : "Generate Scene"}
              </button>
            </div>
          </div>

          {generating && genStep && (
            <GeneratingOverlay step={genStep} countdown={genCountdown} total={genTotal} />
          )}

          {newEntry && !generating && (
            <div style={{ marginBottom: 32, background: "#0d0d0d", border: "1px solid #c9b99a44", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #1a1a1a" }}>
                <span style={{ fontSize: 11, color: "#c9b99a", fontFamily: "monospace" }}>NEW SCENE — Just developed</span>
              </div>
              <SceneCard entry={newEntry} index={0} />
            </div>
          )}

          {userData.episodes?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 20, borderBottom: "1px solid #1a1a1a", paddingBottom: 12 }}>
                {["scenes", "episodes"].map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", color: tab === t ? "#c9b99a" : "#444", fontFamily: "Georgia, serif", fontSize: 14, cursor: "pointer", padding: "0 0 4px", borderBottom: tab === t ? "1px solid #c9b99a" : "1px solid transparent", fontStyle: "italic" }}>
                    {t === "scenes" ? "All Scenes" : "Episodes"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(tab === "scenes" || !userData.episodes?.length) && userData.entries.length > 0 && (
            <div>
              {!newEntry && <p style={{ fontFamily: "Georgia, serif", fontSize: 13, color: "#444", fontStyle: "italic", marginBottom: 20 }}>Your film reel — {userData.entries.length} scene{userData.entries.length !== 1 ? "s" : ""}</p>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {userData.entries.map((e, i) => <SceneCard key={e.id} entry={e} index={i} />)}
              </div>
            </div>
          )}

          {tab === "episodes" && userData.episodes?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {userData.episodes.map(ep => <EpisodeCard key={ep.number} episode={ep} onWatch={setWatchEpisode} />)}
            </div>
          )}

          {userData.entries.length === 0 && !generating && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#333", fontStyle: "italic" }}>Your film reel is empty.</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#2a2a2a", fontStyle: "italic" }}>Describe your first moment above to begin.</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SettingsPage({ username, onBack, onDeleteAccount }) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const changePassword = () => {
    setPwMsg("");
    const data = getUserData(username);
    if (data.password !== oldPw) return setPwMsg("Current password is wrong.");
    if (newPw !== confirmPw) return setPwMsg("New passwords don't match.");
    if (!newPw.trim()) return setPwMsg("Password cannot be empty.");
    data.password = newPw;
    saveUserData(username, data);
    setPwMsg("Password updated.");
    setOldPw(""); setNewPw(""); setConfirmPw("");
  };

  const deleteAccount = () => {
    const all = getStorage(); delete all[username]; setStorage(all); onDeleteAccount();
  };

  const inp = { background: "#111", border: "1px solid #222", color: "#f5f0e8", padding: "12px 16px", borderRadius: 2, fontSize: 14, fontFamily: "Georgia, serif", outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f5f0e8" }}>
      <FilmGrain /><SprocketHoles />
      <div style={{ marginLeft: 36 }}>
        <div style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Logo size={22} />
          <button onClick={onBack} style={{ background: "none", border: "1px solid #222", color: "#666", padding: "5px 14px", borderRadius: 2, cursor: "pointer", fontSize: 12, fontFamily: "Georgia, serif" }}>← Back to Diary</button>
        </div>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 24px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", color: "#555", marginBottom: 40 }}>Signed in as <span style={{ color: "#c9b99a" }}>{username}</span></p>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#888", marginBottom: 20, borderBottom: "1px solid #1a1a1a", paddingBottom: 12 }}>Change password</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} placeholder="Current password" style={inp} />
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" style={inp} />
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirm new password" style={inp} />
              {pwMsg && <p style={{ fontSize: 13, color: pwMsg === "Password updated." ? "#6dbf8a" : "#c9613a", fontFamily: "Georgia, serif", margin: 0 }}>{pwMsg}</p>}
              <button onClick={changePassword} style={{ background: "#c9b99a", color: "#080808", border: "none", padding: "12px", fontSize: 14, fontFamily: "Georgia, serif", borderRadius: 2, cursor: "pointer", fontWeight: 700 }}>Update Password</button>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 16, color: "#888", marginBottom: 20, borderBottom: "1px solid #1a1a1a", paddingBottom: 12 }}>Danger zone</p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} style={{ background: "none", border: "1px solid #c9613a44", color: "#c9613a", padding: "10px 20px", borderRadius: 2, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>Delete Account</button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: 14, color: "#888", fontStyle: "italic" }}>This will permanently delete your account and all your scenes. This cannot be undone.</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={deleteAccount} style={{ background: "#c9613a", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 2, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif", fontWeight: 700 }}>Yes, delete everything</button>
                  <button onClick={() => setConfirmDelete(false)} style={{ background: "none", border: "1px solid #333", color: "#666", padding: "10px 20px", borderRadius: 2, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [authMode, setAuthMode] = useState("signup");
  const [username, setUsername] = useState("");

  const handleAuth = (user) => { setUsername(user); setPage("diary"); };
  const handleLogout = () => { setUsername(""); setPage("landing"); };

  if (page === "landing") return <LandingPage onLogin={() => { setAuthMode("login"); setPage("auth"); }} onSignup={() => { setAuthMode("signup"); setPage("auth"); }} />;
  if (page === "auth") return <AuthPage mode={authMode} onAuth={handleAuth} onToggle={() => setAuthMode(m => m === "login" ? "signup" : "login")} onBack={() => setPage("landing")} />;
  if (page === "settings") return <SettingsPage username={username} onBack={() => setPage("diary")} onDeleteAccount={handleLogout} />;
  if (page === "diary") return <DiaryPage username={username} onSettings={() => setPage("settings")} onLogout={handleLogout} />;
  return null;
}
