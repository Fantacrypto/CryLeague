import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "admin2024";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "password";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TOP_CRYPTOS = [
  { id: "bitcoin",       symbol: "BTC",  name: "Bitcoin" },
  { id: "ethereum",      symbol: "ETH",  name: "Ethereum" },
  { id: "binancecoin",   symbol: "BNB",  name: "BNB" },
  { id: "solana",        symbol: "SOL",  name: "Solana" },
  { id: "ripple",        symbol: "XRP",  name: "XRP" },
  { id: "cardano",       symbol: "ADA",  name: "Cardano" },
  { id: "avalanche-2",   symbol: "AVAX", name: "Avalanche" },
  { id: "dogecoin",      symbol: "DOGE", name: "Dogecoin" },
  { id: "polkadot",      symbol: "DOT",  name: "Polkadot" },
  { id: "chainlink",     symbol: "LINK", name: "Chainlink" },
  { id: "matic-network", symbol: "MATIC",name: "Polygon" },
  { id: "shiba-inu",     symbol: "SHIB", name: "Shiba Inu" },
  { id: "tron",          symbol: "TRX",  name: "TRON" },
  { id: "uniswap",       symbol: "UNI",  name: "Uniswap" },
  { id: "litecoin",      symbol: "LTC",  name: "Litecoin" },
];

