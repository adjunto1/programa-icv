import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './firebase';

const VAPID_KEY = 'BOhZrxORkJ02nvIzxuVyuX-DVAMnypiDgRbh04T-0Gu6Cjdbr28COOtiWoKXjzmiqGkOI_LrTFHQ-DmC6moEX2o';
try {
if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    if (token) {
      const hash = token.slice(-20);
      await set(ref(db, `tokens/${hash}`), { token, atualizado: Date.now() });
      console.log('Token FCM salvo:', hash);
    }
    onMessage(messaging, payload => {
      const { title, body } = payload.notification || {};
      if (title) new Notification(title, { body, icon: '/logo192.png' });
    });
  } catch (e) {
    console.warn('FCM:', e);
  }
}

const CLOUD_NAME    = 'ddetpsxfo';
const UPLOAD_PRESET = 'pregadores_icv';
async function uploadFoto(file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:fd });
  const data = await r.json();
  if (!data.secure_url) throw new Error('Upload falhou');
  return data.secure_url;
}

const LOGO_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAQ4CAYAAADsEGyPAADNkklEQVR4nOzddZhtZd3G8S+HQ9ehke4QEKQFaRBpEBQEFERCQOlUlEZBwMAAFUVEuru7G4wXAenukK73jzUj42Zix1rr96y1vp/rmguYs9fz3CJnzsy9nxgLSZLUNGMDEwATARP2/f2EA/6+/2P8vo/xBnyMC4zT9/ej+/5+7L6/HxsYNeCvY/V9DPRx38dHwId9f/0IeL/vn98HPgDeG/Dx7oCPd/o+3m75eKvv463+v5ckSVJFtH7TIUmSqmEcYEzLx+QDPsYAkw34mBiYpO+vE/NJmTFuiZnL8B6flB7/6ft4o+/jdeBV4LUBHy9DkiQlwIJDkqR0jAtMBUzd9zFN38e0A95NAnYDtgM2A1YMTSRJUrM8A+wMfBo4ETi2tQ2wbVgqSZIkSVIYCw5JklQH+wJHA68Hno8OI0mSJEnSnxTlWQkAAP//7NdJqhAEEED/ATqbqAtNXMhF3MQFxEBTEFE3Iir+/idBBDGS6urq6goOct9JJAmhqiQDAAAAAAAAAAA=";
function Logo({ size=48, style={} }) {
  return <img src={LOGO_SRC} alt="IASD" width={size} height={size}
    style={{ borderRadius:'50%', background:'#fff', objectFit:'contain', flexShrink:0, ...style }} />;
}

const SENHA_DEPT    = '1234';
const SENHA_MASTER  = '777';
const SENHA_ESCALA  = 'primeiro';
const SENHA_MIDIA   = 'midiatec';
const SENHA_MUSICA  = 'musica7';
const CULTO_TIPOS   = ['Sábado','Domingo à noite','Quarta-feira','Especial'];
const COM_ESCOLA    = ['Sábado'];
const COM_INFANTIL  = ['Sábado'];
const COM_EXTRA     = ['Domingo à noite','Quarta-feira','Especial'];
const HIST_DIAS     = 7;
const VERSICULO     = '"Deus é Espírito, e é necessário que os que o adoram o adorem em espírito e em verdade."';
const VERSICULO_REF = 'João 4:24';

const ANCIAOS = ['Toninho Vicente','Kleber Vicente','Altair Lin','Adriano Ribeiro',
  'Fátima Maior','Prof. Francisco','Malu Castro','Silvia Villegas','Paulo Henrique'];
