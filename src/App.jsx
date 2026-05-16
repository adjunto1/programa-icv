import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebase';
import { ref, onValue, set } from 'firebase/database';

/* ─── CORES ───────────────────────────────────────────────────────────────── */
const C = {
  bg:       '#0C0A1E',
  surface:  '#13102E',
  card:     '#1A1640',
  cardHover:'#1E1B4A',
  border:   '#2A2560',
  gold:     '#D4A843',
  goldSoft: '#F0C96A',
  goldDim:  'rgba(212,168,67,0.15)',
  white:    '#F0EDE8',
  muted:    '#7A74A8',
  purple:   '#7B5FCC',
  blue:     '#3E82E5',
  green:    '#2EAA72',
  amber:    '#D4881A',
  rose:     '#D45454',
  teal:     '#2A9595',
};

/* ─── SÍMBOLO ADVENTISTA ──────────────────────────────────────────────────── */
function AdventistSymbol({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect x="46" y="14" width="8" height="52" rx="3" fill={C.gold} />
      <rect x="28" y="30" width="44" height="8" rx="3" fill={C.gold} />
      <path d="M50 80 C50 80 26 62 26 45 C26 32 37 24 50 24 C63 24 74 32 74 45 C74 62 50 80 50 80Z"
        fill="none" stroke={C.gold} strokeWidth="2" opacity="0.5"/>
      <path d="M30 72 Q50 65 70 72 L70 80 Q50 73 30 80Z" fill={C.gold} opacity="0.7"/>
      <line x1="50" y1="65" x2="50" y2="80" stroke={C.bg} strokeWidth="1.5"/>
    </svg>
  );
}

/* ─── DADOS ───────────────────────────────────────────────────────────────── */
const SENHA = '1234';
const CULTO_TIPOS = ['Sábado','Domingo manhã','Domingo tarde','Quarta-feira','Especial'];
const TEM_ESCOLA  = ['Sábado'];

const DEPARTMENTS = {
  musica:   { label:'Diretor de Música',       icon:'🎵', color:C.purple },
  anciao:   { label:'Ancião do Dia',            icon:'🙏', color:C.blue   },
  escola:   { label:'Dir. Escola Sabatina',     icon:'📚', color:C.teal   },
  infantil: { label:'Ministério Infantil',      icon:'⭐', color:C.green  },
  pregador: { label:'Pregador do Dia',          icon:'📖', color:C.amber  },
};

const EMPTY_PROG = () => ({
  equipe:'', musica_1:'', musica_2:'', hino_inicial:'', hino_inicial_pregador:'',
  mens_musical_titulo:'', mens_musical_cantor:'',
  mens_musical_escola_titulo:'', mens_musical_escola_cantor:'',
  hino_final:'', apelo_titulo:'', apelo_cantor:'',
  oracao_joelhos:'', oracao_oferta:'', pregador:'',
  escola_diretor:'', escola_carta:'', escola_hino_inicial:'', escola_hino_final:'',
  historinha:'',
});