const fmt = (s) => {
  if (s === null || s === undefined) return "—";
  const n = Number(s);
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" }) : "—";

async function fetchCryptoPrices(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(",")}&vs_currencies=usd`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Errore CoinGecko");
  return res.json();
}

function calcScore(cryptos, startPrices, endPrices) {
  let total = 0, count = 0;
  for (const c of cryptos) {
    const sp = startPrices?.[c.id]?.usd;
    const ep = endPrices?.[c.id]?.usd;
    if (sp && ep) { total += ((ep - sp) / sp) * 100; count++; }
  }
  return count ? total / count : null;
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#07090e;--surface:#0d1219;--surface2:#131920;--surface3:#1a2230;
  --border:#1e2a3a;--accent:#00ff94;--accent2:#00bfff;--red:#ff4d6d;
  --text:#e6edf3;--muted:#5d7a96;--gold:#ffd700;
}
body{background:var(--bg);color:var(--text);font-family:'Syne',sans-serif;min-height:100vh}
.app{max-width:960px;margin:0 auto;padding:1rem 1rem 4rem}
.header{text-align:center;padding:2.5rem 0 1.5rem;position:relative}
.header-bg{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:500px;height:300px;background:radial-gradient(ellipse,rgba(0,255,148,0.06) 0%,transparent 65%);pointer-events:none}
.logo{font-size:2.4rem;font-weight:800;letter-spacing:-2px}
.logo span{color:var(--accent)}
.subtitle{color:var(--muted);font-size:0.78rem;letter-spacing:4px;text-transform:uppercase;margin-top:0.4rem;font-family:'JetBrains Mono',monospace}
.nav{display:flex;gap:0.4rem;justify-content:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:0.4rem;max-width:460px;margin:0 auto 2rem}
.nav-btn{padding:0.55rem 1rem;border-radius:8px;border:none;background:transparent;color:var(--muted);cursor:pointer;font-family:'Syne',sans-serif;font-size:0.82rem;font-weight:600;transition:all 0.2s;flex:1;text-align:center}
.nav-btn:hover{color:var(--text)}
.nav-btn.active{background:var(--surface3);color:var(--accent);box-shadow:0 0 0 1px var(--border)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1.5rem;margin-bottom:1rem}
.card-sm{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem}
.card-title{font-size:0.78rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:2.5px;margin-bottom:1.2rem;font-family:'JetBrains Mono',monospace}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0.8rem}
@media(max-width:600px){.form-grid{grid-template-columns:1fr}}
.field{display:flex;flex-direction:column;gap:0.4rem}
.field.full{grid-column:1/-1}
label{font-size:0.72rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);font-family:'JetBrains Mono',monospace}
input{background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:0.65rem 0.9rem;font-family:'Syne',sans-serif;font-size:0.9rem;outline:none;transition:border-color 0.2s;width:100%}
input:focus{border-color:var(--accent)}
input::placeholder{color:var(--muted)}
input:disabled{opacity:0.5;cursor:not-allowed}
.crypto-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:0.45rem;margin-top:0.5rem}
.crypto-chip{padding:0.5rem 0.6rem;border-radius:8px;border:1px solid var(--border);background:var(--surface2);cursor:pointer;text-align:center;transition:all 0.15s;user-select:none}
.crypto-chip:hover{border-color:var(--accent2)}
.crypto-chip.selected{border-color:var(--accent);background:rgba(0,255,148,0.07);color:var(--accent)}
.crypto-chip.disabled{opacity:0.35;cursor:not-allowed}
.crypto-sym{font-weight:700;font-family:'JetBrains Mono',monospace;font-size:0.85rem}
.crypto-name{color:var(--muted);font-size:0.68rem;margin-top:1px}
.btn{padding:0.65rem 1.4rem;border-radius:8px;border:none;cursor:pointer;font-family:'Syne',sans-serif;font-weight:700;font-size:0.88rem;transition:all 0.18s}
.btn-primary{background:var(--accent);color:#000}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-danger{background:var(--red);color:#fff}
.btn-outline{background:transparent;border:1px solid var(--accent);color:var(--accent)}
.btn-outline:hover{background:rgba(0,255,148,0.07)}
.btn-ghost{background:transparent;border:1px solid var(--border);color:var(--muted)}
.btn-ghost:hover{border-color:var(--text);color:var(--text)}
.btn-google{background:#fff;color:#222;display:flex;align-items:center;justify-content:center;gap:0.6rem;width:100%;font-size:0.95rem;padding:0.8rem}
.btn-google:hover{background:#f5f5f5}
.btn:disabled{opacity:0.4;cursor:not-allowed;transform:none!important;filter:none!important}
.btn-sm{padding:0.35rem 0.9rem;font-size:0.78rem;border-radius:6px}
.badge{display:inline-flex;align-items:center;gap:0.4rem;padding:0.25rem 0.75rem;border-radius:20px;font-size:0.72rem;font-family:'JetBrains Mono',monospace;font-weight:600}
.badge-green{background:rgba(0,255,148,0.08);color:var(--accent);border:1px solid rgba(0,255,148,0.25)}
.badge-blue{background:rgba(0,191,255,0.08);color:var(--accent2);border:1px solid rgba(0,191,255,0.25)}
.badge-muted{background:var(--surface2);color:var(--muted);border:1px solid var(--border)}
.pulse{width:5px;height:5px;border-radius:50%;background:currentColor;animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
.lb-table{display:flex;flex-direction:column;gap:0.4rem}
.lb-row{display:grid;align-items:center;gap:0.8rem;padding:0.85rem 1rem;border-radius:10px;background:var(--surface2);border:1px solid var(--border)}
.lb-row.top1{border-color:rgba(255,215,0,0.4);background:rgba(255,215,0,0.03)}
.lb-row.top2{border-color:rgba(192,192,192,0.35)}
.lb-row.top3{border-color:rgba(205,127,50,0.35)}
.lb-cols{grid-template-columns:44px 1fr auto}
.lb-rank{font-weight:800;font-family:'JetBrains Mono',monospace;font-size:1.05rem;color:var(--muted);text-align:center}
.r1{color:var(--gold)}.r2{color:#c0c0c0}.r3{color:#cd7f32}
.lb-score{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:0.95rem;text-align:right}
.pos{color:var(--accent)}.neg{color:var(--red)}.neutral{color:var(--muted)}
.team-chips{display:flex;flex-wrap:wrap;gap:0.25rem;margin-top:0.35rem}
.mini-chip{padding:0.12rem 0.45rem;border-radius:4px;background:rgba(0,255,148,0.07);border:1px solid rgba(0,255,148,0.18);font-size:0.65rem;font-family:'JetBrains Mono',monospace;color:var(--accent)}
.calendar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:0.6rem}
.round-card{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem;cursor:pointer;transition:all 0.18s}
.round-card:hover{border-color:var(--accent2);transform:translateY(-2px)}
.round-card.active-round{border-color:rgba(0,255,148,0.4);background:rgba(0,255,148,0.04)}
.round-card.completed-round{opacity:0.75}
.round-card.selected-round{border-color:var(--accent2)}
.round-num{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:1.4rem;color:var(--accent);line-height:1}
.round-name{font-weight:700;font-size:0.9rem;margin:0.3rem 0 0.2rem}
.round-dates{font-size:0.72rem;color:var(--muted)}
.tab-bar{display:flex;border-bottom:1px solid var(--border);margin-bottom:1.2rem;overflow-x:auto}
.tab{padding:0.6rem 1.1rem;font-size:0.82rem;font-weight:600;cursor:pointer;color:var(--muted);border-bottom:2px solid transparent;transition:all 0.18s;font-family:'JetBrains Mono',monospace;white-space:nowrap}
.tab:hover{color:var(--text)}
.tab.active{color:var(--accent);border-bottom-color:var(--accent)}
.alert{padding:0.8rem 1rem;border-radius:8px;font-size:0.84rem;margin-bottom:1rem;line-height:1.5}
.alert-success{background:rgba(0,255,148,0.07);border:1px solid rgba(0,255,148,0.25);color:var(--accent)}
.alert-error{background:rgba(255,77,109,0.07);border:1px solid rgba(255,77,109,0.25);color:var(--red)}
.alert-info{background:rgba(0,191,255,0.07);border:1px solid rgba(0,191,255,0.25);color:var(--accent2)}
.divider{border:none;border-top:1px solid var(--border);margin:1.2rem 0}
.flex{display:flex;align-items:center;gap:0.7rem;flex-wrap:wrap}
.flex-between{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem}
.mt{margin-top:1rem}
.text-muted{color:var(--muted);font-size:0.82rem}
.loading{text-align:center;padding:3rem;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:0.85rem}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.8rem;margin-bottom:1.2rem}
.stat-box{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:1rem;text-align:center}
.stat-num{font-size:1.8rem;font-weight:800;font-family:'JetBrains Mono',monospace;color:var(--accent)}
.stat-label{font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-top:0.3rem}
.empty{text-align:center;padding:2.5rem;color:var(--muted);font-size:0.85rem}
.avatar{width:36px;height:36px;border-radius:50%;border:2px solid var(--accent)}
.user-bar{display:flex;align-items:center;justify-content:space-between;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:0.7rem 1rem;margin-bottom:1rem}
.user-info{display:flex;align-items:center;gap:0.6rem}
.user-name{font-weight:700;font-size:0.9rem}
.user-email{font-size:0.72rem;color:var(--muted)}
.lock-badge{display:inline-flex;align-items:center;gap:0.3rem;font-size:0.72rem;color:var(--red);font-family:'JetBrains Mono',monospace}
`;

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const isAdmin = window.location.pathname.includes(ADMIN_SECRET) ||
    new URLSearchParams(window.location.search).get("admin") === ADMIN_SECRET;

  const [page, setPage] = useState(isAdmin ? "admin" : "squadra");
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [adminAuthed, setAdminAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loadingAuth) return (
    <>
      <style>{css}</style>
      <div className="app"><div className="loading">Caricamento</div></div>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <header className="header">
          <div className="header-bg" />
          <div className="logo">Crypto<span>League</span></div>
          <div className="subtitle">Fantasy Crypto Championship · Alpha</div>
        </header>

        {/* User bar */}
        {user && !isAdmin && (
          <div className="user-bar">
            <div className="user-info">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} className="avatar" alt="avatar" />
              )}
              <div>
                <div className="user-name">{user.user_metadata?.full_name || "Utente"}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={signOut}>Esci</button>
          </div>
        )}

        <nav className="nav">
          {!isAdmin && (
            <>
              <button className={`nav-btn ${page === "squadra" ? "active" : ""}`} onClick={() => setPage("squadra")}>
                La mia squadra
              </button>
              <button className={`nav-btn ${page === "leaderboard" ? "active" : ""}`} onClick={() => setPage("leaderboard")}>
                Classifica
              </button>
            </>
          )}
          {isAdmin && (
            <button className={`nav-btn ${page === "admin" ? "active" : ""}`} onClick={() => setPage("admin")}>
              Admin
            </button>
          )}
        </nav>

        {page === "squadra" && !isAdmin && (
          user
            ? <SquadraPage user={user} />
            : <LoginPage onLogin={signInWithGoogle} />
        )}
        {page === "leaderboard" && <LeaderboardPage />}
        {page === "admin" && isAdmin && (
          <AdminPage adminAuthed={adminAuthed} setAdminAuthed={setAdminAuthed} />
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  return (
    <div className="card" style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏆</div>
      <div style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: "0.4rem" }}>Entra in CryptoLeague</div>
      <p className="text-muted" style={{ marginBottom: "1.5rem", lineHeight: 1.6 }}>
        Accedi con Google per registrare la tua squadra e competere nella classifica.
      </p>
      <button className="btn btn-google" onClick={onLogin}>
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.7 39.7 16.3 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.9 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
        </svg>
        Accedi con Google
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SQUADRA PAGE (profilo utente + registrazione/modifica)
// ─────────────────────────────────────────────────────────────
function SquadraPage({ user }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeRound, setActiveRound] = useState(null);
  const [form, setForm] = useState({ nome: "", cognome: "", squadra: "" });
  const [selected, setSelected] = useState([]);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [user]);

  async function loadData() {
    setLoading(true);
    const [{ data: teamData }, { data: roundData }] = await Promise.all([
      supabase.from("teams").select("*").eq("user_id", user.id).single(),
      supabase.from("rounds").select("*").eq("stato", "active").single(),
    ]);
    setTeam(teamData || null);
    setActiveRound(roundData || null);
    if (teamData) {
      setForm({ nome: teamData.nome, cognome: teamData.cognome, squadra: teamData.squadra });
      setSelected(teamData.cryptos || []);
    }
    setLoading(false);
    if (!teamData) setEditing(true);
  }

  function toggleCrypto(c) {
    setSelected(prev => {
      if (prev.find(x => x.id === c.id)) return prev.filter(x => x.id !== c.id);
      if (prev.length >= 5) return prev;
      return [...prev, c];
    });
  }

  async function saveTeam() {
    if (!form.nome || !form.cognome || !form.squadra)
      return setStatus({ type: "error", msg: "Compila tutti i campi." });
    if (selected.length !== 5)
      return setStatus({ type: "error", msg: "Seleziona esattamente 5 crypto." });

    setSaving(true);
    const payload = {
      user_id: user.id,
      email: user.email,
      nome: form.nome,
      cognome: form.cognome,
      squadra: form.squadra,
      cryptos: selected,
    };

    let error;
    if (team) {
      ({ error } = await supabase.from("teams").update(payload).eq("user_id", user.id));
    } else {
      ({ error } = await supabase.from("teams").insert([payload]));
    }

    if (error) {
      setStatus({ type: "error", msg: error.message });
    } else {
      setStatus({ type: "success", msg: team ? "✅ Squadra aggiornata!" : "🚀 Squadra registrata! Buona fortuna!" });
      setEditing(false);
      loadData();
    }
    setSaving(false);
  }

  if (loading) return <div className="loading">Caricamento</div>;

  const canEdit = !activeRound; // può modificare solo se nessuna giornata è attiva

  return (
    <div>
      {status && <div className={`alert alert-${status.type}`}>{status.msg}</div>}

      {/* Mostra squadra attuale */}
      {team && !editing && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: "1rem" }}>
            <div className="card-title" style={{ margin: 0 }}>// La tua squadra</div>
            {canEdit
              ? <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>✏️ Modifica</button>
              : <span className="lock-badge">🔒 Giornata in corso</span>
            }
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontWeight: 800, fontSize: "1.3rem" }}>{team.squadra}</div>
            <div className="text-muted">{team.nome} {team.cognome}</div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem", fontFamily: "JetBrains Mono", textTransform: "uppercase", letterSpacing: "1px" }}>Le tue 5 crypto</div>
            <div className="team-chips" style={{ gap: "0.4rem" }}>
              {team.cryptos.map(c => (
                <span key={c.id} style={{ padding: "0.4rem 0.8rem", borderRadius: "8px", background: "rgba(0,255,148,0.08)", border: "1px solid rgba(0,255,148,0.25)", fontSize: "0.85rem", fontFamily: "JetBrains Mono", fontWeight: 700, color: "var(--accent)" }}>
                  {c.symbol} <span style={{ color: "var(--muted)", fontWeight: 400 }}>{c.name}</span>
                </span>
              ))}
            </div>
          </div>

          {!canEdit && (
            <div className="alert alert-info mt">
              ⚡ Una giornata è in corso — puoi modificare la squadra solo tra una giornata e l'altra.
            </div>
          )}
        </div>
      )}

      {/* Form registrazione / modifica */}
      {editing && (
        <div className="card">
          <div className="card-title">{team ? "// Modifica squadra" : "// Registra la tua squadra"}</div>

          <div className="card-sm" style={{ marginBottom: "1rem" }}>
            <div className="flex">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} className="avatar" alt="avatar" />
              )}
              <div>
                <div style={{ fontWeight: 700 }}>{user.user_metadata?.full_name}</div>
                <div className="text-muted">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Nome</label>
              <input placeholder="Mario" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
            </div>
            <div className="field">
              <label>Cognome</label>
              <input placeholder="Rossi" value={form.cognome} onChange={e => setForm(p => ({ ...p, cognome: e.target.value }))} />
            </div>
            <div className="field full">
              <label>Nome Squadra</label>
              <input placeholder="Moon Hunters" value={form.squadra} onChange={e => setForm(p => ({ ...p, squadra: e.target.value }))} />
            </div>
            <div className="field full">
              <label>Scegli 5 Crypto ({selected.length}/5)</label>
              <div className="crypto-grid">
                {TOP_CRYPTOS.map(c => {
                  const isSel = !!selected.find(x => x.id === c.id);
                  const isDis = !isSel && selected.length >= 5;
                  return (
                    <div key={c.id} className={`crypto-chip ${isSel ? "selected" : ""} ${isDis ? "disabled" : ""}`}
                      onClick={() => !isDis && toggleCrypto(c)}>
                      <div className="crypto-sym">{c.symbol}</div>
                      <div className="crypto-name">{c.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex mt">
            <button className="btn btn-primary" onClick={saveTeam} disabled={saving}>
              {saving ? "Salvataggio..." : team ? "Salva modifiche" : "Registra Squadra →"}
            </button>
            {team && (
              <button className="btn btn-ghost" onClick={() => { setEditing(false); setStatus(null); }}>Annulla</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────────────────────
function LeaderboardPage() {
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [scores, setScores] = useState([]);
  const [liveData, setLiveData] = useState(null);
  const [tab, setTab] = useState("generale");
  const [selRound, setSelRound] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [{ data: t }, { data: r }, { data: s }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("rounds").select("*").order("numero"),
      supabase.from("round_scores").select("*"),
    ]);
    setTeams(t || []);
    setRounds(r || []);
    setScores(s || []);

    const active = (r || []).find(x => x.stato === "active");
    if (active && t?.length) {
      try {
        const ids = [...new Set(t.flatMap(team => team.cryptos.map(c => c.id)))];
        const prices = await fetchCryptoPrices(ids);
        const live = t.map(team => ({
          ...team,
          live_score: calcScore(team.cryptos, active.start_prices, prices),
        })).sort((a, b) => (b.live_score ?? -Infinity) - (a.live_score ?? -Infinity));
        setLiveData({ round: active, teams: live });
      } catch { setLiveData(null); }
    } else {
      setLiveData(null);
    }

    if (!selRound && r?.length) {
      const active2 = r.find(x => x.stato === "active");
      const last = [...(r || [])].reverse().find(x => x.stato === "completed");
      setSelRound(active2 || last || r[0]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, []);

  if (loading) return <div className="loading">Caricamento classifica</div>;

  const activeRound = rounds.find(r => r.stato === "active");
  const completed = rounds.filter(r => r.stato === "completed");

  const general = teams.map(team => {
    let total = 0, count = 0;
    for (const r of completed) {
      const s = scores.find(x => x.round_id === r.id && x.team_id === team.id);
      if (s?.score !== null && s?.score !== undefined) { total += Number(s.score); count++; }
    }
    return { ...team, total_score: count ? total : null, rounds_played: count };
  }).sort((a, b) => (b.total_score ?? -Infinity) - (a.total_score ?? -Infinity));

  function roundRanking(round) {
    if (!round) return [];
    if (liveData?.round?.id === round.id) return liveData.teams;
    return teams.map(team => {
      const s = scores.find(x => x.round_id === round.id && x.team_id === team.id);
      return { ...team, score: s?.score ?? null };
    }).sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
  }

  const rankIcon = i => i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
  const scoreClass = s => s === null || s === undefined ? "neutral" : Number(s) >= 0 ? "pos" : "neg";

  return (
    <div>
      <div className="card">
        <div className="flex-between" style={{ marginBottom: "1rem" }}>
          <div className="flex">
            {activeRound
              ? <span className="badge badge-green"><div className="pulse" />LIVE · {activeRound.nome}</span>
              : <span className="badge badge-muted">In attesa</span>}
            <span className="text-muted">{completed.length}/{rounds.length} giornate</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={load}>↻</button>
        </div>

        <div className="tab-bar">
          <div className={`tab ${tab === "generale" ? "active" : ""}`} onClick={() => setTab("generale")}>Generale</div>
          <div className={`tab ${tab === "calendario" ? "active" : ""}`} onClick={() => setTab("calendario")}>Calendario</div>
          {selRound && <div className={`tab ${tab === "giornata" ? "active" : ""}`} onClick={() => setTab("giornata")}>{selRound.nome}</div>}
        </div>

        {tab === "generale" && (
          general.length === 0
            ? <div className="empty">Nessuna squadra registrata ancora.</div>
            : <div className="lb-table">
                {general.map((team, i) => (
                  <div key={team.id} className={`lb-row lb-cols ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}`}>
                    <div className={`lb-rank ${i === 0 ? "r1" : i === 1 ? "r2" : i === 2 ? "r3" : ""}`}>{rankIcon(i)}</div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{team.squadra}</div>
                      <div className="text-muted">{team.nome} {team.cognome}</div>
                      <div className="team-chips">{(team.cryptos || []).map(c => <span key={c.id} className="mini-chip">{c.symbol}</span>)}</div>
                    </div>
                    <div>
                      <div className={`lb-score ${scoreClass(team.total_score)}`}>{fmt(team.total_score)}</div>
                      <div className="text-muted" style={{ fontSize: "0.7rem", textAlign: "right" }}>{team.rounds_played} gior.</div>
                    </div>
                  </div>
                ))}
              </div>
        )}

        {tab === "calendario" && (
          rounds.length === 0
            ? <div className="empty">Nessun calendario creato.</div>
            : <div className="calendar-grid">
                {rounds.map(r => (
                  <div key={r.id}
                    className={`round-card ${r.stato === "active" ? "active-round" : ""} ${r.stato === "completed" ? "completed-round" : ""} ${selRound?.id === r.id ? "selected-round" : ""}`}
                    onClick={() => { setSelRound(r); setTab("giornata"); }}>
                    <div className="round-num">{r.numero}</div>
                    <div className="round-name">{r.nome}</div>
                    <div className="round-dates">{fmtDate(r.data_inizio)} → {fmtDate(r.data_fine)}</div>
                    <div style={{ marginTop: "0.6rem" }}>
                      {r.stato === "active" && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}><div className="pulse" />LIVE</span>}
                      {r.stato === "completed" && <span className="badge badge-muted" style={{ fontSize: "0.65rem" }}>Completata</span>}
                      {r.stato === "scheduled" && <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>Programmata</span>}
                    </div>
                  </div>
                ))}
              </div>
        )}

        {tab === "giornata" && selRound && (() => {
          const ranking = roundRanking(selRound);
          return (
            <>
              <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{selRound.nome}</div>
                  <div className="text-muted">{fmtDate(selRound.data_inizio)} → {fmtDate(selRound.data_fine)}</div>
                </div>
                {selRound.stato === "active" && <span className="badge badge-green"><div className="pulse" />LIVE</span>}
                {selRound.stato === "completed" && <span className="badge badge-muted">Completata</span>}
                {selRound.stato === "scheduled" && <span className="badge badge-blue">Programmata</span>}
              </div>
              {selRound.stato === "scheduled"
                ? <div className="empty">Questa giornata non è ancora iniziata.</div>
                : ranking.length === 0
                  ? <div className="empty">Nessun dato disponibile.</div>
                  : <div className="lb-table">
                      {ranking.map((team, i) => {
                        const score = team.live_score !== undefined ? team.live_score : team.score;
                        return (
                          <div key={team.id} className={`lb-row lb-cols ${i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""}`}>
                            <div className={`lb-rank ${i === 0 ? "r1" : i === 1 ? "r2" : i === 2 ? "r3" : ""}`}>{rankIcon(i)}</div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{team.squadra}</div>
                              <div className="team-chips">{(team.cryptos || []).map(c => <span key={c.id} className="mini-chip">{c.symbol}</span>)}</div>
                            </div>
                            <div className={`lb-score ${scoreClass(score)}`}>{fmt(score)}</div>
                          </div>
                        );
                      })}
                    </div>
              }
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────
function AdminPage({ adminAuthed, setAdminAuthed }) {
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [tab, setTab] = useState("calendario");
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [calForm, setCalForm] = useState({ totalRounds: 8, startDate: "", intervalDays: 7 });

  function login() {
    if (pw === ADMIN_PASSWORD) { setAdminAuthed(true); loadAll(); }
    else setPwErr(true);
  }

  async function loadAll() {
    const [{ data: t }, { data: r }] = await Promise.all([
      supabase.from("teams").select("*").order("created_at"),
      supabase.from("rounds").select("*").order("numero"),
    ]);
    setTeams(t || []);
    setRounds(r || []);
  }

  useEffect(() => { if (adminAuthed) loadAll(); }, [adminAuthed]);

  if (!adminAuthed) return (
    <div className="card" style={{ maxWidth: 360, margin: "0 auto" }}>
      <div className="card-title">// Accesso Admin</div>
      {pwErr && <div className="alert alert-error">Password errata.</div>}
      <div className="field">
        <label>Password</label>
        <input type="password" placeholder="••••••••" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
      </div>
      <button className="btn btn-primary mt" onClick={login}>Accedi</button>
    </div>
  );

  async function generateCalendar() {
    if (!calForm.startDate) return setMsg({ type: "error", msg: "Inserisci la data di inizio." });
    setBusy(true);
    try {
      await supabase.from("round_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      const newRounds = [];
      for (let i = 0; i < calForm.totalRounds; i++) {
        const start = new Date(calForm.startDate);
        start.setDate(start.getDate() + i * calForm.intervalDays);
        const end = new Date(start);
        end.setDate(end.getDate() + calForm.intervalDays);
        newRounds.push({ numero: i + 1, nome: `Giornata ${i + 1}`, data_inizio: start.toISOString(), data_fine: end.toISOString(), stato: "scheduled" });
      }
      await supabase.from("rounds").insert(newRounds);
      setMsg({ type: "success", msg: `✅ Calendario creato: ${calForm.totalRounds} giornate.` });
      loadAll();
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    setBusy(false);
  }

  async function startRound(round) {
    setBusy(true);
    try {
      const { data: t } = await supabase.from("teams").select("cryptos");
      const ids = [...new Set(t.flatMap(x => x.cryptos.map(c => c.id)))];
      const prices = await fetchCryptoPrices(ids);
      await supabase.from("rounds").update({ stato: "active", start_prices: prices, data_inizio: new Date().toISOString() }).eq("id", round.id);
      setMsg({ type: "success", msg: "▶ Giornata avviata!" });
      loadAll();
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    setBusy(false);
  }

  async function stopRound(round) {
    setBusy(true);
    try {
      const { data: t } = await supabase.from("teams").select("*");
      const ids = [...new Set(t.flatMap(x => x.cryptos.map(c => c.id)))];
      const endPrices = await fetchCryptoPrices(ids);
      await supabase.from("rounds").update({ stato: "completed", end_prices: endPrices, data_fine: new Date().toISOString() }).eq("id", round.id);
      const scoreRows = t.map(team => ({ round_id: round.id, team_id: team.id, score: calcScore(team.cryptos, round.start_prices, endPrices) }));
      await supabase.from("round_scores").upsert(scoreRows, { onConflict: "round_id,team_id" });
      setMsg({ type: "success", msg: "■ Giornata terminata! Punteggi salvati." });
      loadAll();
    } catch (err) { setMsg({ type: "error", msg: err.message }); }
    setBusy(false);
  }

  async function deleteTeam(id) {
    await supabase.from("round_scores").delete().eq("team_id", id);
    await supabase.from("teams").delete().eq("id", id);
    loadAll();
  }

  async function fullReset() {
    setBusy(true);
    await supabase.from("round_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("rounds").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("teams").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setConfirmReset(false);
    setMsg({ type: "success", msg: "Reset completato." });
    loadAll();
    setBusy(false);
  }

  const activeRound = rounds.find(r => r.stato === "active");
  const completed = rounds.filter(r => r.stato === "completed");

  return (
    <div>
      {msg && <div className={`alert alert-${msg.type}`} onClick={() => setMsg(null)} style={{ cursor: "pointer" }}>{msg.msg} ✕</div>}
      <div className="card">
        <div className="stat-grid">
          <div className="stat-box"><div className="stat-num">{teams.length}</div><div className="stat-label">Squadre</div></div>
          <div className="stat-box"><div className="stat-num">{rounds.length}</div><div className="stat-label">Giornate</div></div>
          <div className="stat-box"><div className="stat-num">{completed.length}</div><div className="stat-label">Completate</div></div>
          <div className="stat-box">
            <div style={{ paddingTop: "0.3rem" }}>
              {activeRound ? <span className="badge badge-green"><div className="pulse" />LIVE</span> : <span style={{ color: "var(--muted)", fontFamily: "JetBrains Mono", fontWeight: 700 }}>—</span>}
            </div>
            <div className="stat-label">Stato</div>
          </div>
        </div>

        <div className="tab-bar">
          <div className={`tab ${tab === "calendario" ? "active" : ""}`} onClick={() => setTab("calendario")}>Calendario</div>
          <div className={`tab ${tab === "squadre" ? "active" : ""}`} onClick={() => setTab("squadre")}>Squadre ({teams.length})</div>
          <div className={`tab ${tab === "impostazioni" ? "active" : ""}`} onClick={() => setTab("impostazioni")}>Impostazioni</div>
        </div>

        {tab === "calendario" && (
          <>
            <div className="card-sm" style={{ marginBottom: "1rem" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.8rem", fontSize: "0.85rem" }}>📅 Genera Calendario</div>
              <div className="form-grid">
                <div className="field"><label>Numero Giornate</label><input type="number" min="1" max="52" value={calForm.totalRounds} onChange={e => setCalForm(p => ({ ...p, totalRounds: parseInt(e.target.value) }))} /></div>
                <div className="field"><label>Durata (giorni)</label><input type="number" min="1" max="30" value={calForm.intervalDays} onChange={e => setCalForm(p => ({ ...p, intervalDays: parseInt(e.target.value) }))} /></div>
                <div className="field full"><label>Data Inizio</label><input type="date" value={calForm.startDate} onChange={e => setCalForm(p => ({ ...p, startDate: e.target.value }))} /></div>
              </div>
              <div className="flex mt">
                <button className="btn btn-primary btn-sm" onClick={generateCalendar} disabled={busy}>{busy ? "..." : "Genera"}</button>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>⚠ Sovrascrive il calendario</span>
              </div>
            </div>
            {rounds.length === 0
              ? <div className="empty">Nessun calendario.</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {rounds.map(r => (
                    <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "0.8rem", padding: "0.8rem 1rem", background: "var(--surface2)", borderRadius: "10px", border: `1px solid ${r.stato === "active" ? "rgba(0,255,148,0.3)" : "var(--border)"}` }}>
                      <div>
                        <div className="flex">
                          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{r.nome}</span>
                          {r.stato === "active" && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}><div className="pulse" />LIVE</span>}
                          {r.stato === "completed" && <span className="badge badge-muted" style={{ fontSize: "0.65rem" }}>Completata</span>}
                          {r.stato === "scheduled" && <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>Programmata</span>}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.78rem", marginTop: "0.2rem" }}>{fmtDate(r.data_inizio)} → {fmtDate(r.data_fine)}</div>
                      </div>
                      <div>
                        {r.stato === "scheduled" && !activeRound && <button className="btn btn-primary btn-sm" onClick={() => startRound(r)} disabled={busy}>▶ Avvia</button>}
                        {r.stato === "active" && <button className="btn btn-danger btn-sm" onClick={() => stopRound(r)} disabled={busy}>■ Termina</button>}
                      </div>
                    </div>
                  ))}
                </div>
            }
          </>
        )}

        {tab === "squadre" && (
          teams.length === 0 ? <div className="empty">Nessuna squadra.</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {teams.map((team, i) => (
                  <div key={team.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto", gap: "0.8rem", alignItems: "center", padding: "0.75rem 1rem", background: "var(--surface2)", borderRadius: "10px", border: "1px solid var(--border)" }}>
                    <span style={{ fontFamily: "JetBrains Mono", color: "var(--muted)", fontWeight: 700, fontSize: "0.85rem" }}>#{i + 1}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>{team.squadra}</div>
                      <div className="text-muted">{team.nome} {team.cognome} · {team.email}</div>
                      <div className="team-chips">{(team.cryptos || []).map(c => <span key={c.id} className="mini-chip">{c.symbol}</span>)}</div>
                    </div>
                    <button onClick={() => deleteTeam(team.id)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
                  </div>
                ))}
              </div>
        )}

        {tab === "impostazioni" && (
          <div className="card-sm" style={{ borderColor: "rgba(255,77,109,0.25)" }}>
            <div style={{ fontWeight: 700, color: "var(--red)", marginBottom: "0.6rem" }}>⚠ Reset Completo</div>
            <p className="text-muted" style={{ marginBottom: "0.8rem", lineHeight: 1.6 }}>Elimina squadre, punteggi e calendario. Irreversibile.</p>
            {!confirmReset
              ? <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>Reset Tutto</button>
              : <div className="flex">
                  <span className="text-muted">Sicuro?</span>
                  <button className="btn btn-danger btn-sm" onClick={fullReset} disabled={busy}>Sì, cancella tutto</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>Annulla</button>
                </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
