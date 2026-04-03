import { useState, useEffect } from "react";

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const SOURCES = ["Airbnb","Téléphone","WhatsApp","Autre"];
const PAYMENTS = ["Airbnb","PayPal","Virement","Espèces","Autre"];
const STATUSES = ["Confirmée","En attente","Acompte reçu","Payée","Annulée"];

const DEFAULT_APTS = [
  { id: "apt1", name: "Appartement Alger Centre", color: "#E07A5F" },
  { id: "apt2", name: "Appartement Bab Ezzouar", color: "#3D85C6" },
  { id: "apt3", name: "Studio Oran", color: "#81B29A" },
];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function parseDate(s) { return s ? new Date(s + "T00:00:00") : null; }
function fmtDate(d) { return d.toISOString().slice(0, 10); }
function fmtDateFR(s) {
  if (!s) return "";
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0,3)}`;
}
function daysBetween(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / 86400000);
}
function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function saveData(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) { console.error(e); }
}

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const btnPrimary = {
  padding:"10px 20px", borderRadius:10, border:"none", cursor:"pointer",
  background:"#E07A5F", color:"#fff", fontWeight:600, fontSize:13, fontFamily:"inherit",
  transition:"transform .1s", boxShadow:"0 2px 8px rgba(224,122,95,.3)"
};
const btnSecondary = {
  padding:"10px 20px", borderRadius:10, border:"1px solid #ddd", cursor:"pointer",
  background:"#fff", color:"#555", fontWeight:600, fontSize:13, fontFamily:"inherit"
};
const smallBtn = {
  padding:"5px 10px", borderRadius:6, border:"1px solid #eee", cursor:"pointer",
  background:"#fff", fontSize:12, fontFamily:"inherit", color:"#555"
};
const navBtn = {
  padding:"8px 14px", borderRadius:8, border:"1px solid #eee", cursor:"pointer",
  background:"#fff", fontSize:16, fontFamily:"inherit"
};
const inputStyle = {
  width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #ddd",
  fontSize:13, fontFamily:"inherit", boxSizing:"border-box", outline:"none",
  transition:"border .2s"
};
const selectStyle = {
  padding:"7px 12px", borderRadius:8, border:"1px solid #ddd",
  fontSize:12, fontFamily:"inherit", background:"#fff", cursor:"pointer", outline:"none"
};

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [apts, setApts] = useState(() => loadData("resa-apts", DEFAULT_APTS));
  const [reservations, setReservations] = useState(() => loadData("resa-bookings", []));
  const [view, setView] = useState("calendar");
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [showForm, setShowForm] = useState(false);
  const [editingRes, setEditingRes] = useState(null);
  const [showAptForm, setShowAptForm] = useState(false);
  const [filterApt, setFilterApt] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { saveData("resa-apts", apts); }, [apts]);
  useEffect(() => { saveData("resa-bookings", reservations); }, [reservations]);

  const addReservation = (r) => {
    if (editingRes) {
      setReservations(prev => prev.map(x => x.id === editingRes.id ? { ...r, id: editingRes.id } : x));
    } else {
      setReservations(prev => [...prev, { ...r, id: generateId() }]);
    }
    setShowForm(false); setEditingRes(null);
  };
  const deleteReservation = (id) => setReservations(prev => prev.filter(x => x.id !== id));
  const addApt = (apt) => { setApts(prev => [...prev, { ...apt, id: generateId() }]); setShowAptForm(false); };
  const deleteApt = (id) => { setApts(prev => prev.filter(x => x.id !== id)); setReservations(prev => prev.filter(x => x.aptId !== id)); };

  const filtered = reservations.filter(r => {
    if (filterApt !== "all" && r.aptId !== filterApt) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });
  const getResForDay = (dateStr) => filtered.filter(r => r.checkin <= dateStr && r.checkout > dateStr);

  const now = fmtDate(new Date());
  const activeRes = reservations.filter(r => r.checkin <= now && r.checkout > now);
  const upcomingRes = reservations.filter(r => r.checkin > now && r.status !== "Annulée");
  const pendingPayments = reservations.filter(r => r.status === "En attente" || r.status === "Acompte reçu");
  const thisMonthRevenue = reservations.filter(r => {
    const d = parseDate(r.checkin);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear() && r.status !== "Annulée";
  }).reduce((s, r) => s + (Number(r.price) || 0), 0);

  return (
    <div style={{ fontFamily:"'DM Sans', sans-serif", background:"#FAFAF8", minHeight:"100vh", color:"#2D2D2D" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <header style={{ background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding:"20px 24px", color:"#fff" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
            <div>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, margin:0, fontWeight:700, letterSpacing:"-0.02em" }}>
                🏠 Gestion Réservations
              </h1>
              <p style={{ margin:"4px 0 0", fontSize:13, opacity:.7 }}>
                {apts.length} appartement{apts.length>1?"s":""} · {reservations.filter(r=>r.status!=="Annulée").length} réservation{reservations.length>1?"s":""}
              </p>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <button onClick={() => { setEditingRes(null); setShowForm(true); }} style={btnPrimary}>+ Réservation</button>
              <button onClick={() => setShowAptForm(true)} style={btnSecondary}>+ Appartement</button>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:10, marginTop:16 }}>
            <StatCard label="En cours" value={activeRes.length} icon="🔑" />
            <StatCard label="À venir" value={upcomingRes.length} icon="📅" />
            <StatCard label="Paiements en attente" value={pendingPayments.length} icon="⏳" />
            <StatCard label="Revenu ce mois" value={`${thisMonthRevenue.toLocaleString("fr-FR")} €`} icon="💰" />
          </div>
        </div>
      </header>

      {/* ── Nav ── */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 24px 0" }}>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
          {[["calendar","📅 Calendrier"],["list","📋 Liste"],["apts","🏢 Appartements"]].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding:"8px 16px", borderRadius:8, border:"none", cursor:"pointer", fontSize:13, fontWeight:600,
              background: view===v ? "#1a1a2e" : "#fff", color: view===v ? "#fff" : "#666",
              boxShadow: view===v ? "none" : "0 1px 3px rgba(0,0,0,.08)", transition:"all .2s"
            }}>{label}</button>
          ))}
          <div style={{ flex:1 }} />
          {view !== "apts" && (
            <>
              <select value={filterApt} onChange={e => setFilterApt(e.target.value)} style={selectStyle}>
                <option value="all">Tous les apparts</option>
                {apts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                <option value="all">Tous les statuts</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth:1100, margin:"0 auto", padding:"16px 24px 40px" }}>
        {view === "calendar" && (
          <CalendarView year={calYear} month={calMonth} setYear={setCalYear} setMonth={setCalMonth}
            getResForDay={getResForDay} apts={apts} selectedDay={selectedDay} setSelectedDay={setSelectedDay}
            onEdit={(r) => { setEditingRes(r); setShowForm(true); }} onDelete={deleteReservation} />
        )}
        {view === "list" && (
          <ListView reservations={filtered} apts={apts}
            onEdit={(r) => { setEditingRes(r); setShowForm(true); }} onDelete={deleteReservation}
            onStatusChange={(id, status) => setReservations(prev => prev.map(x => x.id === id ? {...x, status} : x))} />
        )}
        {view === "apts" && <AptsView apts={apts} reservations={reservations} onDelete={deleteApt} />}
      </main>

      {showForm && (
        <Modal onClose={() => { setShowForm(false); setEditingRes(null); }}>
          <ReservationForm apts={apts} onSubmit={addReservation} initial={editingRes}
            onCancel={() => { setShowForm(false); setEditingRes(null); }} />
        </Modal>
      )}
      {showAptForm && (
        <Modal onClose={() => setShowAptForm(false)}>
          <AptForm onSubmit={addApt} onCancel={() => setShowAptForm(false)} />
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */
function StatCard({ label, value, icon }) {
  return (
    <div style={{ background:"rgba(255,255,255,.1)", borderRadius:10, padding:"12px 14px", backdropFilter:"blur(10px)" }}>
      <div style={{ fontSize:18, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:20, fontWeight:700 }}>{value}</div>
      <div style={{ fontSize:11, opacity:.7, marginTop:2 }}>{label}</div>
    </div>
  );
}

function CalendarView({ year, month, setYear, setMonth, getResForDay, apts, selectedDay, setSelectedDay, onEdit, onDelete }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = fmtDate(new Date());
  const prev = () => { if (month === 0) { setMonth(11); setYear(year-1); } else setMonth(month-1); setSelectedDay(null); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year+1); } else setMonth(month+1); setSelectedDay(null); };
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selDateStr = selectedDay ? `${year}-${String(month+1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}` : null;
  const selRes = selDateStr ? getResForDay(selDateStr) : [];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <button onClick={prev} style={navBtn}>←</button>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, margin:0 }}>{MONTHS_FR[month]} {year}</h2>
        <button onClick={next} style={navBtn}>→</button>
      </div>
      <div style={{ background:"#fff", borderRadius:14, boxShadow:"0 2px 12px rgba(0,0,0,.06)", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)" }}>
          {DAYS_FR.map(d => (
            <div key={d} style={{ padding:"10px 4px", textAlign:"center", fontSize:11, fontWeight:600, color:"#999", borderBottom:"1px solid #f0f0f0" }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={{ borderBottom:"1px solid #f5f5f5" }} />;
            const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayRes = getResForDay(dateStr);
            const isToday = dateStr === today;
            const isSel = day === selectedDay;
            return (
              <div key={day} onClick={() => setSelectedDay(day === selectedDay ? null : day)} style={{
                padding:"6px 4px", minHeight:64, cursor:"pointer", borderBottom:"1px solid #f5f5f5",
                borderRight: (i+1)%7!==0 ? "1px solid #f8f8f8" : "none",
                background: isSel ? "#f0f4ff" : isToday ? "#FFFDF5" : "transparent", transition:"background .15s"
              }}>
                <div style={{ fontSize:12, fontWeight: isToday ? 700 : 500, marginBottom:3, textAlign:"center",
                  color: isToday ? "#E07A5F" : isSel ? "#1a1a2e" : "#555" }}>{day}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  {dayRes.slice(0, 3).map(r => {
                    const apt = apts.find(a => a.id === r.aptId);
                    return (
                      <div key={r.id} style={{ background: apt?.color || "#ccc", color:"#fff", fontSize:9, fontWeight:600,
                        padding:"2px 4px", borderRadius:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {r.guest}
                      </div>
                    );
                  })}
                  {dayRes.length > 3 && <div style={{ fontSize:9, color:"#999", textAlign:"center" }}>+{dayRes.length-3}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {selectedDay && (
        <div style={{ marginTop:16, background:"#fff", borderRadius:14, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,.06)" }}>
          <h3 style={{ margin:"0 0 12px", fontSize:15, fontWeight:600 }}>
            {selectedDay} {MONTHS_FR[month]} {year} — {selRes.length === 0 ? "Aucune réservation" : `${selRes.length} réservation(s)`}
          </h3>
          {selRes.map(r => <ResCard key={r.id} r={r} apts={apts} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

function ListView({ reservations, apts, onEdit, onDelete, onStatusChange }) {
  const sorted = [...reservations].sort((a,b) => b.checkin.localeCompare(a.checkin));
  if (sorted.length === 0) return <EmptyState text="Aucune réservation trouvée" />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {sorted.map(r => <ResCard key={r.id} r={r} apts={apts} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} showStatus />)}
    </div>
  );
}

function ResCard({ r, apts, onEdit, onDelete, onStatusChange, showStatus }) {
  const apt = apts.find(a => a.id === r.aptId);
  const nights = daysBetween(r.checkin, r.checkout);
  const statusColor = { "Confirmée":"#81B29A", "En attente":"#F2CC8F", "Acompte reçu":"#E07A5F", "Payée":"#3D85C6", "Annulée":"#ccc" };
  return (
    <div style={{ background:"#fff", borderRadius:12, padding:16, boxShadow:"0 1px 6px rgba(0,0,0,.05)",
      borderLeft:`4px solid ${apt?.color || "#ccc"}`, display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:15 }}>{r.guest}</div>
          <div style={{ fontSize:12, color:"#888", marginTop:2 }}>
            {apt?.name || "?"} · {fmtDateFR(r.checkin)} → {fmtDateFR(r.checkout)} ({nights} nuit{nights>1?"s":""})
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ background: statusColor[r.status] || "#eee", color: r.status==="Annulée"?"#888":"#fff",
            padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}>{r.status}</span>
          <SourceBadge source={r.source} />
        </div>
      </div>
      <div style={{ display:"flex", gap:16, fontSize:12, color:"#666", flexWrap:"wrap" }}>
        <span>💰 {Number(r.price || 0).toLocaleString("fr-FR")} €</span>
        <span>💳 {r.payment}</span>
        {r.phone && <span>📞 {r.phone}</span>}
        {r.guests && <span>👥 {r.guests} pers.</span>}
      </div>
      {r.notes && <div style={{ fontSize:12, color:"#888", fontStyle:"italic" }}>📝 {r.notes}</div>}
      <div style={{ display:"flex", gap:6, marginTop:4, flexWrap:"wrap" }}>
        <button onClick={() => onEdit(r)} style={smallBtn}>✏️ Modifier</button>
        <button onClick={() => { if (confirm("Supprimer cette réservation ?")) onDelete(r.id); }} style={{ ...smallBtn, color:"#E07A5F" }}>🗑</button>
        {showStatus && onStatusChange && (
          <select value={r.status} onChange={e => onStatusChange(r.id, e.target.value)} style={{ ...selectStyle, fontSize:11, padding:"4px 8px" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}

function SourceBadge({ source }) {
  const colors = { "Airbnb":"#FF5A5F", "Téléphone":"#3D85C6", "WhatsApp":"#25D366", "Autre":"#999" };
  return <span style={{ background: colors[source] || "#999", color:"#fff", padding:"3px 8px", borderRadius:20, fontSize:10, fontWeight:600 }}>{source}</span>;
}

function AptsView({ apts, reservations, onDelete }) {
  if (apts.length === 0) return <EmptyState text="Aucun appartement ajouté" />;
  const now = fmtDate(new Date());
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:14 }}>
      {apts.map(a => {
        const aptRes = reservations.filter(r => r.aptId === a.id && r.status !== "Annulée");
        const active = aptRes.filter(r => r.checkin <= now && r.checkout > now);
        const upcoming = aptRes.filter(r => r.checkin > now).length;
        const revenue = aptRes.reduce((s,r) => s + (Number(r.price)||0), 0);
        return (
          <div key={a.id} style={{ background:"#fff", borderRadius:14, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,.06)", borderTop:`4px solid ${a.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:700 }}>{a.name}</h3>
                <div style={{ display:"flex", gap:10, fontSize:12, color:"#666" }}>
                  <span>{active.length > 0 ? "🟢 Occupé" : "⚪ Libre"}</span>
                  <span>📅 {upcoming} à venir</span>
                </div>
                <div style={{ marginTop:8, fontSize:13, fontWeight:600, color:a.color }}>💰 {revenue.toLocaleString("fr-FR")} € total</div>
              </div>
              <button onClick={() => { if (confirm(`Supprimer "${a.name}" et toutes ses réservations ?`)) onDelete(a.id); }}
                style={{ ...smallBtn, color:"#E07A5F", fontSize:16, padding:4 }}>🗑</button>
            </div>
            {active.length > 0 && (
              <div style={{ marginTop:12, padding:10, background:"#f8fdf8", borderRadius:8, fontSize:12 }}>
                <strong>Client actuel :</strong> {active[0].guest} — jusqu'au {fmtDateFR(active[0].checkout)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReservationForm({ apts, onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(initial || {
    aptId: apts[0]?.id || "", guest:"", phone:"", checkin:"", checkout:"",
    source:"Airbnb", payment:"Airbnb", price:"", status:"Confirmée", guests:"", notes:""
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const handleSourceChange = (source) => {
    set("source", source);
    if (source === "Airbnb") set("payment", "Airbnb");
    else if (form.payment === "Airbnb") set("payment", "PayPal");
  };
  const valid = form.aptId && form.guest && form.checkin && form.checkout && form.checkout > form.checkin;
  const nights = form.checkin && form.checkout && form.checkout > form.checkin ? daysBetween(form.checkin, form.checkout) : 0;

  return (
    <div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", margin:"0 0 20px", fontSize:20 }}>
        {initial ? "Modifier la réservation" : "Nouvelle réservation"}
      </h2>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <Field label="Appartement" full>
          <select value={form.aptId} onChange={e => set("aptId", e.target.value)} style={inputStyle}>
            {apts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Nom du client">
          <input value={form.guest} onChange={e => set("guest", e.target.value)} style={inputStyle} placeholder="Nom complet" />
        </Field>
        <Field label="Téléphone">
          <input value={form.phone} onChange={e => set("phone", e.target.value)} style={inputStyle} placeholder="+213..." />
        </Field>
        <Field label="Nombre de personnes">
          <input type="number" value={form.guests} onChange={e => set("guests", e.target.value)} style={inputStyle} min="1" />
        </Field>
        <Field label="Check-in">
          <input type="date" value={form.checkin} onChange={e => set("checkin", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Check-out">
          <input type="date" value={form.checkout} onChange={e => set("checkout", e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Source">
          <select value={form.source} onChange={e => handleSourceChange(e.target.value)} style={inputStyle}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Mode de paiement">
          <select value={form.payment} onChange={e => set("payment", e.target.value)} style={inputStyle}>
            {PAYMENTS.map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Prix total (€)">
          <input type="number" value={form.price} onChange={e => set("price", e.target.value)} style={inputStyle} placeholder="Ex: 250" />
        </Field>
        <Field label="Statut">
          <select value={form.status} onChange={e => set("status", e.target.value)} style={inputStyle}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Notes" full>
          <textarea value={form.notes} onChange={e => set("notes", e.target.value)} style={{ ...inputStyle, minHeight:60, resize:"vertical" }} placeholder="Infos supplémentaires..." />
        </Field>
      </div>
      {nights > 0 && (
        <div style={{ marginTop:12, padding:10, background:"#f8f8ff", borderRadius:8, fontSize:13, color:"#555" }}>
          📅 {nights} nuit(s) {form.price ? `· ${Math.round(form.price / nights).toLocaleString("fr-FR")} €/nuit` : ""}
        </div>
      )}
      <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Annuler</button>
        <button onClick={() => valid && onSubmit(form)} disabled={!valid}
          style={{ ...btnPrimary, opacity: valid ? 1 : .5, cursor: valid ? "pointer" : "not-allowed" }}>
          {initial ? "Sauvegarder" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}

function AptForm({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#E07A5F");
  const colors = ["#E07A5F","#3D85C6","#81B29A","#F2CC8F","#9B72AA","#F4845F","#577590","#264653"];
  return (
    <div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", margin:"0 0 20px", fontSize:20 }}>Nouvel appartement</h2>
      <Field label="Nom de l'appartement" full>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Ex: Studio Alger Centre" />
      </Field>
      <Field label="Couleur" full>
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          {colors.map(c => (
            <div key={c} onClick={() => setColor(c)} style={{
              width:32, height:32, borderRadius:"50%", background:c, cursor:"pointer",
              border: color === c ? "3px solid #1a1a2e" : "3px solid transparent", transition:"border .15s"
            }} />
          ))}
        </div>
      </Field>
      <div style={{ display:"flex", gap:10, marginTop:20, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Annuler</button>
        <button onClick={() => name.trim() && onSubmit({ name: name.trim(), color })} disabled={!name.trim()}
          style={{ ...btnPrimary, opacity: name.trim() ? 1 : .5 }}>Ajouter</button>
      </div>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center",
      zIndex:1000, padding:16, backdropFilter:"blur(4px)"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:"#fff", borderRadius:16, padding:24, maxWidth:520, width:"100%",
        maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,.2)"
      }}>{children}</div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined, marginBottom:4 }}>
      <label style={{ fontSize:12, fontWeight:600, color:"#666", marginBottom:4, display:"block" }}>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign:"center", padding:60, color:"#bbb", fontSize:15 }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📭</div>{text}
    </div>
  );
}
