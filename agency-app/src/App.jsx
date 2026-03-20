import { useState, useMemo } from "react";

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
const INIT_ARTISTS = [
  { id: 1, name: "Marco Rossi", stageName: "Marco Rossi", email: "marco@example.com", phone: "+39 333 1234567",
    billing: { ragioneSociale: "Marco Rossi", piva: "IT12345678901", cf: "RSSMRC80A01H501Z", address: "Via Roma 12, 20121 Milano", iban: "IT60X0542811101000000123456", banca: "Banca Intesa" } },
  { id: 2, name: "Sara Bianchi", stageName: "Sara B.", email: "sara@example.com", phone: "+39 347 9876543",
    billing: { ragioneSociale: "Sara Bianchi Musica Srl", piva: "IT98765432109", cf: "BNCSAR85M41F205X", address: "Corso Vittorio 45, 10121 Torino", iban: "IT40X0200805182000401270213", banca: "UniCredit" } },
  { id: 3, name: "DJ Elektra", stageName: "Elektra", email: "elektra@management.it", phone: "+39 320 5551234",
    billing: { ragioneSociale: "Elektra Entertainment Ltd", piva: "IT11223344556", cf: "LTKLTR90T41Z114Y", address: "Via Torino 8, 20123 Milano", iban: "IT15A0200801618000104152264", banca: "Banco BPM" } }
];

const INIT_JOBS = [
  { id: 1, commessa: "AGY-2026-001", artistId: 1, description: "Concerto estate – Anfiteatro Romano", clientName: "Roma Estate Festival",
    clientBilling: { ragioneSociale: "Roma Estate Srl", piva: "IT44556677889", address: "Via del Corso 100, Roma" },
    date: "2026-07-15", cachet: 5000, costs: 500, jobStatus: "confermato", invoiceStatus: "emessa",
    invoiceNumber: "FT-2026-045", invoiceDate: "2026-06-15", dueDate: "2026-07-15", paidDate: null,
    notes: "Soundcheck ore 16:00, ingresso tecnici ore 14:00" },
  { id: 2, commessa: "AGY-2026-002", artistId: 2, description: "Evento corporate – Lancio prodotto Tech", clientName: "TechCorp Italia",
    clientBilling: { ragioneSociale: "TechCorp Italia SpA", piva: "IT55667788990", address: "Via Montenapoleone 5, Milano" },
    date: "2026-04-20", cachet: 3500, costs: 350, jobStatus: "completato", invoiceStatus: "pagata",
    invoiceNumber: "FT-2026-028", invoiceDate: "2026-04-25", dueDate: "2026-05-25", paidDate: "2026-05-20", notes: "" },
  { id: 3, commessa: "AGY-2026-003", artistId: 3, description: "DJ Set – Festival Elettronico Torino", clientName: "ElectroBeat Productions",
    clientBilling: { ragioneSociale: "ElectroBeat Productions Srl", piva: "IT66778899001", address: "Via Po 22, Torino" },
    date: "2026-08-05", cachet: 12000, costs: 1200, jobStatus: "confermato", invoiceStatus: "da_emettere",
    invoiceNumber: null, invoiceDate: null, dueDate: "2026-08-05", paidDate: null, notes: "Rider tecnico allegato. Volo da Milano incluso." },
  { id: 4, commessa: "AGY-2026-004", artistId: 1, description: "Radio Session – RTL 102.5", clientName: "RTL 102.5",
    clientBilling: { ragioneSociale: "RTL Radio Srl", piva: "IT12398745620", address: "Via Turati 29, Milano" },
    date: "2026-03-01", cachet: 1500, costs: 0, jobStatus: "completato", invoiceStatus: "scaduta",
    invoiceNumber: "FT-2026-012", invoiceDate: "2026-03-05", dueDate: "2026-04-05", paidDate: null, notes: "Fattura scaduta – sollecitare!" },
  { id: 5, commessa: "AGY-2026-005", artistId: 2, description: "Showcase privato – Wedding VIP", clientName: "Luxury Events Milano",
    clientBilling: { ragioneSociale: "Luxury Events Milano Srl", piva: "IT88990011223", address: "Via Brera 14, Milano" },
    date: "2026-06-10", cachet: 4200, costs: 420, jobStatus: "in_trattativa", invoiceStatus: "da_emettere",
    invoiceNumber: null, invoiceDate: null, dueDate: null, paidDate: null, notes: "In attesa di firma contratto" }
];

// ─── CONFIG ─────────────────────────────────────────────────────────────────
const JOB_STATUS = {
  in_trattativa: { label: "In trattativa", color: "#F59E0B", bg: "#F59E0B22" },
  confermato:    { label: "Confermato",    color: "#3B82F6", bg: "#3B82F622" },
  completato:    { label: "Completato",    color: "#10B981", bg: "#10B98122" },
  annullato:     { label: "Annullato",     color: "#EF4444", bg: "#EF444422" }
};
const INV_STATUS = {
  da_emettere: { label: "Da emettere", color: "#9CA3AF", bg: "#9CA3AF22" },
  emessa:      { label: "Emessa",      color: "#F59E0B", bg: "#F59E0B22" },
  pagata:      { label: "Pagata",      color: "#10B981", bg: "#10B98122" },
  scaduta:     { label: "⚠ SCADUTA",   color: "#EF4444", bg: "#EF444422" }
};

