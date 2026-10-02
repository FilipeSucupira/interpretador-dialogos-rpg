// Verifica os arquivos .jff REAIS (o que o professor abrirá no JFLAP) contra as Regex de js/patterns.js:
//  1) todas as cadeias de tests/cases.js;  2) teste diferencial com cadeias aleatórias (semente fixa).
// Uso: node automatos/verificar.js   -> sai com código 1 se houver qualquer divergência.
const fs = require('fs'), path = require('path'), vm = require('vm');
const { SIGMA_ALL } = require('./alfabeto.js');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['../js/patterns.js', '../tests/cases.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);
const PAT = ctx.RPG.Patterns, CASES = ctx.RPG.Cases;
const KEYS = ['speaker', 'emotion', 'event', 'time', 'scene', 'dialogue'];
const N = 100000;

const un = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function load(key) {
  const x = fs.readFileSync(path.join(__dirname, `afne_${key}.jff`), 'utf8');
  const states = [...x.matchAll(/<state id="(\d+)"[^>]*>([\s\S]*?)<\/state>/g)].map((m) => ({ id: +m[1], initial: /<initial\/>/.test(m[2]), final: /<final\/>/.test(m[2]) }));
  const eps = new Map(), sym = new Map();
  for (const m of x.matchAll(/<transition><from>(\d+)<\/from><to>(\d+)<\/to>(?:<read\/>|<read>([\s\S]*?)<\/read>)<\/transition>/g)) {
    const a = +m[1], b = +m[2];
    if (m[3] === undefined) { (eps.get(a) || eps.set(a, []).get(a)).push(b); continue; }
    let c = un(m[3]); if (c === '␣') c = ' ';
    const k = a + '|' + c; (sym.get(k) || sym.set(k, []).get(k)).push(b);
  }
  return { start: states.find((s) => s.initial).id, finals: new Set(states.filter((s) => s.final).map((s) => s.id)), eps, sym };
}
function accepts(A, str) {
  const clo = (S) => { const st = [...S]; while (st.length) { const q = st.pop(); (A.eps.get(q) || []).forEach((b) => { if (!S.has(b)) { S.add(b); st.push(b); } }); } return S; };
  let cur = clo(new Set([A.start]));
  for (const ch of str) { const nx = new Set(); cur.forEach((q) => (A.sym.get(q + '|' + ch) || []).forEach((b) => nx.add(b))); cur = clo(nx); if (!cur.size) return false; }
  return [...cur].some((q) => A.finals.has(q));
}
function prng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = prng(20260930), rnd = (n) => Math.floor(rand() * n);
const frags = ['A', 'Z', 'a', 'z', '_', '0', '1', '9', ' ', ':', '[', ']', '{', '}', '@', '#', 'é', 'Ã', 'ç', 'ü', '—', '!', '.', 'feliz', 'triste', 'neutro', 'som', 'item', 'efeito', 'espera', 'pausa', 'cena ', 'ms', 's', 'Aria', 'João', 'Kael', 'x', '10', '05'];
const seeds = []; for (const k of KEYS) for (const t of ['accept', 'reject']) CASES[k][t].forEach((c) => seeds.push(Array.isArray(c) ? c[0] : c));
function gen() {
  let s = rnd(2) ? seeds[rnd(seeds.length)] : '';
  for (let i = 0, k = rnd(5); i < k; i++) {
    const op = rnd(3), f = frags[rnd(frags.length)];
    if (op === 0) s += f; else if (op === 1) { const p = rnd(s.length + 1); s = s.slice(0, p) + f + s.slice(p); } else if (s.length) { const p = rnd(s.length); s = s.slice(0, p) + s.slice(p + 1); }
  }
  return s;
}
let bad = 0;
for (const key of KEYS) {
  const A = load(key); let d = 0, acc = 0, used = 0, cd = 0;
  ['accept', 'reject'].forEach((t) => CASES[key][t].forEach((c) => { const s = Array.isArray(c) ? c[0] : c; if (accepts(A, s) !== (t === 'accept')) { cd++; console.log('  DIVERGE (caso)', key, JSON.stringify(s)); } }));
  for (let i = 0; i < N; i++) {
    const s = gen();
    if ([...s].some((ch) => !SIGMA_ALL.has(ch))) continue;   // fora de Σ: fora da linguagem formal
    used++; const a = PAT[key].full.test(s), b = accepts(A, s); if (b) acc++;
    if (a !== b) { d++; if (d <= 3) console.log('  DIVERGE', key, JSON.stringify(s), 'regex=', a, 'jff=', b); }
  }
  bad += d + cd;
  console.log(`${key.padEnd(9)} casos: ${cd ? cd + ' divergem' : 'ok'} | aleatórias: ${used} testadas, ${acc} aceitas, ${d} divergências`);
}

// ---------- consistência código × documentos × guia ----------
const { ORDER, VAR, META } = require('./meta.js');
const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const fail = (msg) => { bad++; console.log('  ✘', msg); };
const PSRC = read('js/patterns.js');
console.log('\nConsistência com a lauda e o guia:');

// (a) nenhuma Expressão Regular fora de js/patterns.js (parser e UI)
const stripCode = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, '""');
const LITERAL = /(^|[=(,:;!&|?{}\[\s])\/(?![\/*])(?:[^\/\n\\]|\\.)+\/[dgimsuvy]*(?=[.,;)\s]|$)/m;
for (const f of ['js/parser.js', 'js/ui.js']) {
  const c = stripCode(read(f));
  if (/\bRegExp\s*\(/.test(c) || LITERAL.test(c)) fail(`${f}: há regex própria; toda Expressão Regular deve estar em js/patterns.js e ter ficha`);
}
// (b) sintaxe proibida pelo guia nos padrões
for (const k of ORDER) {
  const src = PAT[k].src, t = src.replace(/\\./g, '__').replace(/\[[^\]]*\]/g, 'C');
  if (/\\[1-9]|\\k</.test(src)) fail(`${k}: retroreferência`);
  if (/\(\?[=!<(R\d&]/.test(t)) fail(`${k}: lookaround, condicional ou recursão`);
  if (/\./.test(t)) fail(`${k}: ponto (.) sem declarar o universo`);
  if (/\\[dDsSwWbB]/.test(src)) fail(`${k}: classe abreviada (expanda-a)`);
}
// (c) os documentos citam os padrões e as ER formais exatamente como estão no código / na ficha
const decl = (k) => PSRC.match(new RegExp('^\\s*(const ' + VAR[k] + '\\s*=.*)$', 'm'))[1];
const need = {
  'README.md': ORDER.map(decl),
  'docs/RELATORIO_TECNICO.md': [...ORDER.map(decl), ...ORDER.map((k) => META[k].formal)],
  'docs/FICHA_EXPRESSOES.md': [...ORDER.map(decl), ...ORDER.map((k) => META[k].formal), ...ORDER.map((k) => PAT[k].full.source)],
  'docs/ROTEIRO_SLIDES.md': [META.dialogue.formal],
};
for (const [file, items] of Object.entries(need)) {
  let txt; try { txt = read(file); } catch (e) { fail(`${file}: arquivo ausente`); continue; }
  items.forEach((it) => { if (!txt.includes(it)) fail(`${file}: não contém exatamente: ${it}`); });
}
// (d) diagramas
for (const b of [...ORDER.filter((k) => k !== 'dialogue').map((k) => 'afne_' + k), 'afne_dialogue_blocos', 'afne_dialogue_completo'])
  for (const ext of ['svg', 'png']) if (!fs.existsSync(path.join(ROOT, 'docs/diagramas', `${b}.${ext}`))) fail(`docs/diagramas/${b}.${ext} ausente (rode node automatos/gerar.js)`);
console.log('  (a) sem regex fora de patterns.js · (b) sem sintaxe proibida · (c) documentos × código · (d) diagramas — verificados');

console.log(bad ? `\nFALHOU: ${bad} problema(s)` : '\nOK: Regex, testes, .jff, diagramas e documentos representam a mesma linguagem');
process.exit(bad ? 1 : 0);