const FIELDS_BY_DEPT = {
  musica: [
    { key:'equipe',                      label:'Equipe de Louvor',                      ph:'Ex: João, Maria, Pedro...',        type:'textarea' },
    { key:'musica_1',                    label:'1ª Música',                             ph:'Ex: Grande é o Senhor'             },
    { key:'musica_2',                    label:'2ª Música',                             ph:'Ex: Quão Grande és Tu'             },
    { key:'hino_inicial',                label:'Hino Inicial – 3º Hino em Pé',          ph:'Ex: Castelo Forte – Hino 1'        },
    { key:'mens_musical_titulo',         label:'Mensagem Musical – Título',             ph:'Ex: Sublime Graça'                 },
    { key:'mens_musical_cantor',         label:'Mensagem Musical – Quem cantará',       ph:'Ex: Quarteto Masculino'            },
    { key:'mens_musical_escola_titulo',  label:'Mens. Musical Escola Sab. – Título',    ph:'Ex: Firmeza na Fé', escolaOnly:true},
    { key:'mens_musical_escola_cantor',  label:'Mens. Musical Escola Sab. – Cantor',    ph:'Ex: Duo Feminino',  escolaOnly:true},
    { key:'hino_final',                  label:'Hino Final',                            ph:'Ex: Firme nas Promessas – Hino 99' },
    { key:'apelo_titulo',                label:'Mensagem Musical de Apelo – Título',    ph:'Ex: Volta ao Lar'                  },
    { key:'apelo_cantor',                label:'Mensagem Musical de Apelo – Cantor',    ph:'Ex: Duo Feminino'                  },
  ],
  anciao: [
    { key:'oracao_joelhos', label:'Oração de Joelhos',  ph:'Ex: Ir. Carlos Silva' },
    { key:'oracao_oferta',  label:'Oração pela Oferta', ph:'Ex: Ir. Ana Souza'    },
    { key:'pregador',       label:'Pregador do Dia',    ph:'Ex: Pr. Roberto Lima' },
  ],
  escola: [
    { key:'escola_diretor',      label:'Diretor do Dia',    ph:'Ex: Ir. Marcos Ferreira'         },
    { key:'escola_carta',        label:'Carta Missionária', ph:'Ex: Carta da Missão Sul Brasileira'},
    { key:'escola_hino_inicial', label:'Hino Inicial',      ph:'Ex: Castelo Forte – Hino 1'      },
    { key:'escola_hino_final',   label:'Hino Final',        ph:'Ex: Firmeza na Fé – Hino 23'     },
  ],
  infantil: [
    { key:'historinha', label:'Historinha Infantil – Responsável', ph:'Ex: Ir. Claudia Mendes' },
  ],
  pregador: [
    { key:'hino_inicial_pregador', label:'Hino Inicial – 3º Hino em Pé (pelo pregador)', ph:'Ex: Castelo Forte – Hino 1' },
  ],
};