const fmt = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("it-IT") : "–";
const nextId = (arr) => Math.max(...arr.map(a => a.id), 0) + 1;
const nextCommessa = (jobs) => {
  const nums = jobs.map(j => parseInt(j.commessa.split("-")[2] || 0));
  return `AGY-2026-${String(Math.max(...nums, 0) + 1).padStart(3, "0")}`;
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
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
  select option { background: #1a2035; }
  .pill { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px; letter-spacing: .04em; }
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); padding: 8px 12px; border-bottom: 1px solid var(--border); }
  .table td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
  .table tr:hover td { background: #ffffff05; }
  .scrollbox { overflow-y: auto; max-height: calc(100vh - 200px); }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; border: none; transition: all .15s; }
  .btn-accent { background: var(--accent); color: #0C0E14; }
  .btn-accent:hover { background: var(--accent2); }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--dim); color: var(--text); }
  .btn-danger { background: #EF444420; color: var(--err); border: 1px solid #EF444440; }
  .btn-ok { background: #10B98120; color: var(--ok); border: 1px solid #10B98140; }
  .modal-overlay { position: fixed; inset: 0; background: #00000088; z-index: 100; display: flex; align-items: center; justify-content: center; }
  .modal { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 28px; width: 600px; max-width: 95vw; max-height: 90vh; overflow-y: auto; }
  .modal-title { font-family: var(--font-head); font-size: 22px; font-weight: 600; margin-bottom: 20px; color: var(--accent); }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-grid .full { grid-column: 1/-1; }
  .form-label { font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; display: block; }
  .section-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .section-head { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
  @media print {
    .no-print { display: none !important; }
    body { background: white; color: black; }
    .print-area { color: black; background: white; padding: 32px; }
  }
`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Sidebar({ view, setView, overdueCount }) {
  const items = [
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "artisti",   icon: "♩", label: "Artisti" },
    { id: "commesse",  icon: "◉", label: "Commesse" },
    { id: "statement", icon: "≡", label: "Statement" },
    { id: "pagamenti", icon: "€", label: "Pagamenti" },
  ];
  return (
    <aside style={{ width: 220, background: "var(--sidebar)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.04em" }}>AGENCY</div>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>Management Suite</div>
      </div>
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className="btn" style={{
            display: "flex", width: "100%", margin: "2px 0", borderRadius: 8, padding: "10px 12px",
            background: view === item.id ? "#C9A84C18" : "transparent",
            color: view === item.id ? "var(--accent)" : "var(--muted)",
            border: view === item.id ? "1px solid #C9A84C30" : "1px solid transparent",
            fontSize: 13, fontWeight: view === item.id ? 600 : 400, transition: "all .15s"
          }}>
            <span style={{ fontSize: 16, width: 22 }}>{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>
      {overdueCount > 0 && (
        <div onClick={() => setView("pagamenti")} style={{ margin: 12, padding: "10px 14px", background: "#EF444415", border: "1px solid #EF444430", borderRadius: 8, cursor: "pointer" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--err)", letterSpacing: ".06em" }}>⚠ ATTENZIONE</div>
          <div style={{ fontSize: 12, color: "#EF4444bb", marginTop: 3 }}>{overdueCount} fattur{overdueCount > 1 ? "e" : "a"} scadut{overdueCount > 1 ? "e" : "a"}</div>
        </div>
      )}
    </aside>
  );
}

function StatCard({ label, value, sub, color = "var(--accent)" }) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: "18px 22px", flex: 1, minWidth: 160 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Dashboard({ jobs, artists, setView }) {
  const paid = jobs.filter(j => j.invoiceStatus === "pagata");
  const pending = jobs.filter(j => j.invoiceStatus === "emessa");
  const overdue = jobs.filter(j => j.invoiceStatus === "scaduta");
  const totalRevenue = jobs.reduce((s, j) => s + j.cachet, 0);
  const totalPaid = paid.reduce((s, j) => s + j.cachet, 0);

  return (
    <div style={{ padding: 28 }}>
      <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Dashboard</div>
      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Riepilogo attività agenzia</div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Fatturato Totale" value={fmt(totalRevenue)} sub={`${jobs.length} commesse`} />
        <StatCard label="Incassato" value={fmt(totalPaid)} sub={`${paid.length} fatture pagate`} color="var(--ok)" />
        <StatCard label="In Attesa" value={fmt(pending.reduce((s,j) => s+j.cachet, 0))} sub={`${pending.length} emesse`} color="var(--warn)" />
        <StatCard label="Scadute" value={fmt(overdue.reduce((s,j) => s+j.cachet, 0))} sub={`${overdue.length} da sollecitare`} color="var(--err)" />
      </div>

      {overdue.length > 0 && (
        <div style={{ background: "#EF444410", border: "1px solid #EF444430", borderRadius: 10, padding: "14px 18px", marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: "var(--err)", fontSize: 13, marginBottom: 10 }}>⚠ FATTURE SCADUTE — Da sollecitare</div>
          {overdue.map(j => {
            const art = artists.find(a => a.id === j.artistId);
            return (
              <div key={j.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #EF444420" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{j.commessa}</span>
                  <span style={{ color: "var(--muted)", margin: "0 8px" }}>·</span>
                  <span>{j.description}</span>
                  <span style={{ color: "var(--muted)", margin: "0 8px" }}>·</span>
                  <span style={{ fontSize: 12 }}>Artista: <b>{art?.name}</b></span>
                </div>
                <div style={{ color: "var(--err)", fontWeight: 700 }}>{fmt(j.cachet)}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 600, marginBottom: 14 }}>Ultime Commesse</div>
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <table className="table">
          <thead><tr>
            <th>Commessa</th><th>Artista</th><th>Descrizione</th><th>Data</th><th>Cachet</th><th>Stato</th><th>Fattura</th>
          </tr></thead>
          <tbody>
            {[...jobs].sort((a,b) => b.id - a.id).slice(0, 5).map(j => {
              const art = artists.find(a => a.id === j.artistId);
              const js = JOB_STATUS[j.jobStatus] || {};
              const is = INV_STATUS[j.invoiceStatus] || {};
              return (
                <tr key={j.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>{j.commessa}</td>
                  <td>{art?.name}</td>
                  <td style={{ color: "var(--muted)" }}>{j.description}</td>
                  <td>{fmtDate(j.date)}</td>
                  <td style={{ fontWeight: 600 }}>{fmt(j.cachet)}</td>
                  <td><span className="pill" style={{ color: js.color, background: js.bg }}>{js.label}</span></td>
                  <td><span className="pill" style={{ color: is.color, background: is.bg }}>{is.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Artisti({ artists, jobs, setArtists }) {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(null);

  const openAdd = () => {
    setForm({ id: null, name: "", stageName: "", email: "", phone: "", billing: { ragioneSociale: "", piva: "", cf: "", address: "", iban: "", banca: "" } });
    setShowModal(true);
  };
  const openEdit = (a) => { setForm(JSON.parse(JSON.stringify(a))); setShowModal(true); };
  const save = () => {
    if (!form.name) return;
    if (form.id) setArtists(prev => prev.map(a => a.id === form.id ? form : a));
    else setArtists(prev => [...prev, { ...form, id: nextId(prev) }]);
    setShowModal(false);
  };
  const del = (id) => { setArtists(prev => prev.filter(a => a.id !== id)); if (selected?.id === id) setSelected(null); };

  const sel = selected ? artists.find(a => a.id === selected.id) : null;
  const artJobs = sel ? jobs.filter(j => j.artistId === sel.id) : [];
  const artBalance = artJobs.filter(j => j.invoiceStatus === "pagata").reduce((s, j) => s + (j.cachet - j.costs), 0);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* List */}
      <div style={{ width: 280, borderRight: "1px solid var(--border)", padding: 20, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700 }}>Artisti</div>
          <button className="btn btn-accent" onClick={openAdd} style={{ padding: "6px 12px", fontSize: 12 }}>+ Nuovo</button>
        </div>
        {artists.map(a => (
          <div key={a.id} onClick={() => setSelected(a)} style={{
            padding: "12px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 6,
            background: sel?.id === a.id ? "#C9A84C15" : "var(--card)",
            border: `1px solid ${sel?.id === a.id ? "#C9A84C40" : "var(--border)"}`,
            transition: "all .15s"
          }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{a.stageName !== a.name ? `"${a.stageName}"` : ""} · {a.email}</div>
          </div>
        ))}
      </div>

      {/* Detail */}
      <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {!sel ? (
          <div style={{ color: "var(--muted)", marginTop: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>♩</div>
            <div style={{ marginTop: 10, fontSize: 14 }}>Seleziona un artista</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 700 }}>{sel.name}</div>
                <div style={{ color: "var(--muted)" }}>{sel.email} · {sel.phone}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => openEdit(sel)}>✎ Modifica</button>
                <button className="btn btn-danger" onClick={() => del(sel.id)}>✕ Elimina</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <StatCard label="Lavori totali" value={artJobs.length} color="var(--info)" />
              <StatCard label="Incassato netto" value={fmt(artBalance)} color="var(--ok)" />
              <StatCard label="Scadute" value={artJobs.filter(j => j.invoiceStatus === "scaduta").length} color="var(--err)" />
            </div>

            <div className="section-card">
              <div className="section-head">Dati di Fatturazione</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Ragione Sociale", sel.billing.ragioneSociale],
                  ["P.IVA", sel.billing.piva],
                  ["Codice Fiscale", sel.billing.cf],
                  ["Indirizzo", sel.billing.address],
                  ["IBAN", sel.billing.iban],
                  ["Banca", sel.billing.banca],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 13, fontFamily: l === "IBAN" ? "monospace" : "inherit" }}>{v || "–"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <div className="section-head">Storico Commesse</div>
              {artJobs.length === 0 ? <div style={{ color: "var(--muted)" }}>Nessuna commessa</div> : (
                <table className="table">
                  <thead><tr><th>Commessa</th><th>Descrizione</th><th>Data</th><th>Cachet</th><th>Netto</th><th>Fattura</th></tr></thead>
                  <tbody>{artJobs.map(j => {
                    const is = INV_STATUS[j.invoiceStatus] || {};
                    return (
                      <tr key={j.id}>
                        <td style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>{j.commessa}</td>
                        <td>{j.description}</td>
                        <td>{fmtDate(j.date)}</td>
                        <td>{fmt(j.cachet)}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(j.cachet - j.costs)}</td>
                        <td><span className="pill" style={{ color: is.color, background: is.bg }}>{is.label}</span></td>
                      </tr>
                    );
                  })}</tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>

      {showModal && form && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{form.id ? "Modifica Artista" : "Nuovo Artista"}</div>
            <div style={{ marginBottom: 12 }}>
              <div className="section-head">Informazioni Generali</div>
              <div className="form-grid">
                {[["name","Nome Completo"],["stageName","Nome d'arte"],["email","Email"],["phone","Telefono"]].map(([k,l]) => (
                  <div key={k}>
                    <label className="form-label">{l}</label>
                    <input value={form[k] || ""} onChange={e => setForm({...form,[k]:e.target.value})} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="section-head" style={{ marginTop: 12 }}>Dati di Fatturazione</div>
              <div className="form-grid">
                {[["ragioneSociale","Ragione Sociale"],["piva","P.IVA"],["cf","Codice Fiscale"],["banca","Banca"],["iban","IBAN"],["address","Indirizzo"]].map(([k,l]) => (
                  <div key={k} className={k === "iban" || k === "address" ? "full" : ""}>
                    <label className="form-label">{l}</label>
                    <input value={form.billing[k] || ""} onChange={e => setForm({...form,billing:{...form.billing,[k]:e.target.value}})} />
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-accent" onClick={save}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Commesse({ jobs, artists, setJobs }) {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterArtist, setFilterArtist] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const emptyJob = { id: null, commessa: "", artistId: artists[0]?.id || 1, description: "", clientName: "",
    clientBilling: { ragioneSociale: "", piva: "", address: "" }, date: "", cachet: 0, costs: 0,
    jobStatus: "in_trattativa", invoiceStatus: "da_emettere", invoiceNumber: "", invoiceDate: "", dueDate: "", paidDate: "", notes: "" };
  const [form, setForm] = useState(emptyJob);

  const openAdd = () => { setForm({ ...emptyJob, commessa: nextCommessa(jobs) }); setShowModal(true); };
  const openEdit = (j) => { setForm(JSON.parse(JSON.stringify(j))); setShowModal(true); };
  const save = () => {
    const j = { ...form, cachet: parseFloat(form.cachet)||0, costs: parseFloat(form.costs)||0, artistId: parseInt(form.artistId) };
    if (!j.description) return;
    if (j.id) setJobs(prev => prev.map(x => x.id === j.id ? j : x));
    else setJobs(prev => [...prev, { ...j, id: nextId(prev) }]);
    setShowModal(false);
    setSelected(null);
  };
  const del = (id) => { setJobs(prev => prev.filter(j => j.id !== id)); setSelected(null); };
  const markPaid = (id) => setJobs(prev => prev.map(j => j.id === id ? { ...j, invoiceStatus: "pagata", paidDate: new Date().toISOString().split("T")[0] } : j));

  const filtered = jobs.filter(j => (filterArtist === "all" || j.artistId === parseInt(filterArtist)) && (filterStatus === "all" || j.invoiceStatus === filterStatus));
  const sel = selected ? jobs.find(j => j.id === selected) : null;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <div style={{ width: 400, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700 }}>Commesse</div>
            <button className="btn btn-accent" onClick={openAdd} style={{ padding: "6px 12px", fontSize: 12 }}>+ Nuova</button>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={filterArtist} onChange={e => setFilterArtist(e.target.value)} style={{ flex: 1, fontSize: 12, padding: "6px 10px" }}>
              <option value="all">Tutti gli artisti</option>
              {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ flex: 1, fontSize: 12, padding: "6px 10px" }}>
              <option value="all">Tutti gli stati</option>
              {Object.entries(INV_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {filtered.map(j => {
            const art = artists.find(a => a.id === j.artistId);
            const is = INV_STATUS[j.invoiceStatus] || {};
            const js = JOB_STATUS[j.jobStatus] || {};
            return (
              <div key={j.id} onClick={() => setSelected(j.id)} style={{
                padding: "12px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 6,
                background: sel?.id === j.id ? "#C9A84C10" : "var(--card)",
                border: `1px solid ${sel?.id === j.id ? "#C9A84C40" : j.invoiceStatus === "scaduta" ? "#EF444430" : "var(--border)"}`,
                transition: "all .15s"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--accent)" }}>{j.commessa}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{fmt(j.cachet)}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{j.description}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>{art?.name} · {j.clientName}</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="pill" style={{ color: js.color, background: js.bg, fontSize: 10 }}>{js.label}</span>
                  <span className="pill" style={{ color: is.color, background: is.bg, fontSize: 10 }}>{is.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
        {!sel ? (
          <div style={{ color: "var(--muted)", marginTop: 60, textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>◉</div><div style={{ marginTop: 10 }}>Seleziona una commessa</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 700 }}>{sel.description}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--accent)", marginTop: 2 }}>{sel.commessa}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sel.invoiceStatus !== "pagata" && <button className="btn btn-ok" onClick={() => markPaid(sel.id)}>✓ Segna Pagata</button>}
                <button className="btn btn-ghost" onClick={() => openEdit(sel)}>✎ Modifica</button>
                <button className="btn btn-danger" onClick={() => del(sel.id)}>✕</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <StatCard label="Cachet" value={fmt(sel.cachet)} />
              <StatCard label="Costi" value={fmt(sel.costs)} color="var(--warn)" />
              <StatCard label="Netto Artista" value={fmt(sel.cachet - sel.costs)} color="var(--ok)" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="section-card">
                <div className="section-head">Info Lavoro</div>
                {[["Artista", artists.find(a=>a.id===sel.artistId)?.name],["Cliente", sel.clientName],["Data Evento", fmtDate(sel.date)],["Stato", JOB_STATUS[sel.jobStatus]?.label]].map(([l,v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <span style={{ color: "var(--muted)" }}>{l}</span><span style={{ fontWeight: 500 }}>{v || "–"}</span>
                  </div>
                ))}
                {sel.notes && <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{sel.notes}</div>}
              </div>
              <div className="section-card">
                <div className="section-head">Fatturazione</div>
                {[["Stato Fattura", <span className="pill" style={{ color: INV_STATUS[sel.invoiceStatus]?.color, background: INV_STATUS[sel.invoiceStatus]?.bg }}>{INV_STATUS[sel.invoiceStatus]?.label}</span>],
                  ["N° Fattura", sel.invoiceNumber || "–"],["Data Fattura", fmtDate(sel.invoiceDate)],["Scadenza", fmtDate(sel.dueDate)],["Pagata il", fmtDate(sel.paidDate)]].map(([l,v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13, alignItems: "center" }}>
                    <span style={{ color: "var(--muted)" }}>{l}</span><span style={{ fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="section-card full">
                <div className="section-head">Dati Cliente</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[["Ragione Sociale", sel.clientBilling?.ragioneSociale],["P.IVA", sel.clientBilling?.piva],["Indirizzo", sel.clientBilling?.address]].map(([l,v]) => (
                    <div key={l}><div style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 2 }}>{l}</div><div style={{ fontSize: 13 }}>{v||"–"}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 680 }}>
            <div className="modal-title">{form.id ? "Modifica Commessa" : "Nuova Commessa"}</div>
            <div style={{ marginBottom: 14 }}>
              <div className="section-head">Info Lavoro</div>
              <div className="form-grid">
                <div><label className="form-label">N° Commessa</label><input value={form.commessa} onChange={e => setForm({...form,commessa:e.target.value})} /></div>
                <div><label className="form-label">Artista</label>
                  <select value={form.artistId} onChange={e => setForm({...form,artistId:parseInt(e.target.value)})}>
                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="full"><label className="form-label">Descrizione</label><input value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></div>
                <div><label className="form-label">Data Evento</label><input type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})} /></div>
                <div><label className="form-label">Stato</label>
                  <select value={form.jobStatus} onChange={e => setForm({...form,jobStatus:e.target.value})}>
                    {Object.entries(JOB_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div className="section-head" style={{ marginTop: 10 }}>Economici</div>
              <div className="form-grid">
                <div><label className="form-label">Cachet (€)</label><input type="number" value={form.cachet} onChange={e => setForm({...form,cachet:e.target.value})} /></div>
                <div><label className="form-label">Costi (€)</label><input type="number" value={form.costs} onChange={e => setForm({...form,costs:e.target.value})} /></div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div className="section-head" style={{ marginTop: 10 }}>Fatturazione</div>
              <div className="form-grid">
                <div><label className="form-label">Stato Fattura</label>
                  <select value={form.invoiceStatus} onChange={e => setForm({...form,invoiceStatus:e.target.value})}>
                    {Object.entries(INV_STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div><label className="form-label">N° Fattura</label><input value={form.invoiceNumber||""} onChange={e => setForm({...form,invoiceNumber:e.target.value})} /></div>
                <div><label className="form-label">Data Fattura</label><input type="date" value={form.invoiceDate||""} onChange={e => setForm({...form,invoiceDate:e.target.value})} /></div>
                <div><label className="form-label">Scadenza</label><input type="date" value={form.dueDate||""} onChange={e => setForm({...form,dueDate:e.target.value})} /></div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div className="section-head" style={{ marginTop: 10 }}>Cliente</div>
              <div className="form-grid">
                <div><label className="form-label">Nome Cliente</label><input value={form.clientName||""} onChange={e => setForm({...form,clientName:e.target.value})} /></div>
                <div><label className="form-label">P.IVA Cliente</label><input value={form.clientBilling?.piva||""} onChange={e => setForm({...form,clientBilling:{...form.clientBilling,piva:e.target.value}})} /></div>
                <div className="full"><label className="form-label">Ragione Sociale</label><input value={form.clientBilling?.ragioneSociale||""} onChange={e => setForm({...form,clientBilling:{...form.clientBilling,ragioneSociale:e.target.value}})} /></div>
                <div className="full"><label className="form-label">Indirizzo</label><input value={form.clientBilling?.address||""} onChange={e => setForm({...form,clientBilling:{...form.clientBilling,address:e.target.value}})} /></div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Note</label>
              <textarea rows={2} value={form.notes||""} onChange={e => setForm({...form,notes:e.target.value})} />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Annulla</button>
              <button className="btn btn-accent" onClick={save}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Statement({ jobs, artists }) {
  const [artistId, setArtistId] = useState("all");
  const [year, setYear] = useState("all");
  const [showPrint, setShowPrint] = useState(false);
  const [exportMsg, setExportMsg] = useState("");

  const filtered = jobs.filter(j =>
    (artistId === "all" || j.artistId === parseInt(artistId)) &&
    (year === "all" || j.date?.startsWith(year))
  );
  const artist = artistId !== "all" ? artists.find(a => a.id === parseInt(artistId)) : null;
  const totalCachet = filtered.reduce((s,j) => s+j.cachet, 0);
  const totalCosts = filtered.reduce((s,j) => s+j.costs, 0);
  const totalNet = totalCachet - totalCosts;
  const totalPaid = filtered.filter(j => j.invoiceStatus === "pagata").reduce((s,j) => s + (j.cachet - j.costs), 0);
  const years = [...new Set(jobs.map(j => j.date?.substring(0,4)).filter(Boolean))];

  const buildRows = () => filtered.map(j => {
    const art = artists.find(a => a.id === j.artistId);
    return {
      "Commessa": j.commessa,
      "Data Evento": j.date || "",
      "Artista": art?.name || "",
      "Descrizione": j.description,
      "Cliente": j.clientName,
      "P.IVA Cliente": j.clientBilling?.piva || "",
      "Cachet (€)": j.cachet,
      "Costi (€)": j.costs,
      "Netto (€)": j.cachet - j.costs,
      "Stato Lavoro": JOB_STATUS[j.jobStatus]?.label || j.jobStatus,
      "Stato Fattura": INV_STATUS[j.invoiceStatus]?.label || j.invoiceStatus,
      "N° Fattura": j.invoiceNumber || "",
      "Data Fattura": j.invoiceDate || "",
      "Scadenza": j.dueDate || "",
      "Data Pagamento": j.paidDate || "",
      "Note": j.notes || ""
    };
  });

  const exportCSV = () => {
    const rows = buildRows();
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const escape = v => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [
      headers.map(escape).join(","),
      ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
      "",
      `"TOTALE","","","","","",${totalCachet},${totalCosts},${totalNet},"","","","","","",""`
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const label = artist ? artist.name.replace(/\s+/g, "_") : "tutti";
    const periodo = year !== "all" ? `_${year}` : "";
    a.href = url; a.download = `statement_${label}${periodo}.csv`; a.click();
    URL.revokeObjectURL(url);
    setExportMsg("✓ CSV scaricato!"); setTimeout(() => setExportMsg(""), 3000);
  };

  const exportExcel = () => {
    const rows = buildRows();
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const esc = v => String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const isNum = v => typeof v === "number";
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; }
  table { border-collapse: collapse; width: 100%; }
  th { background-color: #1E2535; color: #C9A84C; font-weight: bold; padding: 6px 10px; border: 1px solid #ccc; text-align: left; }
  td { padding: 5px 10px; border: 1px solid #ddd; }
  tr:nth-child(even) td { background-color: #f9f9f9; }
  .num { text-align: right; }
  .tot { background-color: #FFF8E7; font-weight: bold; }
</style>
</head><body>
<h2 style="font-family:Georgia;color:#1E2535;">Statement — ${artist ? esc(artist.name) : "Tutti gli artisti"}</h2>
<p style="color:#888;font-size:11px;">Generato il ${new Date().toLocaleDateString("it-IT")}</p>
${artist ? `<p><b>Ragione Sociale:</b> ${esc(artist.billing.ragioneSociale)} &nbsp;|&nbsp; <b>P.IVA:</b> ${esc(artist.billing.piva)}</p>` : ""}
<table>
<thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead>
<tbody>
${rows.map(r => `<tr>${headers.map(h => `<td class="${isNum(r[h]) ? "num" : ""}">${esc(r[h])}</td>`).join("")}</tr>`).join("\n")}
<tr class="tot">
  <td colspan="6"><b>TOTALE</b></td>
  <td class="num"><b>${totalCachet.toLocaleString("it-IT", {minimumFractionDigits:2})} €</b></td>
  <td class="num"><b>${totalCosts.toLocaleString("it-IT", {minimumFractionDigits:2})} €</b></td>
  <td class="num"><b>${totalNet.toLocaleString("it-IT", {minimumFractionDigits:2})} €</b></td>
  ${headers.slice(9).map(() => "<td></td>").join("")}
</tr>
</tbody>
</table>
</body></html>`;
    const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const label = artist ? artist.name.replace(/\s+/g, "_") : "tutti";
    const periodo = year !== "all" ? `_${year}` : "";
    a.href = url; a.download = `statement_${label}${periodo}.xls`; a.click();
    URL.revokeObjectURL(url);
    setExportMsg("✓ Excel scaricato!"); setTimeout(() => setExportMsg(""), 3000);
  };

  const printContent = () => {
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Statement</title>
    <style>body{font-family:Georgia,serif;padding:40px;color:#111;}h1{font-size:28px;border-bottom:3px solid #C9A84C;padding-bottom:10px;}
    table{width:100%;border-collapse:collapse;margin:20px 0;}th{background:#f5f5f5;padding:8px;text-align:left;font-size:12px;}
    td{padding:8px;border-bottom:1px solid #eee;font-size:13px;}.total{font-weight:bold;background:#f9f9f9;}</style></head><body>
    <h1>Statement ${artist ? `— ${artist.name}` : "Tutti gli artisti"}</h1>
    <p style="color:#888;font-size:13px">Generato il ${new Date().toLocaleDateString("it-IT")}</p>
    ${artist ? `<p><b>Ragione Sociale:</b> ${artist.billing.ragioneSociale} | <b>P.IVA:</b> ${artist.billing.piva}</p>` : ""}
    <table><thead><tr><th>Commessa</th><th>Data</th><th>Descrizione</th><th>Cliente</th><th>Cachet</th><th>Costi</th><th>Netto</th><th>Fattura</th></tr></thead>
    <tbody>${filtered.map(j => `<tr><td>${j.commessa}</td><td>${fmtDate(j.date)}</td><td>${j.description}</td><td>${j.clientName}</td>
    <td>€${j.cachet.toLocaleString("it-IT")}</td><td>€${j.costs.toLocaleString("it-IT")}</td><td><b>€${(j.cachet-j.costs).toLocaleString("it-IT")}</b></td>
    <td>${INV_STATUS[j.invoiceStatus]?.label || j.invoiceStatus}</td></tr>`).join("")}
    <tr class="total"><td colspan="4">TOTALE</td><td>€${totalCachet.toLocaleString("it-IT")}</td><td>€${totalCosts.toLocaleString("it-IT")}</td><td>€${totalNet.toLocaleString("it-IT")}</td><td></td></tr>
    </tbody></table><p><b>Totale incassato (pagato):</b> €${totalPaid.toLocaleString("it-IT")}</p>
    </body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 700 }}>Statement</div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>Riepilogo commesse per artista</div>
        </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {exportMsg && <span style={{ fontSize: 12, color: "var(--ok)", fontWeight: 600 }}>{exportMsg}</span>}
            <button className="btn btn-ghost" onClick={exportCSV}>⬇ CSV</button>
            <button className="btn btn-ghost" onClick={exportExcel}>⬇ Excel</button>
            <button className="btn btn-accent" onClick={printContent}>⎙ Stampa / PDF</button>
          </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <select value={artistId} onChange={e => setArtistId(e.target.value)} style={{ width: 220 }}>
          <option value="all">Tutti gli artisti</option>
          {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} style={{ width: 120 }}>
          <option value="all">Tutti gli anni</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {artist && (
        <div className="section-card" style={{ marginBottom: 20 }}>
          <div className="section-head">Artista</div>
          <div style={{ display: "flex", gap: 40 }}>
            <div><div style={{ fontSize: 22, fontFamily: "var(--font-head)", fontWeight: 700 }}>{artist.name}</div><div style={{ color: "var(--muted)", fontSize: 13 }}>{artist.email}</div></div>
            <div><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>P.IVA</div><div style={{ fontFamily: "monospace" }}>{artist.billing.piva}</div></div>
            <div><div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em" }}>IBAN</div><div style={{ fontFamily: "monospace", fontSize: 12 }}>{artist.billing.iban}</div></div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <StatCard label="Cachet Lordo" value={fmt(totalCachet)} sub={`${filtered.length} lavori`} />
        <StatCard label="Costi Totali" value={fmt(totalCosts)} color="var(--warn)" />
        <StatCard label="Netto Artista" value={fmt(totalNet)} color="var(--ok)" />
        <StatCard label="Già Incassato" value={fmt(totalPaid)} color="var(--info)" />
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
        <table className="table">
          <thead><tr>
            <th>Commessa</th><th>Data</th><th>Descrizione</th><th>Cliente</th>
            {artistId === "all" && <th>Artista</th>}
            <th>Cachet</th><th>Costi</th><th>Netto</th><th>Stato Fattura</th>
          </tr></thead>
          <tbody>
            {filtered.map(j => {
              const is = INV_STATUS[j.invoiceStatus] || {};
              const art = artists.find(a => a.id === j.artistId);
              return (
                <tr key={j.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--accent)" }}>{j.commessa}</td>
                  <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{fmtDate(j.date)}</td>
                  <td>{j.description}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{j.clientName}</td>
                  {artistId === "all" && <td style={{ fontSize: 12 }}>{art?.name}</td>}
                  <td style={{ fontWeight: 600 }}>{fmt(j.cachet)}</td>
                  <td style={{ color: "var(--muted)" }}>{fmt(j.costs)}</td>
                  <td style={{ fontWeight: 700, color: "var(--ok)" }}>{fmt(j.cachet - j.costs)}</td>
                  <td><span className="pill" style={{ color: is.color, background: is.bg }}>{is.label}</span></td>
                </tr>
              );
            })}
            <tr style={{ background: "#C9A84C0A" }}>
              <td colSpan={artistId === "all" ? 5 : 4} style={{ fontWeight: 700, paddingLeft: 12 }}>TOTALE</td>
              <td style={{ fontWeight: 700 }}>{fmt(totalCachet)}</td>
              <td style={{ fontWeight: 700, color: "var(--warn)" }}>{fmt(totalCosts)}</td>
              <td style={{ fontWeight: 700, color: "var(--ok)" }}>{fmt(totalNet)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Pagamenti({ jobs, artists, setJobs }) {
  const overdue = jobs.filter(j => j.invoiceStatus === "scaduta");
  const pending = jobs.filter(j => j.invoiceStatus === "emessa");
  const toIssue = jobs.filter(j => j.invoiceStatus === "da_emettere" && j.jobStatus !== "annullato");
  const paid = jobs.filter(j => j.invoiceStatus === "pagata");

  const markPaid = (id) => setJobs(prev => prev.map(j => j.id === id ? { ...j, invoiceStatus: "pagata", paidDate: new Date().toISOString().split("T")[0] } : j));

  const PayRow = ({ j, showPay }) => {
    const art = artists.find(a => a.id === j.artistId);
    const is = INV_STATUS[j.invoiceStatus] || {};
    return (
      <tr>
        <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--accent)" }}>{j.commessa}</td>
        <td style={{ fontSize: 12 }}>{art?.name}</td>
        <td>{j.description}</td>
        <td style={{ fontSize: 12, color: "var(--muted)" }}>{j.invoiceNumber || "–"}</td>
        <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{fmtDate(j.dueDate)}</td>
        <td style={{ fontWeight: 700 }}>{fmt(j.cachet)}</td>
        <td><span className="pill" style={{ color: is.color, background: is.bg }}>{is.label}</span></td>
        {showPay && <td><button className="btn btn-ok" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => markPaid(j.id)}>✓ Pagata</button></td>}
        {!showPay && <td style={{ fontSize: 12, color: "var(--muted)" }}>{fmtDate(j.paidDate)}</td>}
      </tr>
    );
  };

  const Section = ({ title, items, color, showPay, empty }) => (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 600, color }}>{title}</div>
        <span className="pill" style={{ color, background: color + "22" }}>{items.length}</span>
        {items.length > 0 && <span style={{ color: "var(--muted)", fontSize: 12 }}>→ {fmt(items.reduce((s,j) => s+j.cachet, 0))}</span>}
      </div>
      {items.length === 0 ? <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>{empty}</div> : (
        <div style={{ background: "var(--card)", border: `1px solid ${color}30`, borderRadius: 10, overflow: "hidden" }}>
          <table className="table">
            <thead><tr><th>Commessa</th><th>Artista</th><th>Descrizione</th><th>N° Fattura</th><th>Scadenza</th><th>Importo</th><th>Stato</th><th>{showPay ? "Azione" : "Pagata il"}</th></tr></thead>
            <tbody>{items.map(j => <PayRow key={j.id} j={j} showPay={showPay} />)}</tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: 28, overflowY: "auto", height: "100vh" }}>
      <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Pagamenti</div>
      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Tracking fatture e solleciti</div>

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Scadute" value={fmt(overdue.reduce((s,j) => s+j.cachet,0))} sub={`${overdue.length} da sollecitare`} color="var(--err)" />
        <StatCard label="In Attesa" value={fmt(pending.reduce((s,j) => s+j.cachet,0))} sub={`${pending.length} emesse`} color="var(--warn)" />
        <StatCard label="Da Emettere" value={fmt(toIssue.reduce((s,j) => s+j.cachet,0))} sub={`${toIssue.length} lavori`} color="var(--muted)" />
        <StatCard label="Incassato" value={fmt(paid.reduce((s,j) => s+j.cachet,0))} sub={`${paid.length} pagate`} color="var(--ok)" />
      </div>

      <Section title="⚠ Fatture Scadute" items={overdue} color="var(--err)" showPay={true} empty="Nessuna fattura scaduta ✓" />
      <Section title="Fatture Emesse" items={pending} color="var(--warn)" showPay={true} empty="Nessuna fattura in attesa" />
      <Section title="Da Emettere" items={toIssue} color="var(--muted)" showPay={false} empty="Tutte le fatture sono emesse" />
      <Section title="✓ Pagate" items={paid} color="var(--ok)" showPay={false} empty="Nessuna fattura pagata" />
    </div>
  );
}

// ─── APP SHELL ───────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [artists, setArtists] = useState(INIT_ARTISTS);
  const [jobs, setJobs] = useState(INIT_JOBS);
  const overdueCount = jobs.filter(j => j.invoiceStatus === "scaduta").length;

  return (
    <div style={{ display: "flex", background: "var(--bg)", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <style>{CSS}</style>
      <Sidebar view={view} setView={setView} overdueCount={overdueCount} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {view === "dashboard" && <Dashboard jobs={jobs} artists={artists} setView={setView} />}
        {view === "artisti"   && <Artisti jobs={jobs} artists={artists} setArtists={setArtists} />}
        {view === "commesse"  && <Commesse jobs={jobs} artists={artists} setJobs={setJobs} />}
        {view === "statement" && <Statement jobs={jobs} artists={artists} />}
        {view === "pagamenti" && <Pagamenti jobs={jobs} artists={artists} setJobs={setJobs} />}
      </div>
    </div>
  );
}
