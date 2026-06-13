import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './firebase';
import { ref, onValue, set } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './firebase';

const VAPID_KEY = 'BOhZrxORkJ02nvIzxuVyuX-DVAMnypiDgRbh04T-0Gu6Cjdbr28COOtiWoKXjzmiqGkOI_LrTFHQ-DmC6moEX2o';

async function registrarNotificacoes() {
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

const LOGO_SRC = "data:image/webp;base64,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";
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
  // ── AUTO-CRIAR PRÓXIMO SÁBADO ─────────────────────────────────────────────
  useEffect(() => {
    if (cultos.length === 0) return;
    const hoje = new Date();
    const dowHoje = hoje.getDay();
    const diasAteSabado = dowHoje === 6 ? 7 : (6 - dowHoje);
    const proximo = new Date(hoje);
    proximo.setDate(hoje.getDate() + diasAteSabado);
    const proximoId = `${proximo.getFullYear()}-${String(proximo.getMonth()+1).padStart(2,'0')}-${String(proximo.getDate()).padStart(2,'0')}`;
    const jaExiste = cultos.some(c => c.tipo === 'Sábado' && c.data === proximoId);
    if (!jaExiste) {
      const nome = `Culto de Sábado – ${String(proximo.getDate()).padStart(2,'0')}/${String(proximo.getMonth()+1).padStart(2,'0')}/${proximo.getFullYear()}`;
      const c = newCulto(nome, proximoId, 'Sábado');
      set(ref(db, `cultos/${c.id}`), c);
    }
  }, [cultos]);
  // ─────────────────────────────────────────────────────────────────────────

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
            if (isPast && !midiaEditando && !verPassadasMidia) return null;
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
