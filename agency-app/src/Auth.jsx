import { useMemo, useState } from "react";
import supabase from "./supabase.js";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0C0E14; --sidebar: #10121A; --card: #161B26;
    --border: #1E2535; --accent: #C9A84C; --accent2: #E2C97E;
    --text: #E4E8F0; --muted: #5A6478; --dim: #2E3648;
    --ok: #10B981; --warn: #F59E0B; --err: #EF4444; --info: #3B82F6;
    --font-head: 'Cormorant Garamond', Georgia, serif;
    --font-body: 'DM Sans', system-ui, sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 14px; }
  button { cursor: pointer; font-family: var(--font-body); }
  input, select, textarea { font-family: var(--font-body); background: var(--bg); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 8px 12px; font-size: 13px; outline: none; width: 100%; transition: border-color .2s; }
  input:focus, select:focus, textarea:focus { border-color: var(--accent); }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; border: none; transition: all .15s; }
  .btn-accent { background: var(--accent); color: #0C0E14; }
  .btn-accent:hover { background: var(--accent2); }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--dim); color: var(--text); }
  .btn-danger { background: #EF444420; color: var(--err); border: 1px solid #EF444440; }
  .modal { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 28px; width: 600px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-family: var(--font-head); font-size: 22px; font-weight: 600; margin-bottom: 20px; color: var(--accent); }
  .form-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; display: block; }
  .auth-text-link { background: none; border: none; padding: 0; margin: 0; font-family: var(--font-body); font-size: 12px; color: var(--accent); cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
  .auth-text-link:hover { color: var(--accent2); }
`;

export default function Auth() {
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const title = useMemo(() => {
    if (mode === "reset") return "Recupera Password";
    return mode === "login" ? "Accedi" : "Registrati";
  }, [mode]);

  const goToLogin = () => {
    setMode("login");
    setError("");
    setInfo("");
  };

  const goToReset = () => {
    setMode("reset");
    setError("");
    setInfo("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // Se l'utente non e immediatamente loggato, Supabase tipicamente richiede conferma email.
      if (!data?.session) {
        setInfo("Registrazione completata. Controlla la tua email per confermare l'account.");
      }
    } catch (err) {
      setError(err?.message || "Errore di autenticazione");
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setInfo(
        "Controlla la tua email — ti abbiamo inviato un link per reimpostare la password."
      );
    } catch (err) {
      setError(err?.message || "Errore durante il recupero password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg)",
      }}
    >
      <style>{CSS}</style>

      <div className="modal" style={{ width: 520, padding: 28 }}>
        <div className="modal-title" style={{ marginBottom: 12 }}>
          {title}
        </div>
        {mode === "reset" ? (
          <>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
              Inserisci l&apos;email associata al tuo account: ti invieremo un link per
              reimpostare la password.
            </div>

            <form onSubmit={onResetSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="nome@dominio.com"
                />
              </div>

              {error && (
                <div
                  className="btn btn-danger"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginBottom: 12,
                    padding: "10px 12px",
                  }}
                >
                  {error}
                </div>
              )}

              {info && (
                <div
                  style={{
                    width: "100%",
                    border: "1px solid #C9A84C40",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "var(--muted)",
                    marginBottom: 12,
                    background: "#C9A84C12",
                    fontSize: 13,
                    lineHeight: 1.45,
                  }}
                >
                  {info}
                </div>
              )}

              <button
                className="btn btn-accent"
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "10px 16px",
                  opacity: loading ? 0.75 : 1,
                  marginBottom: 14,
                }}
              >
                {loading ? "Attendere..." : "Invia link di recupero"}
              </button>
            </form>

            <button type="button" className="auth-text-link" onClick={goToLogin}>
              Torna al login
            </button>
          </>
        ) : (
          <>
            <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
              {mode === "login"
                ? "Inserisci email e password per entrare."
                : "Crea un account usando email e password."}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <button
                type="button"
                className={mode === "login" ? "btn btn-accent" : "btn btn-ghost"}
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfo("");
                }}
                style={{ flex: 1, justifyContent: "center", padding: "8px 10px" }}
              >
                Accedi
              </button>
              <button
                type="button"
                className={mode === "register" ? "btn btn-accent" : "btn btn-ghost"}
                onClick={() => {
                  setMode("register");
                  setError("");
                  setInfo("");
                }}
                style={{ flex: 1, justifyContent: "center", padding: "8px 10px" }}
              >
                Registrati
              </button>
            </div>

            <form onSubmit={onSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="nome@dominio.com"
                />
              </div>

              <div style={{ marginBottom: mode === "login" ? 6 : 12 }}>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="********"
                />
              </div>

              {mode === "login" && (
                <div style={{ marginBottom: 12, textAlign: "left" }}>
                  <button type="button" className="auth-text-link" onClick={goToReset}>
                    Hai dimenticato la password?
                  </button>
                </div>
              )}

              {error && (
                <div
                  className="btn btn-danger"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginBottom: 12,
                    padding: "10px 12px",
                  }}
                >
                  {error}
                </div>
              )}

              {info && (
                <div
                  style={{
                    width: "100%",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "10px 12px",
                    color: "var(--muted)",
                    marginBottom: 12,
                    background: "rgba(59,130,246,0.08)",
                  }}
                >
                  {info}
                </div>
              )}

              <button
                className="btn btn-accent"
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "10px 16px",
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? "Attendere..." : mode === "login" ? "Accedi" : "Crea account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