/* ─── UTILS ───────────────────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T12:00').toLocaleDateString('pt-BR',
    { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}
function newCulto(nome, data, tipo) {
  return { id: Date.now().toString(), nome, data, tipo, programa: EMPTY_PROG() };
}
function progresso(prog) {
  const vals = Object.values(prog).filter(v => typeof v === 'string' && v.trim());
  return Math.round((vals.length / Object.keys(prog).length) * 100);
}

/* ─── ESTILOS ─────────────────────────────────────────────────────────────── */
const s = {
  root:     { minHeight:'100vh', background:C.bg, fontFamily:"'DM Sans', sans-serif", color:C.white, paddingBottom:60 },
  
  // Header
  header:   { background:`linear-gradient(160deg, #1A1540 0%, ${C.bg} 100%)`, borderBottom:`1px solid ${C.border}`, padding:'24px 20px 20px', display:'flex', alignItems:'center', gap:14 },
  headerTxt:{ flex:1 },
  title:    { fontFamily:"'Cormorant Garamond', serif", fontSize:13, fontWeight:600, color:C.gold, letterSpacing:2, textTransform:'uppercase', marginBottom:2 },
  titleMain:{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:700, color:C.white, lineHeight:1.15 },
  titleSub: { fontSize:12, color:C.muted, marginTop:3, letterSpacing:0.3 },

  // Lista cultos
  listTop:  { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 20px 12px' },
  listLbl:  { fontSize:10, letterSpacing:3, textTransform:'uppercase', color:C.muted, fontWeight:600 },
  btnNovo:  { background:C.gold, color:'#0C0A1E', border:'none', borderRadius:10, padding:'9px 18px', fontSize:13, fontWeight:700, cursor:'pointer', letterSpacing:0.3 },

  empty:    { textAlign:'center', color:C.muted, fontSize:14, padding:'52px 28px', lineHeight:2 },

  // Card culto
  cultoCard:   { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, display:'flex', overflow:'hidden', cursor:'pointer', marginBottom:10 },
  cultoAccent: { width:5, flexShrink:0 },
  cultoBody:   { flex:1, padding:'16px 14px' },
  cultoNome:   { fontFamily:"'Cormorant Garamond', serif", fontSize:19, fontWeight:700, color:C.white, marginBottom:5 },
  cultoBadge:  { display:'inline-block', background:C.goldDim, color:C.gold, borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600, letterSpacing:0.5 },
  cultoData:   { fontSize:12, color:C.muted, marginLeft:8, textTransform:'capitalize' },
  cultoBar:    { height:3, background:C.border, borderRadius:4, marginTop:10, overflow:'hidden' },
  cultoPct:    { fontSize:11, fontWeight:600, marginTop:4 },
  btnDel:      { background:'transparent', border:'none', borderLeft:`1px solid ${C.border}`, color:C.rose, padding:'0 16px', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center' },

  // Dept dashboard
  deptGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 20px' },
  deptCard: { background:C.card, border:`1.5px solid ${C.border}`, borderRadius:14, padding:'20px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer' },
  deptIcon: { fontSize:28 },
  deptName: { fontSize:12, fontWeight:600, textAlign:'center', lineHeight:1.3, letterSpacing:0.2 },

  btnVerProg: { display:'block', margin:'20px auto 0', background:'transparent', border:`1.5px solid ${C.gold}`, color:C.gold, borderRadius:12, padding:'13px 32px', fontSize:15, fontWeight:600, cursor:'pointer', letterSpacing:0.3, fontFamily:"'DM Sans',sans-serif" },

  // Senha
  overlay:   { position:'fixed', inset:0, background:'rgba(10,8,28,0.93)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:20 },
  senhaBox:  { background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'32px 24px', width:'100%', maxWidth:340, textAlign:'center' },
  senhaTitle:{ fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:700, color:C.goldSoft, marginBottom:6, marginTop:12 },
  senhaSub:  { fontSize:13, color:C.muted, marginBottom:24, lineHeight:1.5 },
  senhaInput:{ width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'13px 16px', fontSize:22, color:C.white, textAlign:'center', letterSpacing:10, fontFamily:"'DM Sans',sans-serif", outline:'none', marginBottom:10, boxSizing:'border-box' },
  senhaErr:  { color:C.rose, fontSize:13, minHeight:20, marginBottom:10 },

  // Form
  deptHeader:  { padding:'20px', borderBottom:`1px solid ${C.border}` },
  backBtn:     { background:'rgba(255,255,255,0.06)', border:'none', color:C.muted, borderRadius:8, padding:'6px 14px', fontSize:13, cursor:'pointer', marginBottom:14, display:'inline-block', fontFamily:"'DM Sans',sans-serif" },
  formArea:    { padding:'20px' },
  fieldGroup:  { marginBottom:20 },
  fieldLabel:  { display:'block', fontSize:11, fontWeight:600, color:C.muted, marginBottom:8, letterSpacing:1, textTransform:'uppercase' },
  input:       { width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'11px 14px', fontSize:15, color:C.white, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' },
  textarea:    { width:'100%', background:C.surface, border:`1.5px solid ${C.border}`, borderRadius:10, padding:'11px 14px', fontSize:15, color:C.white, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box', resize:'vertical', minHeight:90 },
  infoBox:     { background:'rgba(123,95,204,0.12)', border:`1px solid rgba(123,95,204,0.3)`, borderRadius:10, padding:'12px 14px', fontSize:13, color:'#B8A8E8', marginBottom:18, lineHeight:1.6 },
  infoAmber:   { background:'rgba(212,136,26,0.1)',  border:`1px solid rgba(212,136,26,0.3)`,  borderRadius:10, padding:'12px 14px', fontSize:13, color:'#E8BE80', marginBottom:18, lineHeight:1.6 },
  infoTeal:    { background:'rgba(42,149,149,0.1)',  border:`1px solid rgba(42,149,149,0.3)`,  borderRadius:10, padding:'12px 14px', fontSize:13, color:'#80CECE', marginBottom:18, lineHeight:1.6 },

  btnSalvar:   { width:'100%', border:'none', borderRadius:12, padding:'15px', color:C.bg, fontSize:16, fontWeight:700, cursor:'pointer', marginTop:8, letterSpacing:0.3, transition:'all 0.3s', fontFamily:"'DM Sans',sans-serif" },

  // Programa
  progHeader:  { background:`linear-gradient(160deg, #1A1540 0%, ${C.bg} 100%)`, borderBottom:`1px solid ${C.border}`, padding:'24px 20px' },
  progTitle:   { fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:700, color:C.goldSoft, lineHeight:1.1, marginTop:6 },
  progData:    { fontSize:13, color:C.muted, marginTop:4, textTransform:'capitalize' },
  progBody:    { padding:'20px', display:'flex', flexDirection:'column', gap:14 },
  pSection:    { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'18px 16px', borderLeft:'4px solid' },
  pSecTitle:   { fontFamily:"'Cormorant Garamond', serif", fontSize:17, fontWeight:700, marginBottom:14 },
  pRow:        { display:'flex', flexDirection:'column', marginBottom:12, paddingBottom:12, borderBottom:`1px solid ${C.border}` },
  pRowLast:    { display:'flex', flexDirection:'column', marginBottom:0, paddingBottom:0 },
  pLabel:      { fontSize:10, fontWeight:600, color:C.muted, letterSpacing:1.5, textTransform:'uppercase', marginBottom:3 },
  pValue:      { fontSize:15, color:C.white, lineHeight:1.4 },
  pEmpty:      { fontSize:14, color:C.border, fontStyle:'italic' },

  // Conflict
  conflictBar: { background:'rgba(212,84,84,0.1)', borderTop:`3px solid ${C.rose}`, padding:'12px 20px', fontSize:13, color:'#F0A0A0', lineHeight:1.5 },

  // Modal
  modal:        { background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:'28px 24px', width:'100%', maxWidth:340 },
  modalTitle:   { fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:700, color:C.white, marginBottom:8 },
  modalText:    { fontSize:14, color:C.muted, lineHeight:1.6, marginBottom:22 },
  modalBtns:    { display:'flex', gap:10 },
  btnMdCancel:  { flex:1, background:C.surface, border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:'11px', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  btnMdConfirm: { flex:1, background:C.rose, border:'none', color:'#fff', borderRadius:10, padding:'11px', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },

  // Tipo badges
  tipoGrid:       { display:'flex', flexWrap:'wrap', gap:8 },
  tipoBadge:      { background:C.surface, border:`1.5px solid ${C.border}`, color:C.muted, borderRadius:20, padding:'7px 14px', fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  tipoBadgeActive:{ background:C.goldDim, border:`1.5px solid ${C.gold}`, color:C.gold, fontWeight:700 },

  // Novo culto btn primary
  btnPrimary: { background:`linear-gradient(135deg, ${C.gold} 0%, #B8862A 100%)`, color:'#0C0A1E', border:'none', borderRadius:12, padding:'13px 28px', fontSize:15, fontWeight:700, cursor:'pointer', letterSpacing:0.3, fontFamily:"'DM Sans',sans-serif", width:'100%', marginTop:8 },

  // Loading
  loading: { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:C.bg, flexDirection:'column', gap:16 },
  loadDot: { width:10, height:10, borderRadius:'50%', background:C.gold, animation:'pulse 1.2s infinite' },

  footer: { textAlign:'center', marginTop:28, fontSize:11, color:C.border, padding:'0 20px', letterSpacing:0.5 },
  sectionLbl: { padding:'22px 20px 10px', fontSize:10, letterSpacing:3, textTransform:'uppercase', color:C.muted, fontWeight:600 },
};

/* ─── COMPONENTES ─────────────────────────────────────────────────────────── */
function PSection({ title, color, children }) {
  return (
    <div style={{ ...s.pSection, borderLeftColor: color }}>
      <div style={{ ...s.pSecTitle, color }}>{title}</div>
      {children}
    </div>
  );
}
function PRow({ label, value, last, highlight }) {
  const rowStyle = last ? s.pRowLast : s.pRow;
  return (
    <div style={{ ...rowStyle, ...(highlight ? { background:'rgba(212,84,84,0.08)', borderRadius:6, padding:'6px 8px' } : {}) }}>
      <span style={s.pLabel}>{label}</span>
      <span style={s.pValue}>
        {value || <span style={s.pEmpty}>Não preenchido</span>}
        {highlight && <span style={{ color:C.rose, fontSize:11, marginLeft:6 }}>⚠ conflito</span>}
      </span>
    </div>
  );
}

function SenhaModal({ dept, onSuccess, onCancel }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const check = () => {
    if (val === SENHA) onSuccess();
    else { setErr('Senha incorreta. Tente novamente.'); setVal(''); }
  };
  return (
    <div style={s.overlay}>
      <div style={s.senhaBox}>
        <AdventistSymbol size={44} />
        <div style={s.senhaTitle}>{dept.icon} {dept.label}</div>
        <div style={s.senhaSub}>Digite a senha para acessar este departamento.</div>
        <input style={s.senhaInput} type="password" maxLength={6} value={val}
          autoFocus placeholder="••••"
          onChange={e => { setVal(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && check()} />
        <div style={s.senhaErr}>{err}</div>
        <button style={{ ...s.btnPrimary, marginTop:0 }} onClick={check}>Entrar</button>
        <button style={{ ...s.btnMdCancel, marginTop:10, width:'100%' }} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

/* ─── APP PRINCIPAL ───────────────────────────────────────────────────────── */
export default function App() {
  const [cultos, setCultos]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [view, setView]                   = useState('home');
  const [activeCultoId, setActiveCultoId] = useState(null);
  const [activeDept, setActiveDept]       = useState(null);
  const [saving, setSaving]               = useState(false);
  const [savedOk, setSavedOk]             = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [senhaTarget, setSenhaTarget]     = useState(null);
  const [novoNome, setNovoNome]           = useState('');
  const [novoData, setNovoData]           = useState('');
  const [novoTipo, setNovoTipo]           = useState(CULTO_TIPOS[0]);
  const [localProg, setLocalProg]         = useState(null);

  // ── Firebase: escutar cultos em tempo real ──
  useEffect(() => {
    const r = ref(db, 'cultos');
    const unsub = onValue(r, snap => {
      const val = snap.val();
      setCultos(val ? Object.values(val) : []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const cultoAtivo = cultos.find(c => c.id === activeCultoId);
  const temEscola  = cultoAtivo ? TEM_ESCOLA.includes(cultoAtivo.tipo) : false;

  // Quando abre o form de um dept, copia o programa atual para edição local
  useEffect(() => {
    if (view === 'dept' && cultoAtivo) {
      setLocalProg({ ...EMPTY_PROG(), ...cultoAtivo.programa });
    }
  }, [view, activeCultoId]);

  // ── Salvar no Firebase ──
  const salvarPrograma = useCallback(async () => {
    if (!localProg || !activeCultoId) return;
    setSaving(true);
    try {
      await set(ref(db, `cultos/${activeCultoId}/programa`), localProg);
      setSavedOk(true);
      setTimeout(() => {
        setSavedOk(false);
        setView('cultoDash');
      }, 1200);
    } catch (e) {
      alert('Erro ao salvar. Verifique sua conexão.');
    } finally {
      setSaving(false);
    }
  }, [localProg, activeCultoId]);

  // ── Criar culto ──
  const criarCulto = async () => {
    if (!novoNome.trim()) return;
    const c = newCulto(novoNome.trim(), novoData, novoTipo);
    await set(ref(db, `cultos/${c.id}`), c);
    setNovoNome(''); setNovoData(''); setNovoTipo(CULTO_TIPOS[0]);
    setView('home');
  };

  // ── Excluir culto ──
  const excluirCulto = async (id) => {
    await set(ref(db, `cultos/${id}`), null);
    setConfirmDelete(null);
    if (activeCultoId === id) { setActiveCultoId(null); setView('home'); }
  };

  const abrirDept = (key) => setSenhaTarget(key);
  const onSenhaOk = () => { setActiveDept(senhaTarget); setSenhaTarget(null); setView('dept'); };

  // ── LOADING ──
  if (loading) return (
    <div style={s.loading}>
      <AdventistSymbol size={56} />
      <div style={{ color:C.muted, fontSize:13, letterSpacing:1 }}>Carregando...</div>
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (view === 'home') return (
    <div style={s.root}>
      <header style={s.header}>
        <AdventistSymbol size={50} />
        <div style={s.headerTxt}>
          <div style={s.title}>Igreja Adventista do Sétimo Dia</div>
          <div style={s.titleMain}>Central de Votuporanga</div>
          <div style={s.titleSub}>Sistema de Programa do Culto</div>
        </div>
      </header>

      <div style={s.listTop}>
        <div style={s.listLbl}>Cultos</div>
        <button style={s.btnNovo} onClick={() => setView('novo')}>+ Novo culto</button>
      </div>

      {cultos.length === 0 && (
        <div style={s.empty}>
          Nenhum culto cadastrado ainda.<br />
          Toque em <strong style={{ color:C.gold }}>+ Novo culto</strong> para começar.
        </div>
      )}

      <div style={{ padding:'0 20px' }}>
        {cultos.slice().reverse().map(c => {
          const pct = progresso(c.programa || {});
          const cor = pct === 100 ? C.green : pct > 50 ? C.amber : C.purple;
          return (
            <div key={c.id} style={s.cultoCard}>
              <div style={{ ...s.cultoAccent, background:cor }} />
              <div style={s.cultoBody} onClick={() => { setActiveCultoId(c.id); setView('cultoDash'); }}>
                <div style={s.cultoNome}>{c.nome}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
                  <span style={s.cultoBadge}>{c.tipo}</span>
                  {c.data && <span style={s.cultoData}>{formatDate(c.data)}</span>}
                </div>
                <div style={s.cultoBar}>
                  <div style={{ width:`${pct}%`, height:'100%', background:cor, borderRadius:4, transition:'width 0.4s' }} />
                </div>
                <div style={{ ...s.cultoPct, color:cor }}>{pct}% preenchido</div>
              </div>
              <button style={s.btnDel} onClick={() => setConfirmDelete(c.id)}>🗑</button>
            </div>
          );
        })}
      </div>

      {confirmDelete && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalTitle}>Excluir culto?</div>
            <div style={s.modalText}>"{cultos.find(c=>c.id===confirmDelete)?.nome}" será removido permanentemente.</div>
            <div style={s.modalBtns}>
              <button style={s.btnMdCancel} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button style={s.btnMdConfirm} onClick={() => excluirCulto(confirmDelete)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
      <div style={s.footer}>Igreja Adventista Central de Votuporanga · Sistema de Programa</div>
    </div>
  );

  // ── NOVO CULTO ────────────────────────────────────────────────────────────
  if (view === 'novo') return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.headerTxt}>
          <button style={s.backBtn} onClick={() => setView('home')}>← Voltar</button>
          <div style={s.titleMain}>Novo Culto</div>
        </div>
      </header>
      <div style={s.formArea}>
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>Nome do culto</label>
          <input style={s.input} value={novoNome}
            placeholder="Ex: Sábado 17/05, Quarta 21/05..."
            onChange={e => setNovoNome(e.target.value)} />
        </div>
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>Tipo</label>
          <div style={s.tipoGrid}>
            {CULTO_TIPOS.map(t => (
              <button key={t}
                style={{ ...s.tipoBadge, ...(novoTipo===t ? s.tipoBadgeActive : {}) }}
                onClick={() => setNovoTipo(t)}>{t}
              </button>
            ))}
          </div>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>Data (opcional)</label>
          <input style={s.input} type="date" value={novoData} onChange={e => setNovoData(e.target.value)} />
        </div>
        <button style={{ ...s.btnPrimary, opacity: novoNome.trim() ? 1 : 0.4 }}
          onClick={criarCulto} disabled={!novoNome.trim()}>
          Criar culto
        </button>
      </div>
    </div>
  );

  // ── DASHBOARD CULTO ───────────────────────────────────────────────────────
  if (view === 'cultoDash' && cultoAtivo) {
    const hm = (cultoAtivo.programa?.hino_inicial || '').trim();
    const hp = (cultoAtivo.programa?.hino_inicial_pregador || '').trim();
    const conflito = hm && hp && hm !== hp;
    const depts = Object.entries(DEPARTMENTS).filter(([k]) => k !== 'escola' || temEscola);

    return (
      <div style={s.root}>
        <header style={s.header}>
          <AdventistSymbol size={42} />
          <div style={s.headerTxt}>
            <button style={s.backBtn} onClick={() => setView('home')}>← Cultos</button>
            <div style={s.titleMain}>{cultoAtivo.nome}</div>
            {cultoAtivo.data && <div style={s.titleSub}>{formatDate(cultoAtivo.data)}</div>}
            <span style={{ ...s.cultoBadge, marginTop:6, display:'inline-block' }}>{cultoAtivo.tipo}</span>
          </div>
        </header>

        {conflito && (
          <div style={s.conflictBar}>
            ⚠ <strong>Conflito no Hino Inicial:</strong> música: "{hm}" · pregador: "{hp}"
          </div>
        )}

        <div style={s.sectionLbl}>Preencher por Departamento</div>
        <div style={s.deptGrid}>
          {depts.map(([key, d]) => (
            <button key={key}
              style={{ ...s.deptCard, borderColor: d.color + '55' }}
              onClick={() => abrirDept(key)}>
              <span style={s.deptIcon}>{d.icon}</span>
              <span style={{ ...s.deptName, color:d.color }}>{d.label}</span>
            </button>
          ))}
        </div>

        <button style={s.btnVerProg} onClick={() => setView('programa')}>
          📋 Ver Programa Completo
        </button>

        {senhaTarget && (
          <SenhaModal dept={DEPARTMENTS[senhaTarget]} onSuccess={onSenhaOk} onCancel={() => setSenhaTarget(null)} />
        )}
        <div style={s.footer}>Dados sincronizados em tempo real · Firebase</div>
      </div>
    );
  }

  // ── FORM DEPARTAMENTO ─────────────────────────────────────────────────────
  if (view === 'dept' && cultoAtivo && activeDept && localProg) {
    const dept   = DEPARTMENTS[activeDept];
    const fields = FIELDS_BY_DEPT[activeDept].filter(f => !f.escolaOnly || temEscola);
    const btnBg  = savedOk ? C.green : saving ? C.muted : dept.color;
    const btnTxt = savedOk ? '✓ Salvo!' : saving ? 'Salvando...' : 'Salvar e voltar';

    return (
      <div style={s.root}>
        <div style={{ ...s.deptHeader, background:C.surface }}>
          <button style={s.backBtn} onClick={() => setView('cultoDash')}>← Voltar sem salvar</button>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:30 }}>{dept.icon}</span>
            <div>
              <div style={{ ...s.titleMain, fontSize:20, color:dept.color }}>{dept.label}</div>
              <div style={s.titleSub}>{cultoAtivo.nome}</div>
            </div>
          </div>
        </div>

        <div style={s.formArea}>
          {activeDept === 'musica' && (
            <div style={s.infoBox}>🎵 Ordem: 1ª Música → 2ª Música → Hino Inicial (em pé) → Mensagem Musical{temEscola?' → Mens. Escola Sab.':''} → Hino Final → Apelo</div>
          )}
          {activeDept === 'pregador' && (
            <div style={s.infoAmber}>💡 Preencha o Hino Inicial só se o diretor de música ainda não o tiver feito.</div>
          )}
          {activeDept === 'escola' && (
            <div style={s.infoTeal}>📚 Escola Sabatina — campos exclusivos do culto de sábado.</div>
          )}

          {fields.map(f => (
            <div key={f.key} style={s.fieldGroup}>
              <label style={s.fieldLabel}>{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea style={s.textarea} value={localProg[f.key] || ''} placeholder={f.ph || ''}
                  onChange={e => setLocalProg(p => ({ ...p, [f.key]: e.target.value }))} />
              ) : (
                <input style={s.input} value={localProg[f.key] || ''} placeholder={f.ph || ''}
                  onChange={e => setLocalProg(p => ({ ...p, [f.key]: e.target.value }))} />
              )}
            </div>
          ))}

          <button style={{ ...s.btnSalvar, background:btnBg, color: savedOk || saving ? '#fff' : C.bg }}
            onClick={salvarPrograma} disabled={saving || savedOk}>
            {btnTxt}
          </button>
        </div>
      </div>
    );
  }

  // ── PROGRAMA COMPLETO ─────────────────────────────────────────────────────
  if (view === 'programa' && cultoAtivo) {
    const prog = { ...EMPTY_PROG(), ...cultoAtivo.programa };
    const hm   = prog.hino_inicial.trim();
    const hp   = prog.hino_inicial_pregador.trim();
    const conflito   = hm && hp && hm !== hp;
    const hinoFinal  = hm || hp || '';

    return (
      <div style={s.root}>
        <div style={s.progHeader}>
          <button style={s.backBtn} onClick={() => setView('cultoDash')}>← Voltar</button>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <AdventistSymbol size={46} />
            <div>
              <div style={s.title}>Igreja Adventista do Sétimo Dia</div>
              <div style={s.progTitle}>{cultoAtivo.nome}</div>
              {cultoAtivo.data && <div style={s.progData}>{formatDate(cultoAtivo.data)}</div>}
              <span style={{ ...s.cultoBadge, marginTop:6, display:'inline-block' }}>{cultoAtivo.tipo}</span>
            </div>
          </div>
        </div>

        {conflito && (
          <div style={s.conflictBar}>
            ⚠ Conflito no Hino Inicial: "{hm}" (música) vs "{hp}" (pregador) — por favor alinhem.
          </div>
        )}

        <div style={s.progBody}>

          {/* ESCOLA SABATINA */}
          {temEscola && (
            <PSection title="📚 Escola Sabatina" color={C.teal}>
              <PRow label="Diretor do Dia"    value={prog.escola_diretor}      />
              <PRow label="Carta Missionária" value={prog.escola_carta}        />
              <PRow label="Hino Inicial"      value={prog.escola_hino_inicial} />
              <PRow label="Mensagem Musical"
                value={prog.mens_musical_escola_titulo
                  ? `${prog.mens_musical_escola_titulo}${prog.mens_musical_escola_cantor ? ' — '+prog.mens_musical_escola_cantor : ''}`
                  : ''} />
              <PRow label="Hino Final"        value={prog.escola_hino_final} last />
            </PSection>
          )}

          {/* LOUVOR */}
          <PSection title="🎵 Louvor" color={C.purple}>
            {prog.equipe ? <PRow label="Equipe de Louvor"        value={prog.equipe}    /> : null}
            <PRow label="1ª Música"                value={prog.musica_1}  />
            <PRow label="2ª Música"                value={prog.musica_2}  />
            <PRow label="Hino Inicial 🧍 (em pé)"  value={hinoFinal} highlight={conflito} last />
          </PSection>

          {/* ORAÇÃO */}
          <PSection title="🙏 Momentos de Oração" color={C.blue}>
            <PRow label="Oração de Joelhos"  value={prog.oracao_joelhos} />
            <PRow label="Oração pela Oferta" value={prog.oracao_oferta}  last />
          </PSection>

          {/* MENSAGEM MUSICAL */}
          <PSection title="🎶 Mensagem Musical" color={C.purple}>
            <PRow label="Música"       value={prog.mens_musical_titulo}  />
            <PRow label="Quem cantará" value={prog.mens_musical_cantor}  last />
          </PSection>

          {/* INFANTIL */}
          <PSection title="⭐ Ministério Infantil" color={C.green}>
            <PRow label="Historinha Infantil" value={prog.historinha} last />
          </PSection>

          {/* MENSAGEM */}
          <PSection title="📖 Mensagem" color={C.amber}>
            <PRow label="Pregador do Dia" value={prog.pregador} last />
          </PSection>

          {/* HINO FINAL */}
          <PSection title="🎵 Hino Final" color={C.purple}>
            <PRow label="Hino Final" value={prog.hino_final} last />
          </PSection>

          {/* APELO */}
          <PSection title="🕊 Mensagem Musical de Apelo" color={C.purple}>
            <PRow label="Música"       value={prog.apelo_titulo} />
            <PRow label="Quem cantará" value={prog.apelo_cantor} last />
          </PSection>

        </div>
        <div style={s.footer}>Igreja Adventista Central de Votuporanga · Programa Oficial · IASD</div>
      </div>
    );
  }

  return null;
}
