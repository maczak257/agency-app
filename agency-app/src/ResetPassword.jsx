import { useEffect, useRef, useState } from "react";
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
  .btn-danger { background: #EF444420; color: var(--err); border: 1px solid #EF444440; }
  .modal { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 28px; width: 600px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-family: var(--font-head); font-size: 22px; font-weight: 600; margin-bottom: 20px; color: var(--accent); }
  .form-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; display: block; }
`;

export default function ResetPassword({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Le password non coincidono.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      redirectTimerRef.current = setTimeout(async () => {
        try {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search
          );
          await supabase.auth.signOut();
        } finally {
          onComplete?.();
        }
      }, 2000);
    } catch (err) {
      setError(err?.message || "Impossibile aggiornare la password.");
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
          Nuova Password
        </div>
        <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
          Scegli una nuova password per il tuo account.
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Nuova password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="********"
              disabled={success}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Conferma password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="********"
              disabled={success}
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

          {success && (
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
              }}
            >
              Password aggiornata!
            </div>
          )}

          <button
            className="btn btn-accent"
            type="submit"
            disabled={loading || success}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "10px 16px",
              opacity: loading || success ? 0.75 : 1,
            }}
          >
            {loading ? "Attendere..." : "Salva nuova password"}
          </button>
        </form>
      </div>
    </div>
  );
}