const IGREJAS_DISTRITO = ['—','Central','Estação','Valentim Gentil','Floreal'];
const EQUIPE_MIDIA = ['Gustavo','Lucas','Rafael','Gabriel','Silvano','Leonardo','Pedro','Kaick','Wesley','Alex','Clarissa'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta-feira','Quinta','Sexta','Sábado'];

// ── NOMES ESCALA DE MÚSICA ─────────────────────────────────────────────────
const NOMES_MUSICA = [
  'Adriano','Clelma','Helio Barros','Helio','Katia','Queila','Andrea','Bruna','Lucas','Alan',
  'Alex','Alexandre','Augusto','Braz','Carlinhos','Cristiane','Clarissa','Dalva','Daniel Holanda',
  'Edson Black','Ester','Erika','Fernandinho','Isadora','Jane','Jemima','Lidiane Domeni','Luan',
  'Luciana Paro','Madu','Maria Angela','Rafaela','Rogerio Leandro','Rosana','Sandra Gimenez',
  'Sirlei Faceto','Thiago Gualberto','Viviane Garcia','Ana','Flavio Gomes','Helia','Gisele',
  'Katiuce','Marcio','Neire','Osmar','Vanessa Martins','Francis'
];

function gerarDatasDoMes(ano, mes) {
  const dias = [];
  const total = new Date(ano, mes+1, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const dt = new Date(ano, mes, d);
    const dow = dt.getDay();
    if (dow === 0 || dow === 3 || dow === 6) {
      const id = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const data = `${String(d).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${ano}`;
      const dia = DIAS_SEMANA[dow];
      dias.push({ id, data, dia, pregadorCentral:'', anciao:'', igrejaDistrito:'—', pregadorDistrito:'' });
    }
  }
  return dias;
}

function gerarDatasDoMesMidia(ano, mes) {
  const dias = [];
  const total = new Date(ano, mes+1, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const dt = new Date(ano, mes, d);
    const dow = dt.getDay();
    if (dow === 0 || dow === 3 || dow === 6) {
      const id = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const data = `${String(d).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${ano}`;
      const dia = DIAS_SEMANA[dow];
      dias.push({ id, data, dia, turno:'', som:'', midia:'', transmissao:'' });
      if (dow === 6) {
        dias.push({ id: id+'-ja', data, dia, turno:'J.A', som:'', midia:'', transmissao:'' });
      }
    }
  }
  return dias;
}

function gerarDatasDoMesMusica(ano, mes) {
  const dias = [];
  const total = new Date(ano, mes+1, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const dt = new Date(ano, mes, d);
    const dow = dt.getDay();
    if (dow === 0 || dow === 3 || dow === 6) {
      const id = `${ano}-${String(mes+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const data = `${String(d).padStart(2,'0')}/${String(mes+1).padStart(2,'0')}/${ano}`;
      const dia = DIAS_SEMANA[dow];
      dias.push({ id, data, dia, equipelouvor:'', orquestra:'', mensagemmusical:'' });
    }
  }
  return dias;
}

const ESCALA_PREGO_MAIO = [
  { id:'2026-05-02', data:'02/05/2026', dia:'Sábado',       pregadorCentral:'Pr. Marcelo Dadâmo', anciao:'Altair Lin',      igrejaDistrito:'Estação',         pregadorDistrito:'Durvalino'          },
  { id:'2026-05-03', data:'03/05/2026', dia:'Domingo',      pregadorCentral:'Pr. Marcelo Dadâmo', anciao:'Altair Lin',      igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-06', data:'06/05/2026', dia:'Quarta-feira', pregadorCentral:'Marcelo Faria',       anciao:'Altair Lin',      igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-09', data:'09/05/2026', dia:'Sábado',       pregadorCentral:'Adriano',             anciao:'Silvia Villegas', igrejaDistrito:'—',               pregadorDistrito:'Tânia'              },
  { id:'2026-05-10', data:'10/05/2026', dia:'Domingo',      pregadorCentral:'Pr. Marcelo Dadâmo', anciao:'Silvia Villegas', igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-13', data:'13/05/2026', dia:'Quarta-feira', pregadorCentral:'Natália Garcia',      anciao:'Silvia Villegas', igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-16', data:'16/05/2026', dia:'Sábado',       pregadorCentral:'Aventureiros',        anciao:'Adriano Ribeiro', igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-17', data:'17/05/2026', dia:'Domingo',      pregadorCentral:'Pr. Marcelo Dadâmo', anciao:'Adriano Ribeiro', igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-20', data:'20/05/2026', dia:'Quarta-feira', pregadorCentral:'Márcio',              anciao:'Adriano Ribeiro', igrejaDistrito:'—',               pregadorDistrito:'Pr. Marcelo Dadâmo' },
  { id:'2026-05-23', data:'23/05/2026', dia:'Sábado',       pregadorCentral:'Marcelo Paini',       anciao:'Paulo Henrique',  igrejaDistrito:'—',               pregadorDistrito:'Pr. Marcelo Dadâmo' },
  { id:'2026-05-24', data:'24/05/2026', dia:'Domingo',      pregadorCentral:'Pr. Marcelo Dadâmo', anciao:'Paulo Henrique',  igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-27', data:'27/05/2026', dia:'Quarta-feira', pregadorCentral:'Clarissa',            anciao:'Paulo Henrique',  igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
  { id:'2026-05-30', data:'30/05/2026', dia:'Sábado',       pregadorCentral:'Mateus',              anciao:'Fátima Maior',    igrejaDistrito:'—',               pregadorDistrito:'Brás Del Rey'       },
  { id:'2026-05-31', data:'31/05/2026', dia:'Domingo',      pregadorCentral:'Pr. Marcelo',         anciao:'Fátima Maior',    igrejaDistrito:'—',               pregadorDistrito:'Pregador Local'     },
];

const ESCALA_MIDIA_MAIO = [
  { id:'2026-05-02',    data:'02/05/2026', dia:'Sábado',       turno:'',    som:'Lucas',   midia:'Rafael',   transmissao:'Gabriel'  },
  { id:'2026-05-02-ja', data:'02/05/2026', dia:'Sábado',       turno:'J.A', som:'',        midia:'',         transmissao:''         },
  { id:'2026-05-03',    data:'03/05/2026', dia:'Domingo',      turno:'',    som:'Silvano', midia:'Leonardo', transmissao:'Pedro'    },
  { id:'2026-05-06',    data:'06/05/2026', dia:'Quarta-feira', turno:'',    som:'Gustavo', midia:'Gustavo',  transmissao:'Clarissa'  },
  { id:'2026-05-09',    data:'09/05/2026', dia:'Sábado',       turno:'',    som:'Kaick',   midia:'Gustavo',  transmissao:'Gabriel'  },
  { id:'2026-05-09-ja', data:'09/05/2026', dia:'Sábado',       turno:'J.A', som:'Wesley',  midia:'Leonardo', transmissao:''         },
  { id:'2026-05-10',    data:'10/05/2026', dia:'Domingo',      turno:'',    som:'Leonardo',midia:'Rafael',   transmissao:'Alex'     },
  { id:'2026-05-13',    data:'13/05/2026', dia:'Quarta-feira', turno:'',    som:'Silvano', midia:'Silvano',  transmissao:'Gustavo'  },
  { id:'2026-05-16',    data:'16/05/2026', dia:'Sábado',       turno:'',    som:'Lucas',   midia:'Rafael',   transmissao:'Leonardo' },
  { id:'2026-05-16-ja', data:'16/05/2026', dia:'Sábado',       turno:'J.A', som:'Wesley',  midia:'Silvano',  transmissao:''         },
  { id:'2026-05-17',    data:'17/05/2026', dia:'Domingo',      turno:'',    som:'Lucas',   midia:'Rafael',   transmissao:'Pedro'    },
  { id:'2026-05-20',    data:'20/05/2026', dia:'Quarta-feira', turno:'',    som:'Gustavo', midia:'Gustavo',  transmissao:'Gabriel'  },
  { id:'2026-05-23',    data:'23/05/2026', dia:'Sábado',       turno:'',    som:'Silvano', midia:'Gustavo',  transmissao:'Alex'     },
  { id:'2026-05-23-ja', data:'23/05/2026', dia:'Sábado',       turno:'J.A', som:'Wesley',  midia:'Rafael',   transmissao:''         },
  { id:'2026-05-24',    data:'24/05/2026', dia:'Domingo',      turno:'',    som:'Gustavo', midia:'Leonardo', transmissao:'Gabriel'  },
  { id:'2026-05-27',    data:'27/05/2026', dia:'Quarta-feira', turno:'',    som:'Silvano', midia:'Silvano',  transmissao:'Pedro'    },
  { id:'2026-05-30',    data:'30/05/2026', dia:'Sábado',       turno:'',    som:'Kaick',   midia:'Gustavo',  transmissao:'Leonardo' },
  { id:'2026-05-30-ja', data:'30/05/2026', dia:'Sábado',       turno:'J.A', som:'Lucas',   midia:'Leonardo', transmissao:''         },
];

// ── CORES ──────────────────────────────────────────────────────────────────
function makeColors(dark) {
  if (dark) return {
    bg:'#0D0B20', surface:'#141230', card:'#1C1945', border:'#2C2768',
    gold:'#D4A843', goldSoft:'#F0C96A', goldDim:'rgba(212,168,67,0.18)',
    white:'#F8F5F0', muted:'#9890C8', purple:'#8B6FDC', blue:'#4A90E5',
    green:'#34BB7A', amber:'#E09020', rose:'#E05555', teal:'#30A8A8',
    pink:'#D060A0',
    headerBg:'linear-gradient(160deg, #1E1B4A 0%, #0D0B20 100%)',
    inputBg:'#141230', sepBg:'rgba(212,168,67,0.2)', isDark:true,
  };
  return {
    bg:'#F4F2FF', surface:'#FFFFFF', card:'#FFFFFF', border:'#D8D0F0',
    gold:'#B8860B', goldSoft:'#A0740A', goldDim:'rgba(184,134,11,0.12)',
    white:'#1A1440', muted:'#6B65A0', purple:'#6B4FBB', blue:'#2E6FD4',
    green:'#1E8A5A', amber:'#B8720A', rose:'#C03838', teal:'#1A8888',
    pink:'#A03080',
    headerBg:'linear-gradient(160deg, #EDE8FF 0%, #F4F2FF 100%)',
    inputBg:'#F8F6FF', sepBg:'rgba(184,134,11,0.12)', isDark:false,
  };
}

// ── PROGRAMA ───────────────────────────────────────────────────────────────
const EMPTY_PROG = () => ({
  equipe:'', musica1:'', musica2:'', musica3:'', hinoInicial:'',
  mensMusicalCultoTitulo:'', mensMusicalCultoCantora:'',
  mensMusicalEscolaTitulo:'', mensMusicalEscolaCantora:'',
  hinoFinalMusica:'', apeloTitulo:'', apeloCantora:'',
  anciaoNome:'', oracaoJoelhos:'', oracaoOferta:'', pregador:'',
  escolaDiretor:'', escolaCarta:'',
  escolaMusica1:'', escolaMusica2:'',
  escolaHinoInicial:'', escolaHinoFinal:'',
  historinha:'',
  hinoInicialPregador:'', hinoFinalPregador:'', temaSermao:'', fotoPregador:'',
});

const DEPARTMENTS = {
  musica:   { label:'Diretor de Música',   icon:'🎵', color:'purple' },
  anciao:   { label:'Ancião do Dia',        icon:'🙏', color:'blue'   },
  escola:   { label:'Dir. Escola Sabatina', icon:'📚', color:'teal'   },
  infantil: { label:'Ministério Infantil',  icon:'⭐', color:'green'  },
  pregador: { label:'Pregador do Dia',      icon:'📖', color:'amber'  },
};

const DEPT_KEYS = {
  musica:   ['equipe','musica1','musica2','hinoInicial','mensMusicalCultoTitulo','mensMusicalCultoCantora','hinoFinalMusica','apeloTitulo','apeloCantora'],
  anciao:   ['anciaoNome','oracaoJoelhos','oracaoOferta','pregador'],
  escola:   ['escolaDiretor','escolaCarta','escolaMusica1','escolaMusica2','escolaHinoInicial','escolaHinoFinal'],
  infantil: ['historinha'],
  pregador: ['hinoInicialPregador','hinoFinalPregador','temaSermao'],
};

function isDeptPreenchido(k, prog, tipo) {
  if (!prog) return false;
  let keys = DEPT_KEYS[k] || [];
  if (k==='musica') {
    if (COM_EXTRA.includes(tipo)) keys = [...keys,'musica3'];
    if (COM_ESCOLA.includes(tipo)) keys = [...keys,'mensMusicalEscolaTitulo','mensMusicalEscolaCantora'];
  }
  return keys.some(kk => prog[kk]?.trim());
}

function getMusicaFields(tipo, prog) {
  const temExtra  = COM_EXTRA.includes(tipo);
  const temEscola = COM_ESCOLA.includes(tipo);
  const hintI = prog?.hinoInicialPregador?.trim() || '';
  const hintF = prog?.hinoFinalPregador?.trim()   || '';
  const fields = [
    { key:'equipe',  label:'Equipe de Louvor', ph:'Ex: João, Maria, Pedro...', type:'textarea' },
    { key:'musica1', label:'1º Hino', ph:'Ex: Grande é o Senhor' },
    { key:'musica2', label:'2º Hino', ph:'Ex: Quão Grande és Tu' },
  ];
  if (temExtra) fields.push({ key:'musica3', label:'3º Hino', ph:'Ex: Santo, Santo, Santo' });
  fields.push({ key:'hinoInicial', label:'Hino Inicial – Último Hino em Pé', ph:'Ex: Castelo Forte – Hino 1', hint: hintI?`Pregador sugeriu: "${hintI}"`:'' });
  fields.push({ key:'mensMusicalCultoTitulo',   label:'Mensagem Musical do Culto – Título',        ph:'Ex: Sublime Graça'      });
  fields.push({ key:'mensMusicalCultoCantora',  label:'Mensagem Musical do Culto – Quem cantará',  ph:'Ex: Quarteto Masculino' });
  if (temEscola) {
    fields.push({ key:'mensMusicalEscolaTitulo',  label:'Mens. Musical Escola Sab. – Título', ph:'Ex: Firmeza na Fé' });
    fields.push({ key:'mensMusicalEscolaCantora', label:'Mens. Musical Escola Sab. – Cantor', ph:'Ex: Duo Feminino'  });
  }
  fields.push({ key:'hinoFinalMusica', label:'Hino Final (em pé)', ph:'Ex: Firme nas Promessas – Hino 99', hint: hintF?`Pregador sugeriu: "${hintF}"`:'' });
  fields.push({ key:'apeloTitulo',  label:'Mensagem Musical de Apelo – Título', ph:'Ex: Volta ao Lar'   });
  fields.push({ key:'apeloCantora', label:'Mensagem Musical de Apelo – Cantor', ph:'Ex: Duo Feminino'   });
  return fields;
}

const FIELDS_ANCIAO = [
  { key:'anciaoNome',    label:'Nome do Ancião Responsável do Dia', ph:'Ex: Ir. Paulo Mendes'  },
  { key:'oracaoJoelhos', label:'Oração de Joelhos – Responsável',   ph:'Ex: Ir. Carlos Silva'  },
  { key:'oracaoOferta',  label:'Oração pela Oferta – Responsável',  ph:'Ex: Ir. Ana Souza'     },
  { key:'pregador',      label:'Pregador do Dia',                   ph:'Ex: Pr. Roberto Lima'  },
];

// ESCOLA: musica1 e musica2 ANTES do hinoInicial
const FIELDS_ESCOLA = [
  { key:'escolaDiretor',     label:'Diretor do Dia',        ph:'Ex: Ir. Marcos Ferreira'            },
  { key:'escolaCarta',       label:'Carta Missionária',     ph:'Ex: Carta da Missão Sul Brasileira' },
  { key:'escolaMusica1',     label:'Música 1',              ph:'Ex: Grande é o Senhor – Hino 2'     },
  { key:'escolaMusica2',     label:'Música 2',              ph:'Ex: Quão Grande és Tu – Hino 3'     },
  { key:'escolaHinoInicial', label:'Hino Inicial',          ph:'Ex: Castelo Forte – Hino 1'         },
  { key:'escolaHinoFinal',   label:'Hino Final',            ph:'Ex: Firmeza na Fé – Hino 23'        },
];
const FIELDS_INFANTIL = [{ key:'historinha', label:'Historinha Infantil – Responsável', ph:'Ex: Ir. Claudia Mendes' }];
const FIELDS_PREGADOR = [
  { key:'hinoInicialPregador', label:'Hino Inicial – Último Hino em Pé', ph:'Ex: Castelo Forte – Hino 1'        },
  { key:'hinoFinalPregador',   label:'Hino Final (em pé)',               ph:'Ex: Firme nas Promessas – Hino 99' },
  { key:'temaSermao',          label:'Título do Sermão',                 ph:'Ex: A Graça que Transforma'        },
  { key:'fotoPregador',        label:'Foto do Pregador',                 type:'foto'                            },
];
function getFieldsByDept(k, tipo, prog) {
  if (k==='musica')   return getMusicaFields(tipo, prog);
  if (k==='anciao')   return FIELDS_ANCIAO;
  if (k==='escola')   return FIELDS_ESCOLA;
  if (k==='infantil') return FIELDS_INFANTIL;
  if (k==='pregador') return FIELDS_PREGADOR;
  return [];
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T12:00').toLocaleDateString('pt-BR',
    { weekday:'long', day:'2-digit', month:'long', year:'numeric' });
}
function newCulto(nome, data, tipo) {
  return { id: Date.now().toString(), nome, data, tipo, programa: EMPTY_PROG(), criadoEm: Date.now() };
}
function progressoDepts(prog, tipo) {
  if (!prog) return 0;
  const depts = ['musica','anciao','pregador'];
  if (COM_ESCOLA.includes(tipo))   depts.push('escola');
  if (COM_INFANTIL.includes(tipo)) depts.push('infantil');
  const preenchidos = depts.filter(k => isDeptPreenchido(k, prog, tipo)).length;
  return Math.round((preenchidos / depts.length) * 100);
}
function isCultoPassado(c) {
  if (!c.data) return false;
  return new Date(c.data + 'T23:59:59') < new Date();
}
function diasDesdePassado(c) {
  if (!c.data) return 0;
  return Math.floor((Date.now() - new Date(c.data + 'T23:59:59').getTime()) / 86400000);
}
function formatarParaWhatsApp(culto) {
  const p = { ...EMPTY_PROG(), ...culto.programa };
  const tipo = culto.tipo;
  const temEscola   = COM_ESCOLA.includes(tipo);
  const temInfantil = COM_INFANTIL.includes(tipo);
  const temExtra    = COM_EXTRA.includes(tipo);
  const hinoI = p.hinoInicial || p.hinoInicialPregador || '—';
  const hinoF = p.hinoFinalMusica || p.hinoFinalPregador || '—';
  let txt = `✝ *${culto.nome}*\n`;
  if (culto.data) txt += `_${formatDate(culto.data)}_\n_${culto.tipo}_\n`;
  if (p.anciaoNome) txt += `\n🙏 *Ancião:* ${p.anciaoNome}`;
  txt += `\n`;
  if (temEscola) {
    txt += `\n📚 *ESCOLA SABATINA*\n`;
    if (p.escolaDiretor)     txt += `Diretor: ${p.escolaDiretor}\n`;
    if (p.escolaCarta)       txt += `Carta: ${p.escolaCarta}\n`;
    if (p.escolaMusica1)     txt += `Música 1: ${p.escolaMusica1}\n`;
    if (p.escolaMusica2)     txt += `Música 2: ${p.escolaMusica2}\n`;
    if (p.escolaHinoInicial) txt += `Hino Inicial: ${p.escolaHinoInicial}\n`;
    if (p.mensMusicalEscolaTitulo) txt += `Mens. Musical: ${p.mensMusicalEscolaTitulo}${p.mensMusicalEscolaCantora?' — '+p.mensMusicalEscolaCantora:''}\n`;
    if (p.escolaHinoFinal)   txt += `Hino Final: ${p.escolaHinoFinal}\n`;
  }
  txt += `\n✝ *CULTO DIVINO*\n\n🎵 *LOUVOR*\n`;
  if (p.equipe) txt += `Equipe: ${p.equipe}\n`;
  txt += `1º Hino: ${p.musica1||'—'}\n2º Hino: ${p.musica2||'—'}\n`;
  if (temExtra) txt += `3º Hino: ${p.musica3||'—'}\n`;
  txt += `Hino Inicial 🧍: ${hinoI}\n`;
  txt += `\n🙏 *ORAÇÃO DE JOELHOS*\n${p.oracaoJoelhos||'—'}\n`;
  // HISTORINHA ANTES DA ORAÇÃO DAS OFERTAS (ordem correta do programa de Sábado)
  if (temInfantil) txt += `\n⭐ *HISTORINHA INFANTIL*\n${p.historinha||'—'}\n`;
  txt += `\n💰 *ORAÇÃO DAS OFERTAS*\n${p.oracaoOferta||'—'}\n`;
  if (p.mensMusicalCultoTitulo) txt += `\n🎶 *MENSAGEM MUSICAL*\n${p.mensMusicalCultoTitulo}${p.mensMusicalCultoCantora?' — '+p.mensMusicalCultoCantora:''}\n`;
  txt += `\n📖 *PREGADOR*\n${p.pregador||'—'}\n`;
  if (p.temaSermao) txt += `Tema: ${p.temaSermao}\n`;
  if (p.apeloTitulo) txt += `\n🕊 *APELO*\n${p.apeloTitulo}${p.apeloCantora?' — '+p.apeloCantora:''}\n`;
  txt += `\n🎵 *HINO FINAL* 🧍\n${hinoF}\n\n_Igreja Adventista Central de Votuporanga_`;
  return txt;
}

// ── ESTILOS ────────────────────────────────────────────────────────────────
function makeStyles(C) {
  return {
    root:      { minHeight:'100vh', background:C.bg, fontFamily:"'DM Sans', sans-serif", color:C.white, paddingBottom:80 },
    header:    { background:C.headerBg, borderBottom:`1px solid ${C.border}`, padding:'24px 20px 20px', display:'flex', alignItems:'flex-start', gap:16 },
    headerTxt: { flex:1 },
    eyebrow:   { fontSize:12, fontWeight:600, color:C.gold, letterSpacing:2, textTransform:'uppercase', marginBottom:3 },
    titleMain: { fontFamily:"'Cormorant Garamond', serif", fontSize:26, fontWeight:700, color:C.white, lineHeight:1.2 },
    titleSub:  { fontSize:14, color:C.muted, marginTop:4 },
    versiculo: { fontFamily:"'Cormorant Garamond', serif", fontSize:14, fontStyle:'italic', color:C.muted, marginTop:10, lineHeight:1.7 },
    versRef:   { color:C.gold, fontStyle:'normal', fontSize:13, fontWeight:600 },
    themeBtn:  { background:'transparent', border:`1.5px solid ${C.border}`, color:C.muted, borderRadius:20, padding:'5px 12px', fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", marginTop:8 },

    bottomMenu: { position:'fixed', bottom:0, left:0, right:0, background:C.card, borderTop:`1px solid ${C.border}`, display:'flex', zIndex:100 },
    menuItem:   { flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'10px 0 8px', cursor:'pointer', border:'none', background:'transparent', gap:3 },
    menuIcon:   { fontSize:20 },
    menuLabel:  { fontSize:10, fontWeight:600, letterSpacing:0.5 },

    listTop:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 20px 14px' },
    listLbl:   { fontSize:11, letterSpacing:2, textTransform:'uppercase', color:C.muted, fontWeight:600 },
    btnNovo:   { background:C.gold, color:C.isDark?'#0D0B20':'#fff', border:'none', borderRadius:12, padding:'11px 20px', fontSize:14, fontWeight:700, cursor:'pointer' },
    empty:     { textAlign:'center', color:C.muted, fontSize:16, padding:'52px 28px', lineHeight:2.4 },
    histLabel: { padding:'8px 20px 4px', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:C.amber, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:8 },

    cultoCard:    { background:C.card, border:`1px solid ${C.border}`, borderRadius:16, display:'flex', overflow:'hidden', marginBottom:12 },
    cultoAccent:  { width:5, flexShrink:0 },
    cultoBody:    { flex:1, padding:'16px 14px', cursor:'pointer' },
    cultoNome:    { fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:700, color:C.white, marginBottom:6 },
    cultoBadge:   { display:'inline-block', background:C.goldDim, color:C.gold, borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:600 },
    cultoData:    { fontSize:13, color:C.muted, marginLeft:8, textTransform:'capitalize' },
    cultoBar:     { height:4, background:C.border, borderRadius:4, marginTop:12, overflow:'hidden' },
    cultoPct:     { fontSize:12, fontWeight:600, marginTop:5 },
    cultoActions: { display:'flex', flexDirection:'column', borderLeft:`1px solid ${C.border}` },
    btnEdit:      { flex:1, background:'transparent', border:'none', borderBottom:`1px solid ${C.border}`, color:C.muted, padding:'0 14px', cursor:'pointer', fontSize:17 },
    btnDel:       { flex:1, background:'transparent', border:'none', color:C.rose, padding:'0 14px', cursor:'pointer', fontSize:17 },

    deptGrid:  { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:'0 20px' },
    deptCard:  { background:C.card, border:`2px solid ${C.border}`, borderRadius:16, padding:'20px 10px', display:'flex', flexDirection:'column', alignItems:'center', gap:10, cursor:'pointer', position:'relative' },
    deptIcon:  { fontSize:30 },
    deptName:  { fontSize:13, fontWeight:600, textAlign:'center', lineHeight:1.4 },
    deptBadge: { position:'absolute', top:8, right:8, background:C.green, borderRadius:20, padding:'2px 8px', fontSize:11, color:'#fff', fontWeight:700 },

    btnVerProg:  { display:'block', margin:'20px auto 0', background:'transparent', border:`2px solid ${C.gold}`, color:C.gold, borderRadius:14, padding:'14px 34px', fontSize:16, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
    btnShare:    { display:'flex', alignItems:'center', justifyContent:'center', gap:8, margin:'10px 20px 0', background:C.green, border:'none', color:'#fff', borderRadius:14, padding:'13px', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
    btnCopyLink: { display:'flex', alignItems:'center', justifyContent:'center', gap:8, margin:'10px 20px 0', background:'transparent', border:`2px solid ${C.blue}`, color:C.blue, borderRadius:14, padding:'12px', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },

    overlay:      { position:'fixed', inset:0, background:C.isDark?'rgba(8,6,22,0.96)':'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:20 },
    senhaBox:     { background:C.card, border:`1px solid ${C.border}`, borderRadius:22, padding:'34px 26px', width:'100%', maxWidth:360, textAlign:'center' },
    senhaTitle:   { fontFamily:"'Cormorant Garamond', serif", fontSize:24, fontWeight:700, color:C.gold, marginBottom:8, marginTop:14 },
    senhaSub:     { fontSize:15, color:C.muted, marginBottom:24, lineHeight:1.7 },
    senhaInput:   { width:'100%', background:C.inputBg, border:`2px solid ${C.border}`, borderRadius:12, padding:'13px', fontSize:18, color:C.white, textAlign:'center', letterSpacing:4, fontFamily:"'DM Sans',sans-serif", outline:'none', marginBottom:12, boxSizing:'border-box' },
    senhaErr:     { color:C.rose, fontSize:15, minHeight:22, marginBottom:10 },
    modal:        { background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:380 },
    modalTitle:   { fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:700, color:C.white, marginBottom:10 },
    modalText:    { fontSize:15, color:C.muted, lineHeight:1.7, marginBottom:22 },
    modalBtns:    { display:'flex', gap:10 },
    btnMdCancel:  { flex:1, background:C.inputBg, border:`1px solid ${C.border}`, color:C.muted, borderRadius:10, padding:'12px', fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
    btnMdConfirm: { flex:1, background:C.rose, border:'none', color:'#fff', borderRadius:10, padding:'12px', fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },

    deptHeader: { padding:'20px', borderBottom:`1px solid ${C.border}`, background:C.isDark?C.surface:C.card },
    backBtn:    { background:C.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)', border:'none', color:C.muted, borderRadius:9, padding:'7px 14px', fontSize:13, cursor:'pointer', marginBottom:14, display:'inline-block', fontFamily:"'DM Sans',sans-serif" },
    formArea:   { padding:'20px' },
    fieldGroup: { marginBottom:20 },
    fieldLabel: { display:'block', fontSize:12, fontWeight:600, color:C.muted, marginBottom:8, letterSpacing:0.8, textTransform:'uppercase' },
    fieldHint:  { fontSize:13, color:C.amber, marginBottom:8, background:C.isDark?'rgba(224,144,32,0.12)':'rgba(180,100,0,0.08)', borderRadius:8, padding:'7px 12px', border:`1px solid ${C.amber}44` },
    input:      { width:'100%', background:C.inputBg, border:`2px solid ${C.border}`, borderRadius:12, padding:'13px 15px', fontSize:16, color:C.white, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' },
    select:     { width:'100%', background:C.inputBg, border:`2px solid ${C.border}`, borderRadius:12, padding:'13px 15px', fontSize:16, color:C.white, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box', cursor:'pointer' },
    textarea:   { width:'100%', background:C.inputBg, border:`2px solid ${C.border}`, borderRadius:12, padding:'13px 15px', fontSize:16, color:C.white, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box', resize:'vertical', minHeight:90 },
    infoBox:    { background:C.isDark?'rgba(123,95,204,0.14)':'rgba(107,79,187,0.08)', border:`1px solid ${C.purple}55`, borderRadius:12, padding:'13px 15px', fontSize:14, color:C.purple, marginBottom:18, lineHeight:1.8 },
    infoAmber:  { background:C.isDark?'rgba(212,136,26,0.12)':'rgba(180,100,0,0.08)', border:`1px solid ${C.amber}55`, borderRadius:12, padding:'13px 15px', fontSize:14, color:C.amber, marginBottom:18, lineHeight:1.8 },
    infoTeal:   { background:C.isDark?'rgba(42,149,149,0.12)':'rgba(26,136,136,0.08)', border:`1px solid ${C.teal}55`, borderRadius:12, padding:'13px 15px', fontSize:14, color:C.teal, marginBottom:18, lineHeight:1.8 },
    btnSalvar:  { width:'100%', border:'none', borderRadius:14, padding:'16px', fontSize:17, fontWeight:700, cursor:'pointer', marginTop:10, fontFamily:"'DM Sans',sans-serif" },
    btnPrimary: { background:`linear-gradient(135deg, ${C.gold}, #B8862A)`, color:C.isDark?'#0D0B20':'#fff', border:'none', borderRadius:14, padding:'14px 26px', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", width:'100%', marginTop:10 },
    btnSecondary:{ background:'transparent', border:`2px solid ${C.border}`, color:C.muted, borderRadius:14, padding:'12px 26px', fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", width:'auto', marginTop:0 },

    conflictBar:{ background:C.isDark?'rgba(224,85,85,0.12)':'rgba(192,56,56,0.08)', borderTop:`3px solid ${C.rose}`, padding:'13px 20px', fontSize:14, color:C.rose, lineHeight:1.7 },
    progHeader: { background:C.headerBg, borderBottom:`1px solid ${C.border}`, padding:'24px 20px' },
    progTitle:  { fontFamily:"'Cormorant Garamond', serif", fontSize:28, fontWeight:700, color:C.gold, lineHeight:1.1, marginTop:8 },
    progData:   { fontSize:14, color:C.muted, marginTop:5, textTransform:'capitalize' },
    anciaoBox:  { marginTop:12, background:C.isDark?'rgba(74,144,229,0.15)':'rgba(46,111,212,0.08)', border:`1px solid ${C.blue}44`, borderRadius:12, padding:'12px 15px', display:'flex', alignItems:'center', gap:10 },
    anciaoLbl:  { fontSize:11, fontWeight:600, color:C.blue, letterSpacing:1, textTransform:'uppercase' },
    anciaoVal:  { fontSize:20, fontWeight:700, color:C.white },
    progBody:   { padding:'18px 20px', display:'flex', flexDirection:'column', gap:12 },
    pSection:   { background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:'18px 16px', borderLeft:'5px solid' },
    pSecTitle:  { fontFamily:"'Cormorant Garamond', serif", fontSize:20, fontWeight:700, marginBottom:14 },
    separador:  { background:C.sepBg, border:`1px solid ${C.gold}44`, borderRadius:12, padding:'13px 18px', textAlign:'center', fontFamily:"'Cormorant Garamond', serif", fontSize:23, fontWeight:700, color:C.gold, letterSpacing:3 },
    pRow:       { display:'flex', flexDirection:'column', marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.border}` },
    pRowLast:   { display:'flex', flexDirection:'column' },
    pLabel:     { fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1.2, textTransform:'uppercase', marginBottom:4 },
    pValue:     { fontSize:17, color:C.white, lineHeight:1.5 },
    pEmpty:     { fontSize:15, color:C.border, fontStyle:'italic' },

    tipoGrid:       { display:'flex', flexWrap:'wrap', gap:10 },
    tipoBadge:      { background:C.inputBg, border:`2px solid ${C.border}`, color:C.muted, borderRadius:20, padding:'9px 16px', fontSize:14, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
    tipoBadgeActive:{ background:C.goldDim, border:`2px solid ${C.gold}`, color:C.gold, fontWeight:700 },
    loading:    { display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:C.bg, flexDirection:'column', gap:20 },
    footer:     { textAlign:'center', marginTop:28, fontSize:12, color:C.muted, padding:'0 20px', lineHeight:2.2 },
    sectionLbl: { padding:'22px 20px 12px', fontSize:11, letterSpacing:2, textTransform:'uppercase', color:C.muted, fontWeight:600 },

    escalaHeader:   { background:C.headerBg, borderBottom:`1px solid ${C.border}`, padding:'24px 20px 20px' },
    escalaMesNav:   { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 8px' },
    escalaMesTitle: { fontFamily:"'Cormorant Garamond', serif", fontSize:22, fontWeight:700, color:C.white },
    escalaMesBtn:   { background:'transparent', border:`1.5px solid ${C.border}`, color:C.muted, borderRadius:10, padding:'8px 16px', fontSize:16, cursor:'pointer' },
    escalaRow:      { background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'14px 16px', marginBottom:10 },
    escalaRowSab:   { background:C.isDark?'rgba(212,168,67,0.08)':'rgba(184,134,11,0.05)', border:`1px solid ${C.gold}33`, borderRadius:14, padding:'14px 16px', marginBottom:10 },
    escalaRowJA:    { background:C.isDark?'rgba(139,111,220,0.1)':'rgba(107,79,187,0.05)', border:`1px solid ${C.purple}33`, borderRadius:14, padding:'14px 16px', marginBottom:10 },
    escalaData:     { fontSize:14, fontWeight:700, color:C.gold, marginBottom:2 },
    escalaDia:      { fontSize:12, color:C.muted, marginBottom:8, letterSpacing:0.5, textTransform:'uppercase', fontWeight:600 },
    escalaTurno:    { fontSize:11, fontWeight:700, color:C.purple, letterSpacing:1, textTransform:'uppercase', background:C.isDark?'rgba(139,111,220,0.2)':'rgba(107,79,187,0.1)', borderRadius:6, padding:'2px 8px', display:'inline-block', marginBottom:8 },
    escalaLabel:    { fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1, textTransform:'uppercase', marginBottom:4 },
    escalaValue:    { fontSize:15, color:C.white },
    escalaEmpty:    { fontSize:14, color:C.border, fontStyle:'italic' },
    btnAddLinha:    { display:'block', margin:'0 20px 16px', background:'transparent', border:`2px dashed ${C.border}`, color:C.muted, borderRadius:14, padding:'14px', fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", width:'calc(100% - 40px)' },
    btnEscalaEdit:  { background:`linear-gradient(135deg, ${C.gold}, #B8862A)`, color:C.isDark?'#0D0B20':'#fff', border:'none', borderRadius:14, padding:'14px', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", margin:'0 20px 16px', display:'block', width:'calc(100% - 40px)' },
  };
}

// ── COMPONENTE SELECT COM OPÇÃO LIVRE ──────────────────────────────────────
function SelectOuDigitar({ value, onChange, lista, placeholder, s, C }) {
  const [modo, setModo] = useState('lista');
  const isCustom = value && !lista.includes(value) && value !== '';

  useEffect(() => {
    if (isCustom) setModo('livre');
  }, []);

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:8 }}>
        <button style={{ ...s.tipoBadge, ...(modo==='lista'?s.tipoBadgeActive:{}), padding:'6px 14px', fontSize:13 }}
          onClick={() => setModo('lista')}>📋 Lista</button>
        <button style={{ ...s.tipoBadge, ...(modo==='livre'?{ ...s.tipoBadgeActive, borderColor:C.teal, color:C.teal, background:C.isDark?'rgba(42,149,149,0.15)':'rgba(26,136,136,0.1)' }:{}), padding:'6px 14px', fontSize:13 }}
          onClick={() => setModo('livre')}>✏️ Digitar</button>
      </div>
      {modo==='lista' ? (
        <select style={s.select} value={lista.includes(value)?value:''} onChange={e => onChange(e.target.value)}>
          <option value="">— {placeholder||'Selecione'} —</option>
          {lista.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      ) : (
        <input style={s.input} value={value} placeholder={placeholder||'Digite o nome'}
          onChange={e => onChange(e.target.value)}/>
      )}
    </div>
  );
}

// ── COMPONENTES ────────────────────────────────────────────────────────────
function SenhaModal({ titulo, subtitulo, icon, color, senhaEsperada, onSuccess, onCancel, s, C }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const check = () => {
    if (val === senhaEsperada) onSuccess();
    else { setErr('Senha incorreta.'); setVal(''); }
  };
  return (
    <div style={s.overlay}>
      <div style={s.senhaBox}>
        <Logo size={56}/>
        <div style={{ ...s.senhaTitle, color:color||C.gold }}>{icon} {titulo}</div>
        <div style={s.senhaSub}>{subtitulo}</div>
        <input style={s.senhaInput} type="password" maxLength={20} value={val} autoFocus placeholder="••••••••"
          onChange={e => { setVal(e.target.value); setErr(''); }}
          onKeyDown={e => e.key==='Enter' && check()}/>
        <div style={s.senhaErr}>{err}</div>
        <button style={{ ...s.btnPrimary, marginTop:0 }} onClick={check}>Entrar</button>
        <button style={{ ...s.btnMdCancel, marginTop:12, width:'100%' }} onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}

function FotoUpload({ value, onChange, s, C }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const handleFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { onChange(await uploadFoto(file)); }
    catch (err) { alert('Erro ao enviar foto: ' + err.message); }
    finally { setUploading(false); }
  };
  return (
    <div>
      {value ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <img src={value} alt="Pregador" style={{ width:140, height:140, objectFit:'cover', borderRadius:12, border:`2px solid ${C.border}` }}/>
          <button style={{ ...s.btnMdCancel, fontSize:13, padding:'8px 16px' }} onClick={() => onChange('')}>🗑 Remover</button>
        </div>
      ) : (
        <button style={{ width:'100%', background:C.inputBg, border:`2px dashed ${C.border}`, borderRadius:12, padding:'24px', color:C.muted, fontSize:15, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", lineHeight:1.8 }}
          onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Enviando...' : '📷 Toque para escolher a foto do pregador'}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
    </div>
  );
}

function Toast({ msg }) {
  return <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:'#34BB7A', color:'#fff', borderRadius:20, padding:'12px 24px', fontSize:14, fontWeight:600, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.3)', whiteSpace:'nowrap' }}>{msg}</div>;
}

function PRow({ label, value, last, highlight, C }) {
  return (
    <div style={{ ...(last?{ display:'flex', flexDirection:'column' }:{ display:'flex', flexDirection:'column', marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.border}` }), ...(highlight?{ background:C.isDark?'rgba(224,85,85,0.1)':'rgba(192,56,56,0.06)', borderRadius:8, padding:'7px 10px' }:{}) }}>
      <span style={{ fontSize:11, fontWeight:600, color:C.muted, letterSpacing:1.2, textTransform:'uppercase', marginBottom:4 }}>{label}</span>
      <span style={{ fontSize:17, color:C.white, lineHeight:1.5 }}>
        {value || <span style={{ fontSize:15, color:C.border, fontStyle:'italic' }}>Não preenchido</span>}
        {highlight && <span style={{ color:C.rose, fontSize:12, marginLeft:8 }}>⚠ conflito</span>}
      </span>
    </div>
  );
}

// ── BANNER NOTIF ───────────────────────────────────────────────────────────
function BannerHoje({ notifAviso, onClose, C }) {
  if (!notifAviso) return null;
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:999,
      background:C.gold, padding:'14px 16px 12px', boxShadow:'0 4px 20px rgba(0,0,0,0.3)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:13, color:'#0D0B20', marginBottom:4 }}>⛪ Hoje na Igreja</div>
          {notifAviso.map((a,i) => (
            <div key={i} style={{ fontSize:15, color:'#0D0B20', fontWeight:600 }}>{a}</div>
          ))}
        </div>
        <button onClick={onClose}
          style={{ background:'rgba(0,0,0,0.15)', border:'none', borderRadius:20,
            color:'#0D0B20', padding:'4px 10px', fontSize:13, cursor:'pointer' }}>✕</button>
      </div>
    </div>
  );
}

// ── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [cultos, setCultos]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [view, setView]                   = useState('home');
  const [menu, setMenu]                   = useState('programa');
  const [activeCultoId, setActiveCultoId] = useState(null);
  const [activeDept, setActiveDept]       = useState(null);
  const [saving, setSaving]               = useState(false);
  const [savedOk, setSavedOk]             = useState(false);
  const [localProg, setLocalProg]         = useState(null);
  const [senhaTarget, setSenhaTarget]     = useState(null);
  const [masterAction, setMasterAction]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [novoNome, setNovoNome]           = useState('');
  const [novoData, setNovoData]           = useState('');
  const [novoTipo, setNovoTipo]           = useState(CULTO_TIPOS[0]);
  const [editandoId, setEditandoId]       = useState(null);
  const [darkMode, setDarkMode]           = useState(true);
  const [toast, setToast]                 = useState('');
  const [mostrarHist, setMostrarHist]     = useState(false);
  const [notifAviso, setNotifAviso]       = useState(null);

  // Escala Pregadores — inicia no mês atual
  const [escalas, setEscalas]               = useState({});
  const [escalaMes, setEscalaMes]           = useState(new Date().getMonth());
  const [escalaAno, setEscalaAno]           = useState(new Date().getFullYear());
  const [escalaEditando, setEscalaEditando] = useState(false);
  const [escalaLocal, setEscalaLocal]       = useState([]);
  const [senhaEscala, setSenhaEscala]       = useState(false);
  const [novaLinhaModal, setNovaLinhaModal] = useState(false);
  const [novaLinha, setNovaLinha]           = useState({ data:'', dia:'Sábado', pregadorCentral:'', anciao:'', igrejaDistrito:'—', pregadorDistrito:'' });
  const [verPassadasEscala, setVerPassadasEscala] = useState(false);
  const [verPassadasMidia, setVerPassadasMidia]   = useState(false);
  const [verPassadasMusica, setVerPassadasMusica] = useState(false);

  // Escala Mídia — inicia no mês atual
  const [escalasMidia, setEscalasMidia]         = useState({});
  const [escalaMidiaMes, setEscalaMidiaMes]     = useState(new Date().getMonth());
  const [escalaMidiaAno, setEscalaMidiaAno]     = useState(new Date().getFullYear());
  const [midiaEditando, setMidiaEditando]       = useState(false);
  const [midiaLocal, setMidiaLocal]             = useState([]);
  const [senhaMidia, setSenhaMidia]             = useState(false);
  const [novaLinhaMidiaModal, setNovaLinhaMidiaModal] = useState(false);
  const [novaLinhaMidia, setNovaLinhaMidia]     = useState({ data:'', dia:'Sábado', turno:'', som:'', midia:'', transmissao:'' });

  // Escala Música — inicia no mês atual
  const [escalasMusicaDB, setEscalasMusicaDB]     = useState({});
  const [escalaMusicaMes, setEscalaMusicaMes]     = useState(new Date().getMonth());
  const [escalaMusicaAno, setEscalaMusicaAno]     = useState(new Date().getFullYear());
  const [musicaEditando, setMusicaEditando]       = useState(false);
  const [musicaLocal, setMusicaLocal]             = useState([]);
  const [senhaMusica, setSenhaMusica]             = useState(false);
  const [novaLinhaMusicaModal, setNovaLinhaMusicaModal] = useState(false);
  const [novaLinhaMusica, setNovaLinhaMusica]     = useState({ data:'', dia:'Sábado', equipelouvor:'', orquestra:'', mensagemmusical:'' });

  const BACK_MAP = {
    cultoDash:'home', dept:'cultoDash', programa:'cultoDash',
    novo:'home', escalas:'home', midia:'home', musica:'home',
  };

  useEffect(() => {
    window.history.pushState({ view }, '', window.location.pathname);
  }, [view]);

  useEffect(() => {
    const handlePop = () => {
      setView(currentView => {
        const destino = BACK_MAP[currentView];
        if (!destino) {
          const sair = window.confirm('Deseja sair do aplicativo?');
          if (!sair) window.history.pushState({ view: currentView }, '', window.location.pathname);
          return currentView;
        }
        if (currentView === 'dept') setActiveDept(null);
        return destino;
      });
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const C = makeColors(darkMode);
  const s = makeStyles(C);

  useEffect(() => {
    const t = localStorage.getItem('icv-theme');
    if (t) setDarkMode(t==='dark');
  }, []);
  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('icv-theme', next?'dark':'light');
  };

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  useEffect(() => {
    const unsub = onValue(ref(db,'cultos'), snap => {
      const val = snap.val();
      setCultos(val ? Object.values(val) : []);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onValue(ref(db,'escalas'), snap => {
      const val = snap.val() || {};
      if (!val['2026-05']) {
        set(ref(db,'escalas/2026-05'), { linhas: ESCALA_PREGO_MAIO });
        val['2026-05'] = { linhas: ESCALA_PREGO_MAIO };
      }
      setEscalas(val);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onValue(ref(db,'escalasMidia'), snap => {
      const val = snap.val() || {};
      if (!val['2026-05']) {
        set(ref(db,'escalasMidia/2026-05'), { linhas: ESCALA_MIDIA_MAIO });
        val['2026-05'] = { linhas: ESCALA_MIDIA_MAIO };
      }
      setEscalasMidia(val);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onValue(ref(db,'escalasMusicaDB'), snap => {
      setEscalasMusicaDB(snap.val() || {});
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    registrarNotificacoes();
  }, []);

  useEffect(() => {
    if (Object.keys(escalas).length === 0) return;
    const hoje = new Date();
    const hojeStr = `${String(hoje.getDate()).padStart(2,'0')}/${String(hoje.getMonth()+1).padStart(2,'0')}/${hoje.getFullYear()}`;
    const avisos = [];
    Object.values(escalas).forEach(mes => {
      (mes.linhas||[]).forEach(linha => {
        if (linha.data === hojeStr) {
          if (linha.pregadorCentral) avisos.push(`📖 Pregador hoje: ${linha.pregadorCentral}`);
          if (linha.anciao) avisos.push(`🙏 Ancião hoje: ${linha.anciao}`);
        }
      });
    });
    if (avisos.length === 0) return;
    setNotifAviso(avisos);
  }, [escalas]);

  useEffect(() => {
    cultos.forEach(c => {
      if (isCultoPassado(c) && diasDesdePassado(c) > HIST_DIAS) {
        set(ref(db,`cultos/${c.id}`), null);
      }
    });
  }, [cultos]);

  const cultoAtivo  = cultos.find(c => c.id === activeCultoId);
  const tipo        = cultoAtivo?.tipo || '';
  const temEscola   = COM_ESCOLA.includes(tipo);
  const temInfantil = COM_INFANTIL.includes(tipo);
  const temExtra    = COM_EXTRA.includes(tipo);
  const cultosAtivos    = cultos.filter(c => !isCultoPassado(c));
  const cultosHistorico = cultos.filter(c => isCultoPassado(c));

  useEffect(() => {
    if (view==='dept' && cultoAtivo) setLocalProg({ ...EMPTY_PROG(), ...cultoAtivo.programa });
  }, [view, activeCultoId]);

  const salvarPrograma = useCallback(async () => {
    if (!localProg || !activeCultoId) return;
    setSaving(true);
    try {
      const p = {};
      Object.keys(EMPTY_PROG()).forEach(k => { p[k] = localProg[k]||''; });
      await set(ref(db,`cultos/${activeCultoId}/programa`), p);
      setSavedOk(true);
      setTimeout(() => { setSavedOk(false); setView('cultoDash'); }, 1200);
    } catch(e) { alert('Erro ao salvar: ' + e.message); }
    finally { setSaving(false); }
  }, [localProg, activeCultoId]);

  const criarCulto = async () => {
    if (!novoNome.trim()) return;
    const base = editandoId ? cultos.find(x=>x.id===editandoId) : null;
    const c = base ? { ...base, nome:novoNome.trim(), data:novoData, tipo:novoTipo } : newCulto(novoNome.trim(), novoData, novoTipo);
    await set(ref(db,`cultos/${c.id}`), c);
    setNovoNome(''); setNovoData(''); setNovoTipo(CULTO_TIPOS[0]); setEditandoId(null);
    setView('home');
  };

  const excluirCulto = async (id) => {
    await set(ref(db,`cultos/${id}`), null);
    setConfirmDelete(null);
    if (activeCultoId===id) { setActiveCultoId(null); setView('home'); }
  };

  const abrirDept = (key) => setSenhaTarget(key);
  const onSenhaOk = () => { setActiveDept(senhaTarget); setSenhaTarget(null); setView('dept'); };
  const onMasterOk = () => {
    const { type, id } = masterAction; setMasterAction(null);
    if (type==='criar')   { setEditandoId(null); setNovoNome(''); setNovoData(''); setNovoTipo(CULTO_TIPOS[0]); setView('novo'); }
    else if (type==='editar')  { const c=cultos.find(x=>x.id===id); setEditandoId(id); setNovoNome(c.nome); setNovoData(c.data||''); setNovoTipo(c.tipo); setView('novo'); }
    else if (type==='excluir') { setConfirmDelete(id); }
  };

  // ── Escala Pregadores ─────────────────────────────────────────────────────
  const chaveEscala = `${escalaAno}-${String(escalaMes+1).padStart(2,'0')}`;
  const linhasEscala = escalas[chaveEscala]?.linhas || gerarDatasDoMes(escalaAno, escalaMes);
  const iniciarEdicaoEscala = () => { setEscalaLocal([...linhasEscala]); setEscalaEditando(true); };
  const salvarEscala = async () => { await set(ref(db,`escalas/${chaveEscala}`), { linhas: escalaLocal }); setEscalaEditando(false); showToast('✅ Escala salva!'); };
  const updateLinha = (idx, field, val) => setEscalaLocal(prev => prev.map((l,i) => i===idx ? { ...l, [field]:val } : l));
  const removerLinha = (idx) => setEscalaLocal(prev => prev.filter((_,i) => i!==idx));
  const adicionarLinha = () => {
    if (!novaLinha.data) return;
    const [d,m,a] = novaLinha.data.split('/');
    const id = `${a||escalaAno}-${m||String(escalaMes+1).padStart(2,'0')}-${d}`;
    const novas = [...escalaLocal, { ...novaLinha, id }].sort((a,b) => a.id.localeCompare(b.id));
    setEscalaLocal(novas);
    setNovaLinhaModal(false);
    setNovaLinha({ data:'', dia:'Sábado', pregadorCentral:'', anciao:'', igrejaDistrito:'—', pregadorDistrito:'' });
  };

  // ── Escala Mídia ──────────────────────────────────────────────────────────
  const chaveMidia = `${escalaMidiaAno}-${String(escalaMidiaMes+1).padStart(2,'0')}`;
  const linhasMidia = escalasMidia[chaveMidia]?.linhas || gerarDatasDoMesMidia(escalaMidiaAno, escalaMidiaMes);
  const iniciarEdicaoMidia = () => { setMidiaLocal([...linhasMidia]); setMidiaEditando(true); };
  const salvarMidia = async () => { await set(ref(db,`escalasMidia/${chaveMidia}`), { linhas: midiaLocal }); setMidiaEditando(false); showToast('✅ Escala de Mídia salva!'); };
  const updateMidia = (idx, field, val) => setMidiaLocal(prev => prev.map((l,i) => i===idx ? { ...l, [field]:val } : l));
  const removerMidia = (idx) => setMidiaLocal(prev => prev.filter((_,i) => i!==idx));
  const adicionarMidia = () => {
    if (!novaLinhaMidia.data) return;
    const [d,m,a] = novaLinhaMidia.data.split('/');
    const id = `${a||escalaMidiaAno}-${m||String(escalaMidiaMes+1).padStart(2,'00')}-${d}${novaLinhaMidia.turno==='J.A'?'-ja':''}`;
    const novas = [...midiaLocal, { ...novaLinhaMidia, id }].sort((a,b) => a.id.localeCompare(b.id));
    setMidiaLocal(novas);
    setNovaLinhaMidiaModal(false);
    setNovaLinhaMidia({ data:'', dia:'Sábado', turno:'', som:'', midia:'', transmissao:'' });
  };

  // ── Escala Música ─────────────────────────────────────────────────────────
  const chaveMusica = `${escalaMusicaAno}-${String(escalaMusicaMes+1).padStart(2,'00')}`;
  const linhasMusica = escalasMusicaDB[chaveMusica]?.linhas || gerarDatasDoMesMusica(escalaMusicaAno, escalaMusicaMes);
  const iniciarEdicaoMusica = () => { setMusicaLocal([...linhasMusica]); setMusicaEditando(true); };
  const salvarMusica = async () => { await set(ref(db,`escalasMusicaDB/${chaveMusica}`), { linhas: musicaLocal }); setMusicaEditando(false); showToast('✅ Escala de Música salva!'); };
  const updateMusica = (idx, field, val) => setMusicaLocal(prev => prev.map((l,i) => i===idx ? { ...l, [field]:val } : l));
  const removerMusicaLinha = (idx) => setMusicaLocal(prev => prev.filter((_,i) => i!==idx));
  const adicionarMusicaLinha = () => {
    if (!novaLinhaMusica.data) return;
    const [d,m,a] = novaLinhaMusica.data.split('/');
    const id = `${a||escalaMusicaAno}-${m||String(escalaMusicaMes+1).padStart(2,'00')}-${d}`;
    const novas = [...musicaLocal, { ...novaLinhaMusica, id }].sort((a,b) => a.id.localeCompare(b.id));
    setMusicaLocal(novas);
    setNovaLinhaMusicaModal(false);
    setNovaLinhaMusica({ data:'', dia:'Sábado', equipelouvor:'', orquestra:'', mensagemmusical:'' });
  };

  const hm  = cultoAtivo?.programa?.hinoInicial?.trim()         || '';
  const hp  = cultoAtivo?.programa?.hinoInicialPregador?.trim() || '';
  const hfm = cultoAtivo?.programa?.hinoFinalMusica?.trim()     || '';
  const hfp = cultoAtivo?.programa?.hinoFinalPregador?.trim()   || '';
  const confHino  = hm && hp && hm !== hp;
  const confFinal = hfm && hfp && hfm !== hfp;

  function compartilharWhatsApp() {
    if (!cultoAtivo) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(formatarParaWhatsApp(cultoAtivo))}`, '_blank');
  }
  function copiarLink() {
    navigator.clipboard.writeText(`${window.location.origin}?culto=${activeCultoId}`).then(() => showToast('✅ Link copiado!'));
  }

  if (loading) return (
    <div style={s.loading}><Logo size={80}/><div style={{ color:C.muted, fontSize:16 }}>Carregando...</div></div>
  );

  // ── MENU BOTTOM ────────────────────────────────────────────────────────────
  const MENUS = [
    { id:'programa', icon:'📋', label:'Programa' },
    { id:'escalas',  icon:'📅', label:'Pregadores' },
    { id:'midia',    icon:'🎙', label:'Som & Mídia' },
    { id:'musica',   icon:'🎵', label:'Música' },
  ];

  function BottomMenu() {
    return (
      <div style={s.bottomMenu}>
        {MENUS.map(m => (
          <button key={m.id} style={{ ...s.menuItem, color:menu===m.id?C.gold:C.muted }}
            onClick={() => { setMenu(m.id); if(m.id==='programa') setView('home'); else if(m.id==='escalas') setView('escalas'); else if(m.id==='midia') setView('midia'); else setView('musica'); }}>
            <span style={s.menuIcon}>{m.icon}</span>
            <span style={{ ...s.menuLabel, fontSize:9 }}>{m.label}</span>
          </button>
        ))}
      </div>
    );
  }

  // ── ESCALA MÚSICA ──────────────────────────────────────────────────────────
  if (view === 'musica') {
    const linhas = musicaEditando ? musicaLocal : linhasMusica;
    return (
      <div style={s.root}>
        <BannerHoje notifAviso={notifAviso} onClose={() => setNotifAviso(null)} C={C}/>
        <div style={s.escalaHeader}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Logo size={44}/>
            <div>
              <div style={s.eyebrow}>Igreja Adventista do Sétimo Dia</div>
              <div style={s.titleMain}>Escala de Música</div>
              <div style={s.titleSub}>Equipe de Louvor · Orquestra · Mensagem Musical</div>
            </div>
          </div>
        </div>

        <div style={s.escalaMesNav}>
          <button style={s.escalaMesBtn} onClick={() => { if(escalaMusicaMes===0){setEscalaMusicaMes(11);setEscalaMusicaAno(a=>a-1);}else setEscalaMusicaMes(m=>m-1); setMusicaEditando(false); }}>◀</button>
          <div style={s.escalaMesTitle}>{MESES[escalaMusicaMes]} {escalaMusicaAno}</div>
          <button style={s.escalaMesBtn} onClick={() => { if(escalaMusicaMes===11){setEscalaMusicaMes(0);setEscalaMusicaAno(a=>a+1);}else setEscalaMusicaMes(m=>m+1); setMusicaEditando(false); }}>▶</button>
        </div>

        {!musicaEditando ? (
          <button style={s.btnEscalaEdit} onClick={() => setSenhaMusica(true)}>✏️ Editar escala</button>
        ) : (
          <div style={{ display:'flex', gap:10, margin:'0 20px 16px' }}>
            <button style={{ ...s.btnPrimary, marginTop:0 }} onClick={salvarMusica}>💾 Salvar escala</button>
            <button style={{ ...s.btnSecondary, padding:'14px 20px' }} onClick={() => setMusicaEditando(false)}>Cancelar</button>
          </div>
        )}

        <div style={{ padding:'0 20px 20px' }}>
          {(() => {
            const hoje2 = new Date();
            const hojeId = `${hoje2.getFullYear()}-${String(hoje2.getMonth()+1).padStart(2,'0')}-${String(hoje2.getDate()).padStart(2,'0')}`;
            const qtdPassadas = linhas.filter(l => l.id < hojeId).length;
            return !musicaEditando && qtdPassadas > 0 ? (
              <button onClick={() => setVerPassadasMusica(v=>!v)}
                style={{ width:'100%', background:'transparent', border:`1px dashed ${C.border}`, color:C.muted, borderRadius:10, padding:'10px', fontSize:13, cursor:'pointer', marginBottom:12 }}>
                {verPassadasMusica ? '▲ Ocultar datas anteriores' : `▼ Ver ${qtdPassadas} data(s) anterior(es)`}
              </button>
            ) : null;
          })()}

          {linhas.map((linha, idx) => {
            const hoje2 = new Date();
            const hojeId = `${hoje2.getFullYear()}-${String(hoje2.getMonth()+1).padStart(2,'0')}-${String(hoje2.getDate()).padStart(2,'0')}`;
            const isPast = linha.id < hojeId;
            const isHoje = linha.id === hojeId;
            const isSab  = linha.dia === 'Sábado';
            const cardSt = isSab ? s.escalaRowSab : s.escalaRow;
            if (isPast && !musicaEditando && !verPassadasMusica) return null;
            return (
              <div key={linha.id||idx} style={{ ...cardSt, opacity:isPast ? 0.5 : 1 }}>
                {!musicaEditando ? (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={s.escalaData}>{linha.data}</div>
                      {isHoje && <span style={{ background:C.green, color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>HOJE</span>}
                    </div>
                    <div style={s.escalaDia}>{linha.dia}</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                      <div>
                        <div style={s.escalaLabel}>🎤 Equipe de Louvor</div>
                        <div style={linha.equipelouvor ? s.escalaValue : s.escalaEmpty}>{linha.equipelouvor || '—'}</div>
                      </div>
                      <div>
                        <div style={s.escalaLabel}>🎻 Orquestra</div>
                        <div style={linha.orquestra ? s.escalaValue : s.escalaEmpty}>{linha.orquestra || '—'}</div>
                      </div>
                      <div>
                        <div style={s.escalaLabel}>🎶 Mensagem Musical</div>
                        <div style={linha.mensagemmusical ? s.escalaValue : s.escalaEmpty}>{linha.mensagemmusical || '—'}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <div>
                        <span style={{ ...s.escalaData, display:'inline' }}>{linha.data} </span>
                        <span style={{ ...s.escalaDia, display:'inline', marginBottom:0 }}>{linha.dia}</span>
                      </div>
                      <button style={{ background:C.rose+'22', border:`1px solid ${C.rose}44`, color:C.rose, borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:13 }}
                        onClick={() => removerMusicaLinha(idx)}>✕</button>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      <div>
                        <div style={s.escalaLabel}>🎤 Equipe de Louvor</div>
                        <SelectOuDigitar
                          value={linha.equipelouvor}
                          onChange={val => updateMusica(idx, 'equipelouvor', val)}
                          lista={NOMES_MUSICA}
                          placeholder="Selecione ou digite"
                          s={s} C={C}
                        />
                      </div>
                      <div>
                        <div style={s.escalaLabel}>🎻 Orquestra</div>
                        <SelectOuDigitar
                          value={linha.orquestra}
                          onChange={val => updateMusica(idx, 'orquestra', val)}
                          lista={NOMES_MUSICA}
                          placeholder="Selecione ou digite"
                          s={s} C={C}
                        />
                      </div>
                      <div>
                        <div style={s.escalaLabel}>🎶 Mensagem Musical</div>
                        <SelectOuDigitar
                          value={linha.mensagemmusical}
                          onChange={val => updateMusica(idx, 'mensagemmusical', val)}
                          lista={NOMES_MUSICA}
                          placeholder="Selecione ou digite"
                          s={s} C={C}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {musicaEditando && (
            <button style={s.btnAddLinha} onClick={() => setNovaLinhaMusicaModal(true)}>
              + Adicionar data especial
            </button>
          )}
        </div>

        {novaLinhaMusicaModal && (
          <div style={s.overlay}><div style={s.modal}>
            <div style={s.modalTitle}>+ Data Especial</div>
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Data (dd/mm/aaaa)</label>
              <input style={s.input} value={novaLinhaMusica.data} placeholder="Ex: 25/12/2026"
                onChange={e => setNovaLinhaMusica(l=>({...l,data:e.target.value}))}/>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Dia da Semana</label>
              <select style={s.select} value={novaLinhaMusica.dia} onChange={e => setNovaLinhaMusica(l=>({...l,dia:e.target.value}))}>
                {['Sábado','Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={s.modalBtns}>
              <button style={s.btnMdCancel} onClick={() => setNovaLinhaMusicaModal(false)}>Cancelar</button>
              <button style={{ ...s.btnMdConfirm, background:C.green }} onClick={adicionarMusicaLinha}>Adicionar</button>
            </div>
          </div></div>
        )}

        {senhaMusica && (
          <SenhaModal titulo="Editar Escala de Música" subtitulo="Digite a senha do diretor de música." icon="🎵" color={C.pink}
            senhaEsperada={SENHA_MUSICA} s={s} C={C}
            onSuccess={() => { setSenhaMusica(false); iniciarEdicaoMusica(); }}
            onCancel={() => setSenhaMusica(false)}/>
        )}

        {toast && <Toast msg={toast}/>}
        <div style={s.footer}>Igreja Adventista Central de Votuporanga<br/><span style={{ color:C.muted }}>Desenvolvido por Kleber Vicente</span></div>
        <BottomMenu/>
      </div>
    );
  }

  // ── ESCALA MÍDIA ───────────────────────────────────────────────────────────
  if (view === 'midia') {
    const linhas = midiaEditando ? midiaLocal : linhasMidia;
    return (
      <div style={s.root}>
        <BannerHoje notifAviso={notifAviso} onClose={() => setNotifAviso(null)} C={C}/>
        <div style={s.escalaHeader}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Logo size={44}/>
            <div>
              <div style={s.eyebrow}>Igreja Adventista do Sétimo Dia</div>
              <div style={s.titleMain}>Escala Som, Mídia e Transmissão</div>
              <div style={s.titleSub}>Central de Votuporanga</div>
            </div>
          </div>
        </div>

        <div style={s.escalaMesNav}>
          <button style={s.escalaMesBtn} onClick={() => { if(escalaMidiaMes===0){setEscalaMidiaMes(11);setEscalaMidiaAno(a=>a-1);}else setEscalaMidiaMes(m=>m-1); setMidiaEditando(false); }}>◀</button>
          <div style={s.escalaMesTitle}>{MESES[escalaMidiaMes]} {escalaMidiaAno}</div>
          <button style={s.escalaMesBtn} onClick={() => { if(escalaMidiaMes===11){setEscalaMidiaMes(0);setEscalaMidiaAno(a=>a+1);}else setEscalaMidiaMes(m=>m+1); setMidiaEditando(false); }}>▶</button>
        </div>

        {!midiaEditando ? (
          <button style={s.btnEscalaEdit} onClick={() => setSenhaMidia(true)}>✏️ Editar escala</button>
        ) : (
          <div style={{ display:'flex', gap:10, margin:'0 20px 16px' }}>
            <button style={{ ...s.btnPrimary, marginTop:0 }} onClick={salvarMidia}>💾 Salvar escala</button>
            <button style={{ ...s.btnSecondary, padding:'14px 20px' }} onClick={() => setMidiaEditando(false)}>Cancelar</button>
          </div>
        )}

        <div style={{ padding:'0 20px 20px' }}>
          {(() => {
            const hoje2 = new Date();
            const hojeId = `${hoje2.getFullYear()}-${String(hoje2.getMonth()+1).padStart(2,'0')}-${String(hoje2.getDate()).padStart(2,'0')}`;
            const qtdPassadas = linhas.filter(l => l.id.replace('-ja','') < hojeId).length;
            return !midiaEditando && qtdPassadas > 0 ? (
              <button onClick={() => setVerPassadasMidia(v=>!v)}
                style={{ width:'100%', background:'transparent', border:`1px dashed ${C.border}`, color:C.muted, borderRadius:10, padding:'10px', fontSize:13, cursor:'pointer', marginBottom:12 }}>
                {verPassadasMidia ? '▲ Ocultar datas anteriores' : `▼ Ver ${qtdPassadas} data(s) anterior(es)`}
              </button>
            ) : null;
          })()}
          {linhas.map((linha, idx) => {
            const hoje2 = new Date();
            const hojeId = `${hoje2.getFullYear()}-${String(hoje2.getMonth()+1).padStart(2,'0')}-${String(hoje2.getDate()).padStart(2,'0')}`;
            const isPast = linha.id.replace('-ja','') < hojeId;
            const isHoje = linha.id.replace('-ja','') === hojeId;
            const isSab = linha.dia === 'Sábado' && !linha.turno;
            const isJA  = linha.turno === 'J.A';
            const cardSt = isJA ? s.escalaRowJA : isSab ? s.escalaRowSab : s.escalaRow;
            return (
              <div key={linha.id||idx} style={{ ...cardSt, opacity: isPast ? 0.5 : 1 }}>
                {!midiaEditando ? (
                  <>
                    {!isJA && (
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={s.escalaData}>{linha.data}</div>
                        {isHoje && <span style={{ background:C.green, color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>HOJE</span>}
                      </div>
                    )}
                    {!isJA && <div style={s.escalaDia}>{linha.dia}</div>}
                    {isJA  && <div style={s.escalaTurno}>J.A — Culto da Tarde</div>}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                      <div>
                        <div style={s.escalaLabel}>🎚 Som</div>
                        <div style={linha.som?s.escalaValue:s.escalaEmpty}>{linha.som||'—'}</div>
                      </div>
                      <div>
                        <div style={s.escalaLabel}>📺 Mídia</div>
                        <div style={linha.midia?s.escalaValue:s.escalaEmpty}>{linha.midia||'—'}</div>
                      </div>
                      <div>
                        <div style={s.escalaLabel}>📡 Transmissão</div>
                        <div style={linha.transmissao?s.escalaValue:s.escalaEmpty}>{linha.transmissao||'—'}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <div>
                        {!isJA && <span style={{ ...s.escalaData, display:'inline' }}>{linha.data} </span>}
                        {!isJA && <span style={{ ...s.escalaDia, display:'inline', marginBottom:0 }}>{linha.dia}</span>}
                        {isJA  && <span style={s.escalaTurno}>J.A — Culto da Tarde</span>}
                      </div>
                      <button style={{ background:C.rose+'22', border:`1px solid ${C.rose}44`, color:C.rose, borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:13 }}
                        onClick={() => removerMidia(idx)}>✕</button>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:10 }}>
                      {[
                        { field:'som',         label:'🎚 Equipe Som'         },
                        { field:'midia',       label:'📺 Equipe Mídia'       },
                        { field:'transmissao', label:'📡 Equipe Transmissão' },
                      ].map(({ field, label }) => (
                        <div key={field}>
                          <div style={s.escalaLabel}>{label}</div>
                          <SelectOuDigitar
                            value={linha[field]}
                            onChange={val => updateMidia(idx, field, val)}
                            lista={EQUIPE_MIDIA}
                            placeholder="Selecione ou digite"
                            s={s} C={C}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {midiaEditando && (
            <button style={s.btnAddLinha} onClick={() => setNovaLinhaMidiaModal(true)}>
              + Adicionar data especial
            </button>
          )}
        </div>

        {novaLinhaMidiaModal && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <div style={s.modalTitle}>+ Data Especial</div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Data (dd/mm/aaaa)</label>
                <input style={s.input} value={novaLinhaMidia.data} placeholder="Ex: 25/12/2026"
                  onChange={e => setNovaLinhaMidia(l=>({...l,data:e.target.value}))}/>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Dia da Semana</label>
                <select style={s.select} value={novaLinhaMidia.dia} onChange={e => setNovaLinhaMidia(l=>({...l,dia:e.target.value}))}>
                  {['Sábado','Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>Turno</label>
                <select style={s.select} value={novaLinhaMidia.turno} onChange={e => setNovaLinhaMidia(l=>({...l,turno:e.target.value}))}>
                  <option value="">Principal</option>
                  <option value="J.A">J.A — Culto da Tarde</option>
                </select>
              </div>
              <div style={s.modalBtns}>
                <button style={s.btnMdCancel} onClick={() => setNovaLinhaMidiaModal(false)}>Cancelar</button>
                <button style={{ ...s.btnMdConfirm, background:C.green }} onClick={adicionarMidia}>Adicionar</button>
              </div>
            </div>
          </div>
        )}

        {senhaMidia && (
          <SenhaModal titulo="Editar Escala" subtitulo="Digite a senha do diretor de Som & Mídia." icon="🎙" color={C.teal}
            senhaEsperada={SENHA_MIDIA} s={s} C={C}
            onSuccess={() => { setSenhaMidia(false); iniciarEdicaoMidia(); }}
            onCancel={() => setSenhaMidia(false)}/>
        )}

        {toast && <Toast msg={toast}/>}
        <div style={s.footer}>Igreja Adventista Central de Votuporanga<br/><span style={{ color:C.muted }}>Desenvolvido por Kleber Vicente</span></div>
        <BottomMenu/>
      </div>
    );
  }

  // ── ESCALA PREGADORES ─────────────────────────────────────────────────────
  if (view === 'escalas') {
    const linhas = escalaEditando ? escalaLocal : linhasEscala;
    return (
      <div style={s.root}>
        <BannerHoje notifAviso={notifAviso} onClose={() => setNotifAviso(null)} C={C}/>
        <div style={s.escalaHeader}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Logo size={44}/>
            <div>
              <div style={s.eyebrow}>Igreja Adventista do Sétimo Dia</div>
              <div style={s.titleMain}>Escala de Pregadores e Anciãos</div>
              <div style={s.titleSub}>Central de Votuporanga</div>
            </div>
          </div>
        </div>

        <div style={s.escalaMesNav}>
          <button style={s.escalaMesBtn} onClick={() => { if(escalaMes===0){setEscalaMes(11);setEscalaAno(a=>a-1);}else setEscalaMes(m=>m-1); setEscalaEditando(false); }}>◀</button>
          <div style={s.escalaMesTitle}>{MESES[escalaMes]} {escalaAno}</div>
          <button style={s.escalaMesBtn} onClick={() => { if(escalaMes===11){setEscalaMes(0);setEscalaAno(a=>a+1);}else setEscalaMes(m=>m+1); setEscalaEditando(false); }}>▶</button>
        </div>

        {!escalaEditando ? (
          <button style={s.btnEscalaEdit} onClick={() => setSenhaEscala(true)}>✏️ Editar escala</button>
        ) : (
          <div style={{ display:'flex', gap:10, margin:'0 20px 16px' }}>
            <button style={{ ...s.btnPrimary, marginTop:0 }} onClick={salvarEscala}>💾 Salvar escala</button>
            <button style={{ ...s.btnSecondary, padding:'14px 20px' }} onClick={() => setEscalaEditando(false)}>Cancelar</button>
          </div>
        )}

        <div style={{ padding:'0 20px 20px' }}>
          {(() => {
            const hoje2 = new Date();
            const hojeId = `${hoje2.getFullYear()}-${String(hoje2.getMonth()+1).padStart(2,'0')}-${String(hoje2.getDate()).padStart(2,'0')}`;
            const qtdPassadas = linhas.filter(l => l.id < hojeId).length;
            return !escalaEditando && qtdPassadas > 0 ? (
              <button onClick={() => setVerPassadasEscala(v=>!v)}
                style={{ width:'100%', background:'transparent', border:`1px dashed ${C.border}`, color:C.muted, borderRadius:10, padding:'10px', fontSize:13, cursor:'pointer', marginBottom:12 }}>
                {verPassadasEscala ? '▲ Ocultar datas anteriores' : `▼ Ver ${qtdPassadas} data(s) anterior(es)`}
              </button>
            ) : null;
          })()}
          {linhas.map((linha, idx) => {
            const hoje2 = new Date();
            const hojeId = `${hoje2.getFullYear()}-${String(hoje2.getMonth()+1).padStart(2,'0')}-${String(hoje2.getDate()).padStart(2,'0')}`;
            const isSab = linha.dia === 'Sábado';
            const isHoje = linha.id === hojeId;
            const isPast = linha.id < hojeId;
            const cardSt = isSab ? s.escalaRowSab : s.escalaRow;
            if (isPast && !escalaEditando && !verPassadasEscala) return null;
            return (
              <div key={linha.id||idx} style={{ ...cardSt, opacity: isPast ? 0.5 : 1 }}>
                {!escalaEditando ? (
                  <>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={s.escalaData}>{linha.data}</div>
                      {isHoje && <span style={{ background:C.green, color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700 }}>HOJE</span>}
                    </div>
                    <div style={s.escalaDia}>{linha.dia}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div><div style={s.escalaLabel}>Central</div><div style={linha.pregadorCentral?s.escalaValue:s.escalaEmpty}>{linha.pregadorCentral||'—'}</div></div>
                      <div><div style={s.escalaLabel}>Ancião</div><div style={linha.anciao?s.escalaValue:s.escalaEmpty}>{linha.anciao||'—'}</div></div>
                      <div><div style={s.escalaLabel}>Igreja Distrito</div><div style={linha.igrejaDistrito&&linha.igrejaDistrito!=='—'?s.escalaValue:s.escalaEmpty}>{linha.igrejaDistrito||'—'}</div></div>
                      <div><div style={s.escalaLabel}>Pregador</div><div style={linha.pregadorDistrito?s.escalaValue:s.escalaEmpty}>{linha.pregadorDistrito||'—'}</div></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                      <div>
                        <span style={{ ...s.escalaData, display:'inline' }}>{linha.data} </span>
                        <span style={{ ...s.escalaDia, display:'inline', marginBottom:0 }}>{linha.dia}</span>
                      </div>
                      <button style={{ background:C.rose+'22', border:`1px solid ${C.rose}44`, color:C.rose, borderRadius:8, padding:'4px 10px', cursor:'pointer', fontSize:13 }}
                        onClick={() => removerLinha(idx)}>✕ Remover</button>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div>
                        <div style={s.escalaLabel}>Pregador Central</div>
                        <input style={{ ...s.input, fontSize:14, padding:'9px 12px' }} value={linha.pregadorCentral}
                          placeholder="Nome do pregador" onChange={e => updateLinha(idx,'pregadorCentral',e.target.value)}/>
                      </div>
                      <div>
                        <div style={s.escalaLabel}>Ancião</div>
                        <select style={{ ...s.select, fontSize:14, padding:'9px 12px' }} value={linha.anciao}
                          onChange={e => updateLinha(idx,'anciao',e.target.value)}>
                          <option value="">— Selecione —</option>
                          {ANCIAOS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={s.escalaLabel}>Igreja Distrito</div>
                        <select style={{ ...s.select, fontSize:14, padding:'9px 12px' }} value={linha.igrejaDistrito}
                          onChange={e => updateLinha(idx,'igrejaDistrito',e.target.value)}>
                          {IGREJAS_DISTRITO.map(ig => <option key={ig} value={ig}>{ig}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={s.escalaLabel}>Pregador Distrito</div>
                        <input style={{ ...s.input, fontSize:14, padding:'9px 12px' }} value={linha.pregadorDistrito}
                          placeholder="Nome" onChange={e => updateLinha(idx,'pregadorDistrito',e.target.value)}/>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {escalaEditando && (
            <button style={s.btnAddLinha} onClick={() => setNovaLinhaModal(true)}>+ Adicionar data especial</button>
          )}
        </div>

        {novaLinhaModal && (
          <div style={s.overlay}><div style={s.modal}>
            <div style={s.modalTitle}>+ Data Especial</div>
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Data (dd/mm/aaaa)</label>
              <input style={s.input} value={novaLinha.data} placeholder="Ex: 25/12/2026"
                onChange={e => setNovaLinha(l=>({...l,data:e.target.value}))}/>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Dia da Semana</label>
              <select style={s.select} value={novaLinha.dia} onChange={e => setNovaLinha(l=>({...l,dia:e.target.value}))}>
                {['Sábado','Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Pregador Central</label>
              <input style={s.input} value={novaLinha.pregadorCentral} placeholder="Nome do pregador"
                onChange={e => setNovaLinha(l=>({...l,pregadorCentral:e.target.value}))}/>
            </div>
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Ancião</label>
              <select style={s.select} value={novaLinha.anciao} onChange={e => setNovaLinha(l=>({...l,anciao:e.target.value}))}>
                <option value="">— Selecione —</option>
                {ANCIAOS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div style={s.modalBtns}>
              <button style={s.btnMdCancel} onClick={() => setNovaLinhaModal(false)}>Cancelar</button>
              <button style={{ ...s.btnMdConfirm, background:C.green }} onClick={adicionarLinha}>Adicionar</button>
            </div>
          </div></div>
        )}

        {senhaEscala && (
          <SenhaModal titulo="Editar Escala" subtitulo="Digite a senha do primeiro ancião." icon="📅" color={C.blue}
            senhaEsperada={SENHA_ESCALA} s={s} C={C}
            onSuccess={() => { setSenhaEscala(false); iniciarEdicaoEscala(); }}
            onCancel={() => setSenhaEscala(false)}/>
        )}

        {toast && <Toast msg={toast}/>}
        <div style={s.footer}>Igreja Adventista Central de Votuporanga<br/><span style={{ color:C.muted }}>Desenvolvido por Kleber Vicente</span></div>
        <BottomMenu/>
      </div>
    );
  }

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (view === 'home') {
    function CultoCardItem({ c, passado }) {
      const pct = progressoDepts(c.programa, c.tipo);
      const cor = pct===100?C.green:pct>50?C.amber:C.purple;
      return (
        <div style={{ ...s.cultoCard, opacity:passado?0.75:1 }}>
          <div style={{ ...s.cultoAccent, background:cor }}/>
          <div style={s.cultoBody} onClick={() => { setActiveCultoId(c.id); setView('cultoDash'); }}>
            <div style={s.cultoNome}>{c.nome}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:8 }}>
              <span style={s.cultoBadge}>{c.tipo}</span>
              {c.data && <span style={s.cultoData}>{formatDate(c.data)}</span>}
              {passado && <span style={{ fontSize:11, color:C.amber, fontWeight:600 }}>📦 histórico</span>}
            </div>
            <div style={s.cultoBar}><div style={{ width:`${pct}%`, height:'100%', background:cor, borderRadius:4 }}/></div>
            <div style={{ ...s.cultoPct, color:cor }}>{pct}% preenchido</div>
          </div>
          <div style={s.cultoActions}>
            <button style={s.btnEdit} onClick={() => setMasterAction({ type:'editar', id:c.id })}>✏️</button>
            <button style={s.btnDel}  onClick={() => setMasterAction({ type:'excluir', id:c.id })}>🗑</button>
          </div>
        </div>
      );
    }
    return (
      <div style={s.root}>
        <BannerHoje notifAviso={notifAviso} onClose={() => setNotifAviso(null)} C={C}/>
        <header style={s.header}>
          <Logo size={52}/>
          <div style={s.headerTxt}>
            <div style={s.eyebrow}>Igreja Adventista do Sétimo Dia</div>
            <div style={s.titleMain}>Central de Votuporanga</div>
            <div style={s.titleSub}>Sistema de Programa do Culto</div>
            <div style={s.versiculo}>{VERSICULO}<br/><span style={s.versRef}>{VERSICULO_REF}</span></div>
            <button style={s.themeBtn} onClick={toggleTheme}>{darkMode?'☀️ Tema claro':'🌙 Tema escuro'}</button>
            <button style={s.themeBtn} onClick={() => registrarNotificacoes()}>🔔 Ativar notificações</button>
          </div>
        </header>
        <div style={s.listTop}>
          <div style={s.sectionLbl}>Cultos</div>
          <button style={s.btnNovo} onClick={() => setMasterAction({ type:'criar' })}>+ Novo</button>
        </div>
        {cultosAtivos.length===0 && cultosHistorico.length===0 && (
          <div style={s.empty}>Nenhum culto cadastrado.<br/><span style={{ color:C.gold }}>+ Novo</span> para começar.</div>
        )}
        <div style={{ padding:'0 20px' }}>
          {cultosAtivos.slice().reverse().map(c => <CultoCardItem key={c.id} c={c} passado={false}/>)}
        </div>
        {cultosHistorico.length > 0 && (
          <>
            <div style={s.histLabel} onClick={() => setMostrarHist(v=>!v)}>
              📦 Histórico ({cultosHistorico.length}) {mostrarHist?'▲':'▼'}
            </div>
            {mostrarHist && (
              <div style={{ padding:'0 20px' }}>
                {cultosHistorico.slice().reverse().map(c => <CultoCardItem key={c.id} c={c} passado={true}/>)}
              </div>
            )}
          </>
        )}
        {masterAction && (
          <SenhaModal titulo={masterAction.type==='criar'?'Novo Culto':masterAction.type==='editar'?'Editar Culto':'Excluir Culto'}
            subtitulo="Digite a senha master para continuar." icon="🔐" color={C.rose}
            senhaEsperada={SENHA_MASTER} onSuccess={onMasterOk} onCancel={() => setMasterAction(null)} s={s} C={C}/>
        )}
        {confirmDelete && (
          <div style={s.overlay}><div style={s.modal}>
            <div style={s.modalTitle}>Excluir culto?</div>
            <div style={s.modalText}>"{cultos.find(c=>c.id===confirmDelete)?.nome}" será removido permanentemente.</div>
            <div style={s.modalBtns}>
              <button style={s.btnMdCancel} onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button style={s.btnMdConfirm} onClick={() => excluirCulto(confirmDelete)}>Excluir</button>
            </div>
          </div></div>
        )}
        {toast && <Toast msg={toast}/>}
        <div style={s.footer}>Igreja Adventista Central de Votuporanga · Sistema de Programa<br/><span style={{ color:C.muted }}>Desenvolvido por Kleber Vicente</span></div>
        <BottomMenu/>
      </div>
    );
  }

  // ── NOVO/EDITAR ───────────────────────────────────────────────────────────
  if (view === 'novo') return (
    <div style={s.root}>
      <header style={{ ...s.header, flexDirection:'column', alignItems:'flex-start' }}>
        <button style={s.backBtn} onClick={() => setView('home')}>← Voltar</button>
        <div style={s.titleMain}>{editandoId?'Editar Culto':'Novo Culto'}</div>
      </header>
      <div style={s.formArea}>
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>Nome do culto</label>
          <input style={s.input} value={novoNome} placeholder="Ex: Sábado 17/05..." onChange={e => setNovoNome(e.target.value)}/>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>Tipo</label>
          <div style={s.tipoGrid}>
            {CULTO_TIPOS.map(t => <button key={t} style={{ ...s.tipoBadge, ...(novoTipo===t?s.tipoBadgeActive:{}) }} onClick={() => setNovoTipo(t)}>{t}</button>)}
          </div>
        </div>
        <div style={s.fieldGroup}>
          <label style={s.fieldLabel}>Data (opcional)</label>
          <input style={s.input} type="date" value={novoData} onChange={e => setNovoData(e.target.value)}/>
        </div>
        <button style={{ ...s.btnPrimary, opacity:novoNome.trim()?1:0.4 }} onClick={criarCulto} disabled={!novoNome.trim()}>
          {editandoId?'Salvar alterações':'Criar culto'}
        </button>
      </div>
    </div>
  );

  // ── DASHBOARD CULTO ───────────────────────────────────────────────────────
  if (view === 'cultoDash' && cultoAtivo) {
    const depts = Object.entries(DEPARTMENTS).filter(([k]) => {
      if (k==='escola')   return temEscola;
      if (k==='infantil') return temInfantil;
      return true;
    });
    return (
      <div style={s.root}>
        <header style={s.header}>
          <Logo size={46}/>
          <div style={s.headerTxt}>
            <button style={s.backBtn} onClick={() => setView('home')}>← Cultos</button>
            <div style={s.titleMain}>{cultoAtivo.nome}</div>
            {cultoAtivo.data && <div style={s.titleSub}>{formatDate(cultoAtivo.data)}</div>}
            <span style={{ ...s.cultoBadge, marginTop:6, display:'inline-block' }}>{cultoAtivo.tipo}</span>
          </div>
        </header>
        {(confHino||confFinal) && (
          <div style={s.conflictBar}>
            {confHino  && <div>⚠ <strong>Conflito Hino Inicial:</strong> "{hm}" vs "{hp}"</div>}
            {confFinal && <div>⚠ <strong>Conflito Hino Final:</strong> "{hfm}" vs "{hfp}"</div>}
          </div>
        )}
        <div style={s.sectionLbl}>Preencher por Departamento</div>
        <div style={s.deptGrid}>
          {depts.map(([key, d]) => {
            const preenchido = isDeptPreenchido(key, cultoAtivo.programa, tipo);
            return (
              <button key={key} style={{ ...s.deptCard, borderColor:preenchido?C.green:C[d.color]+'55' }}
                onClick={() => abrirDept(key)}>
                {preenchido && <span style={s.deptBadge}>✓</span>}
                <span style={s.deptIcon}>{d.icon}</span>
                <span style={{ ...s.deptName, color:preenchido?C.green:C[d.color] }}>{d.label}</span>
              </button>
            );
          })}
        </div>
        <button style={s.btnVerProg} onClick={() => setView('programa')}>📋 Ver Programa Completo</button>
        {senhaTarget && (
          <SenhaModal titulo={DEPARTMENTS[senhaTarget].label} subtitulo="Digite a senha para acessar."
            icon={DEPARTMENTS[senhaTarget].icon} color={C[DEPARTMENTS[senhaTarget].color]}
            senhaEsperada={SENHA_DEPT} onSuccess={onSenhaOk} onCancel={() => setSenhaTarget(null)} s={s} C={C}/>
        )}
        <div style={s.footer}>Sincronizado em tempo real · Firebase</div>
      </div>
    );
  }

  // ── FORM DEPT ─────────────────────────────────────────────────────────────
  if (view === 'dept' && cultoAtivo && activeDept && localProg) {
    const dept   = DEPARTMENTS[activeDept];
    const fields = getFieldsByDept(activeDept, tipo, cultoAtivo.programa);
    const btnBg  = savedOk?C.green:saving?C.muted:`linear-gradient(135deg, ${C[dept.color]}, #4A3490)`;
    const btnTxt = savedOk?'✓ Salvo!':saving?'Salvando...':'Salvar e voltar';
    const ordemInfo = temExtra
      ? '🎵 Ordem: 1º → 2º → 3º Hino → Hino Inicial (em pé) → Mens. Musical → Hino Final → Apelo'
      : '🎵 Ordem: 1ª → 2ª Música → Hino Inicial (em pé) → Mens. Musical → Hino Final → Apelo';
    return (
      <div style={s.root}>
        <div style={s.deptHeader}>
          <button style={s.backBtn} onClick={() => setView('cultoDash')}>← Voltar sem salvar</button>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:30 }}>{dept.icon}</span>
            <div>
              <div style={{ ...s.titleMain, fontSize:22, color:C[dept.color] }}>{dept.label}</div>
              <div style={s.titleSub}>{cultoAtivo.nome}</div>
            </div>
          </div>
        </div>
        <div style={s.formArea}>
          {activeDept==='musica'   && <div style={s.infoBox}>{ordemInfo}</div>}
          {activeDept==='pregador' && <div style={s.infoAmber}>💡 Preencha Hino Inicial e Hino Final para informar o diretor de música. Valores diferentes geram alerta de conflito.</div>}
          {activeDept==='escola'   && <div style={s.infoTeal}>📚 Escola Sabatina — campos exclusivos do culto de sábado.</div>}
          {fields.map(f => (
            <div key={f.key} style={s.fieldGroup}>
              <label style={s.fieldLabel}>{f.label}</label>
              {f.hint && <div style={s.fieldHint}>📖 {f.hint}</div>}
              {f.type==='textarea' ? (
                <textarea style={s.textarea} value={localProg[f.key]||''} placeholder={f.ph||''}
                  onChange={e => setLocalProg(p=>({...p,[f.key]:e.target.value}))}/>
              ) : f.type==='foto' ? (
                <FotoUpload value={localProg.fotoPregador||''} onChange={url => setLocalProg(p=>({...p,fotoPregador:url}))} s={s} C={C}/>
              ) : (
                <input style={s.input} value={localProg[f.key]||''} placeholder={f.ph||''}
                  onChange={e => setLocalProg(p=>({...p,[f.key]:e.target.value}))}/>
              )}
            </div>
          ))}
          <button style={{ ...s.btnSalvar, background:btnBg, color:savedOk||saving?'#fff':C.isDark?'#0D0B20':'#fff' }}
            onClick={salvarPrograma} disabled={saving||savedOk}>{btnTxt}</button>
        </div>
      </div>
    );
  }

  // ── PROGRAMA COMPLETO ─────────────────────────────────────────────────────
  if (view === 'programa' && cultoAtivo) {
    const prog = { ...EMPTY_PROG(), ...cultoAtivo.programa };
    const hmi  = prog.hinoInicial.trim();
    const hpi  = prog.hinoInicialPregador.trim();
    const hfmu = prog.hinoFinalMusica.trim();
    const hfpr = prog.hinoFinalPregador.trim();
    const cH   = hmi && hpi && hmi !== hpi;
    const cF   = hfmu && hfpr && hfmu !== hfpr;
    const hinoI = hmi||hpi||'';
    const hinoF = hfmu||hfpr||'';
    return (
      <div style={s.root}>
        <div style={s.progHeader}>
          <button style={s.backBtn} onClick={() => setView('cultoDash')}>← Voltar</button>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Logo size={48}/>
            <div>
              <div style={s.eyebrow}>Igreja Adventista do Sétimo Dia</div>
              <div style={s.progTitle}>{cultoAtivo.nome}</div>
              {cultoAtivo.data && <div style={s.progData}>{formatDate(cultoAtivo.data)}</div>}
              <span style={{ ...s.cultoBadge, marginTop:8, display:'inline-block' }}>{cultoAtivo.tipo}</span>
            </div>
          </div>
          {prog.anciaoNome && (
            <div style={s.anciaoBox}>
              <span style={{ fontSize:22 }}>🙏</span>
              <div>
                <div style={s.anciaoLbl}>Ancião Responsável do Dia</div>
                <div style={s.anciaoVal}>{prog.anciaoNome}</div>
              </div>
            </div>
          )}
        </div>
        {(cH||cF) && (
          <div style={s.conflictBar}>
            {cH && <div>⚠ Conflito Hino Inicial: "{hmi}" vs "{hpi}"</div>}
            {cF && <div>⚠ Conflito Hino Final: "{hfmu}" vs "{hfpr}"</div>}
          </div>
        )}
        <div style={s.progBody}>
          {temEscola && (
            <div style={{ ...s.pSection, borderLeftColor:C.teal }}>
              <div style={{ ...s.pSecTitle, color:C.teal }}>📚 Escola Sabatina</div>
              <PRow label="Diretor do Dia"    value={prog.escolaDiretor}     C={C}/>
              <PRow label="Carta Missionária" value={prog.escolaCarta}       C={C}/>
              {prog.escolaMusica1 && <PRow label="Música 1"         value={prog.escolaMusica1}     C={C}/>}
              {prog.escolaMusica2 && <PRow label="Música 2"         value={prog.escolaMusica2}     C={C}/>}
              <PRow label="Hino Inicial"      value={prog.escolaHinoInicial} C={C}/>
              <PRow label="Mensagem Musical"  value={prog.mensMusicalEscolaTitulo?`${prog.mensMusicalEscolaTitulo}${prog.mensMusicalEscolaCantora?' — '+prog.mensMusicalEscolaCantora:''}`:''}  C={C}/>
              <PRow label="Hino Final"        value={prog.escolaHinoFinal}   C={C} last/>
            </div>
          )}
          <div style={s.separador}>✝ Culto Divino</div>
          <div style={{ ...s.pSection, borderLeftColor:C.purple }}>
            <div style={{ ...s.pSecTitle, color:C.purple }}>🎵 Louvor</div>
            {prog.equipe ? <PRow label="Equipe de Louvor" value={prog.equipe} C={C}/> : null}
            <PRow label="1º Hino" value={prog.musica1} C={C}/>
            <PRow label="2º Hino" value={prog.musica2} C={C}/>
            {temExtra && <PRow label="3º Hino" value={prog.musica3} C={C}/>}
            <PRow label="Hino Inicial 🧍 (em pé)" value={hinoI} highlight={cH} C={C} last/>
          </div>
          <div style={{ ...s.pSection, borderLeftColor:C.blue }}>
            <div style={{ ...s.pSecTitle, color:C.blue }}>🙏 Oração Inicial de Joelhos</div>
            <PRow label="Responsável" value={prog.oracaoJoelhos} C={C} last/>
          </div>
          {/* HISTORINHA INFANTIL — ANTES da Oração pelas Ofertas (ordem correta do programa de Sábado) */}
          {temInfantil && (
            <div style={{ ...s.pSection, borderLeftColor:C.green }}>
              <div style={{ ...s.pSecTitle, color:C.green }}>⭐ Historinha Infantil</div>
              <PRow label="Responsável" value={prog.historinha} C={C} last/>
            </div>
          )}
          <div style={{ ...s.pSection, borderLeftColor:C.blue }}>
            <div style={{ ...s.pSecTitle, color:C.blue }}>💰 Oração pelas Ofertas</div>
            <PRow label="Responsável" value={prog.oracaoOferta} C={C} last/>
          </div>
          <div style={{ ...s.pSection, borderLeftColor:C.purple }}>
            <div style={{ ...s.pSecTitle, color:C.purple }}>🎶 Mensagem Musical do Culto</div>
            <PRow label="Música"       value={prog.mensMusicalCultoTitulo}  C={C}/>
            <PRow label="Quem cantará" value={prog.mensMusicalCultoCantora} C={C} last/>
          </div>
          <div style={{ ...s.pSection, borderLeftColor:C.amber }}>
            <div style={{ ...s.pSecTitle, color:C.amber }}>📖 Pregador e Tema do Sermão</div>
            {prog.fotoPregador ? (
              <div style={{ marginBottom:14 }}>
                <img src={prog.fotoPregador} alt="Pregador" style={{ width:'100%', maxWidth:240, height:180, objectFit:'cover', borderRadius:12, border:`2px solid ${C.border}` }}/>
                <a href={prog.fotoPregador} target="_blank" rel="noreferrer"
                  style={{ display:'block', marginTop:8, fontSize:14, color:C.gold, textDecoration:'none', fontWeight:600 }}>⬇ Baixar foto para transmissão</a>
              </div>
            ) : null}
            <PRow label="Pregador do Dia"  value={prog.pregador}   C={C}/>
            <PRow label="Título do Sermão" value={prog.temaSermao} C={C} last/>
          </div>
          <div style={{ ...s.pSection, borderLeftColor:C.purple }}>
            <div style={{ ...s.pSecTitle, color:C.purple }}>🕊 Mensagem Musical de Apelo</div>
            <PRow label="Música"       value={prog.apeloTitulo}  C={C}/>
            <PRow label="Quem cantará" value={prog.apeloCantora} C={C} last/>
          </div>
          <div style={{ ...s.pSection, borderLeftColor:C.purple }}>
            <div style={{ ...s.pSecTitle, color:C.purple }}>🎵 Hino Final 🧍 (em pé)</div>
            <PRow label="Hino Final" value={hinoF} highlight={cF} C={C} last/>
          </div>
        </div>
        <button style={s.btnShare} onClick={compartilharWhatsApp}>📲 Compartilhar no WhatsApp</button>
        <button style={s.btnCopyLink} onClick={copiarLink}>🔗 Copiar link do programa</button>
        {toast && <Toast msg={toast}/>}
        <div style={s.footer}>Igreja Adventista Central de Votuporanga · Programa Oficial<br/><span style={{ color:C.muted }}>Desenvolvido por Kleber Vicente</span></div>
      </div>
    );
  }

  return null;
}
