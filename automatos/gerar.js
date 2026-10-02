// Gera, a partir de js/patterns.js + tests/cases.js + automatos/meta.js:
//   - AFNε (construção de Thompson) em .jff (JFLAP) e .md (tabelas)
//   - diagramas (SVG/PNG, Graphviz) em docs/diagramas/
//   - a ficha docs/FICHA_EXPRESSOES.md
// e confere cada autômato contra as cadeias de tests/cases.js.
// Uso: node automatos/gerar.js   (depois: node automatos/verificar.js)
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const { UP, LOW, AZ, DIG, NZ, BODY } = require('./alfabeto.js');
const { ORDER, VAR, META } = require('./meta.js');
const ROOT = path.join(__dirname, '..');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['tests/cases.js', 'js/patterns.js', 'js/parser.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx);
const CASES = ctx.RPG.Cases, PAT = ctx.RPG.Patterns, PARSER = ctx.RPG.Parser;
const PSRC = fs.readFileSync(path.join(ROOT, 'js/patterns.js'), 'utf8');
const BODYSET = new Set(BODY);

class M { constructor() { this.n = 0; this.t = []; } s() { return this.n++; } e(a, b, c = null) { this.t.push([a, b, c]); } }
const lit = (m, str) => { const st = m.s(); let cur = st; for (const ch of str) { const n = m.s(); m.e(cur, n, ch === ' ' ? '␣' : ch); cur = n; } return { start: st, end: cur }; };
const cls = (m, chars) => { const s = m.s(), e = m.s(); chars.forEach((c) => m.e(s, e, c)); return { start: s, end: e }; };
const cat = (m, ...f) => { for (let i = 0; i < f.length - 1; i++) m.e(f[i].end, f[i + 1].start); return { start: f[0].start, end: f[f.length - 1].end }; };
const alt = (m, ...f) => { const s = m.s(), e = m.s(); f.forEach((x) => { m.e(s, x.start); m.e(x.end, e); }); return { start: s, end: e }; };
const star = (m, f) => { const s = m.s(), e = m.s(); m.e(s, f.start); m.e(s, e); m.e(f.end, f.start); m.e(f.end, e); return { start: s, end: e }; };
const plus = (m, f) => { const s = m.s(), e = m.s(); m.e(s, f.start); m.e(f.end, f.start); m.e(f.end, e); return { start: s, end: e }; };
const opt = (m, f) => { const s = m.s(), e = m.s(); m.e(s, f.start); m.e(s, e); m.e(f.end, e); return { start: s, end: e }; };
const words = (m, ws) => alt(m, ...ws.map((w) => lit(m, w)));

const speakerF = (m) => cat(m, cls(m, UP), star(m, cls(m, [...UP, ...LOW, '_'])));
const emotionF = (m) => cat(m, lit(m, '['), words(m, ['feliz', 'triste', 'raiva', 'medo', 'surpresa', 'neutro']), lit(m, ']'));
const eventF = (m) => cat(m, lit(m, '{'), words(m, ['som', 'item', 'efeito']), lit(m, ':'), plus(m, cls(m, [...AZ, '_'])), lit(m, '}'));
const timeF = (m) => cat(m, lit(m, '@'), words(m, ['espera', 'pausa']), lit(m, ' '), cls(m, NZ), star(m, cls(m, DIG)), words(m, ['ms', 's']));
const sceneF = (m) => cat(m, lit(m, '#cena '), plus(m, cls(m, [...AZ, '_'])));
const dialogueF = (m) => cat(m, speakerF(m), opt(m, cat(m, lit(m, ' '), emotionF(m))), lit(m, ':'), lit(m, ' '),
  plus(m, alt(m, cls(m, ['~']), eventF(m))));
const FN = { speaker: speakerF, emotion: emotionF, event: eventF, time: timeF, scene: sceneF, dialogue: dialogueF };

// Mesma construção do diálogo, registrando as faixas de estados de cada subautômato (para o diagrama em blocos).
function dialogueBlocks() {
  const m = new M(), ranges = [];
  const rg = (label, fn) => { const lo = m.n; const r = fn(); ranges.push({ lo, hi: m.n - 1, label }); return r; };
  const sp = rg('ER-01 locutor', () => speakerF(m));
  const spc = lit(m, ' ');
  const em = rg('ER-02 emoção', () => emotionF(m));
  const o = opt(m, cat(m, spc, em));
  const colon = lit(m, ':'), sp2 = lit(m, ' ');
  const b = cls(m, ['~']);
  const ev = rg('ER-03 evento', () => eventF(m));
  const p = plus(m, alt(m, b, ev));
  const f = cat(m, sp, o, colon, sp2, p);
  return { m, f, ranges };
}

// simulação com fecho-ε sobre o modelo simbólico; '~' casa qualquer símbolo de Σ_corpo
const match = (sym, ch) => sym === ch || (sym === '␣' && ch === ' ') || (sym === '~' && BODYSET.has(ch));
function accepts(m, f, str) {
  const clo = (S) => { const st = [...S]; while (st.length) { const q = st.pop(); m.t.forEach(([a, b, c]) => { if (a === q && c === null && !S.has(b)) { S.add(b); st.push(b); } }); } return S; };
  let cur = clo(new Set([f.start]));
  for (const ch of str) { const nx = new Set(); m.t.forEach(([a, b, c]) => { if (c !== null && cur.has(a) && match(c, ch)) nx.add(b); }); cur = clo(nx); }
  return cur.has(f.end);
}

// rótulo legível de um conjunto de símbolos (classes das convenções)
function symLabel(chars) {
  const s = new Set(chars), eq = (A) => s.size === A.length && A.every((c) => s.has(c));
  if (s.size === 1 && s.has('~')) return 'B';
  if (eq(UP)) return 'U';
  if (eq([...UP, ...LOW, '_'])) return 'U ∪ L ∪ {_}';
  if (eq([...AZ, '_'])) return 'm ∪ {_}';
  if (eq(NZ)) return 'n';
  if (eq(DIG)) return 'd';
  return [...s].sort().join(', ');
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function jff(m, f) {
  const depth = new Array(m.n).fill(-1); depth[f.start] = 0; const q = [f.start];
  while (q.length) { const a = q.shift(); m.t.forEach(([x, y]) => { if (x === a && depth[y] < 0) { depth[y] = depth[a] + 1; q.push(y); } }); }
  const cnt = {}; let x = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><structure>\n<type>fa</type>\n<automaton>\n';
  for (let i = 0; i < m.n; i++) { const d = depth[i] < 0 ? 0 : depth[i]; cnt[d] = (cnt[d] || 0) + 1;
    x += `<state id="${i}" name="q${i}"><x>${60 + d * 90}</x><y>${60 + (cnt[d] - 1) * 70}</y>${i === f.start ? '<initial/>' : ''}${i === f.end ? '<final/>' : ''}</state>\n`; }
  m.t.forEach(([a, b, c]) => {
    // '~' vira uma transição por símbolo de Σ_corpo (o JFLAP lê '~' como caractere literal)
    const syms = c === null ? [null] : c === '~' ? BODY.map((ch) => (ch === ' ' ? '␣' : ch)) : [c];
    syms.forEach((s) => { x += `<transition><from>${a}</from><to>${b}</to>${s === null ? '<read/>' : '<read>' + esc(s) + '</read>'}</transition>\n`; });
  });
  return x + '</automaton></structure>\n';
}

function groups(m) {
  const g = {}; m.t.forEach(([a, b, c]) => { const k = a + '>' + b; (g[k] = g[k] || { a, b, s: [], eps: false }); c === null ? (g[k].eps = true) : g[k].s.push(c); });
  return Object.values(g).sort((p, q) => p.a - q.a || p.b - q.b);
}
function tabela(m) {
  let o = '| De | Símbolo | Para |\n|---|---|---|\n';
  groups(m).forEach((t) => { if (t.eps) o += `| q${t.a} | ε | q${t.b} |\n`; if (t.s.length) o += `| q${t.a} | ${symLabel(t.s).replace(/\|/g, '\\|')} | q${t.b} |\n`; });
  return o;
}
const LEGENDA = '`ε` = movimento vazio; `␣` = espaço; U, L, m, d, n e B = classes definidas nas convenções da ficha (B = Σ_corpo; no `.jff` o B vem expandido, uma transição por símbolo).';
function md(key, m, f) {
  const me = META[key];
  return `# AFNε — ${me.id} ${me.nome} (\`${key}\`)\n\n- **Alfabeto:** ${me.alfabeto}\n- **Estados:** q0..q${m.n - 1} (${m.n})\n- **Inicial:** q${f.start}\n- **Final:** q${f.end}\n- **Construção:** Thompson (movimentos vazios ε)\n- **Legenda:** ${LEGENDA}\n\n` + tabela(m);
}

// ---- diagramas (Graphviz) ----
const FONT = 'DejaVu Sans';
const dq = (s) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
function dotOf(m, f, title, ranges = []) {
  const boxOf = new Array(m.n).fill(-1); ranges.forEach((r, k) => { for (let i = r.lo; i <= r.hi; i++) boxOf[i] = k; });
  const nid = (i) => (boxOf[i] < 0 ? `q${i}` : `B${boxOf[i]}`);
  let d = `digraph AFNe {\n  rankdir=LR; nodesep=0.3; ranksep=0.55; pad=0.25;\n  labelloc=t; fontname="${FONT}"; fontsize=18; label="${dq(title)}";\n  node [fontname="${FONT}", fontsize=13, shape=circle, margin=0.03];\n  edge [fontname="${FONT}", fontsize=13];\n`;
  d += `  __ini [shape=point, width=0.12, label=""];\n  __ini -> ${nid(f.start)};\n`;
  for (let i = 0; i < m.n; i++) if (boxOf[i] < 0) d += `  q${i} [label="q${i}"${i === f.end ? ', shape=doublecircle' : ''}];\n`;
  ranges.forEach((r, k) => { const inicial = r.lo <= f.start && f.start <= r.hi ? ' (contém o estado inicial)' : ''; d += `  B${k} [shape=box, style="rounded,filled", fillcolor="#e8eefc", label="${dq(r.label)}\\nq${r.lo} … q${r.hi}${inicial}"];\n`; });
  const g = new Map();
  m.t.forEach(([a, b, c]) => {
    if (boxOf[a] >= 0 && boxOf[a] === boxOf[b]) return;   // transição interna de um bloco
    const k = nid(a) + '>' + nid(b) + (c === null ? '|e' : '|s');
    if (!g.has(k)) g.set(k, { A: nid(a), B: nid(b), eps: c === null, s: [] });
    if (c !== null) g.get(k).s.push(c);
  });
  g.forEach((e) => { d += e.eps ? `  ${e.A} -> ${e.B} [label="ε", style=dashed, color="#8a8a8a", fontcolor="#666666"];\n` : `  ${e.A} -> ${e.B} [label="${dq(symLabel(e.s))}"];\n`; });
  return d + '}\n';
}
let diagOk = true;
function render(dot, base) {
  const out = path.join(ROOT, 'docs/diagramas'); fs.mkdirSync(out, { recursive: true });
  try {
    cp.execFileSync('dot', ['-Tsvg', '-o', path.join(out, base + '.svg')], { input: dot });
    cp.execFileSync('dot', ['-Tpng', '-Gdpi=130', '-o', path.join(out, base + '.png')], { input: dot });
  } catch (e) { diagOk = false; console.warn('  AVISO: Graphviz (dot) indisponível; diagrama não gerado:', base); }
}

// ---- ficha docs/FICHA_EXPRESSOES.md ----
const cod = (s) => '`' + s + '`';
const cell = (s) => String(s).replace(/\|/g, '\\|');
const show = (s) => cod(JSON.stringify(s));
const w = (b) => (b ? 'aceita' : 'rejeita');
function declLine(key) { const mt = PSRC.match(new RegExp('^\\s*(const ' + VAR[key] + '\\s*=.*)$', 'm')); return mt[1]; }
function makeFn() {
  const L = PSRC.split('\n'), i = L.findIndex((l) => l.includes('function make')); let j = i; while (L[j].trim() !== '}') j++;
  return L.slice(i, j + 1).map((l) => l.replace(/^ {2}/, '')).join('\n');
}
function ficha(built, blocks) {
  const L = [], F = '```';
  L.push('# Ficha das Expressões Regulares', '',
    '> Gerado por `node automatos/gerar.js` a partir de `js/patterns.js`, `tests/cases.js`, `automatos/meta.js` e dos AFNε. Não edite à mão: altere a fonte e rode o gerador; depois `node automatos/verificar.js`.', '',
    '## Convenções', '',
    '**Notação formal** (a do guia de sintaxe): união `r | s`; concatenação por justaposição; fecho de Kleene `r*`; fecho positivo `r+ = r r*`; opcionalidade `r? = ( r | ε )`; `ε` é a palavra vazia; parênteses agrupam. Símbolos literais vêm entre aspas simples (`\'[\'`, `\':\'`) e `\'abc\'` abrevia a concatenação `a b c`. `␣` é o espaço.', '',
    '**Abreviações** (cada uma é só uma união finita de símbolos):', '',
    '- U = ' + UP.join(' | ') + '  (maiúsculas)',
    '- L = ' + LOW.join(' | ') + '  (minúsculas)',
    '- m = a | b | … | z  (minúsculas ASCII);  d = 0 | 1 | … | 9;  n = 1 | 2 | … | 9',
    '- B = Σ_corpo (enumerado no Apêndice A): ASCII imprimível (espaço … `~`), letras acentuadas do português e `– — ‘ ’ “ ” …`, **sem** `{ } [ ]`.', '',
    '**Como o código usa os padrões** (`js/patterns.js`, função `make`):', '', F + 'js', makeFn(), F, '',
    '- `full` exige que a cadeia inteira case. As âncoras `^` e `$` e o grupo `(?:…)` não são símbolos do alfabeto; o `(?:…)` é só agrupamento (não é lookaround).',
    '- `scan` é o mesmo padrão, sem âncoras e com a flag `g`. O parser o usa apenas para localizar eventos dentro de uma fala que já passou por `full` (ER-03); não é um reconhecimento de linguagem.',
    '- O parser e a interface não definem nenhuma regex própria: `automatos/verificar.js` confere isso.',
    '- Os padrões não usam retroreferências, recursão, condicionais, lookaround, `.`, `\\d`, `\\s` nem `\\w` (também conferido por `verificar.js`).', '',
    '**Escopo do alfabeto.** O AFNε precisa de alfabeto finito (JFLAP), então a classe negada `[^{}\\[\\]]` do código é tomada sobre Σ_corpo. Símbolos fora dele (emoji, tabulação, quebra de linha) o código aceita no corpo da fala, mas não fazem parte da linguagem formal; ver "Resultado e limite" da ER-06.',
    '',
    '**Pré-processamento do parser** (fora das ER): cada linha passa por `trim()` antes da análise; indentação, espaços finais e `\\r` (CRLF) são ignorados.',
    '',
    '**No JFLAP**, os `.jff` usam `␣` no lugar do espaço: ao simular, digite `␣` onde haveria espaço (ex.: `Aria:␣Olá`).', '',
    '## Quadro-resumo', '', '| ID | Nome | ER formal |', '|---|---|---|');
  ORDER.forEach((k) => L.push(`| ${META[k].id} | ${META[k].nome} | ${cod(cell(META[k].formal))} |`));
  L.push('');
  ORDER.forEach((key) => {
    const { m, f } = built[key], me = META[key], eps = m.t.filter((t) => t[2] === null).length;
    L.push(`## ${me.id} — ${me.nome}`, '',
      `**Identificação e função no programa:** ${me.id}, ${me.nome}. ${me.funcao}`, '',
      `**Alfabeto (Σ):** ${me.alfabeto}`, '',
      `**Linguagem L:** ${me.linguagem}`, '',
      `**ER formal:** ${cod(me.formal)}${me.formalNota ? '  ' + me.formalNota : ''}`, '',
      '**Sintaxe implementada** (copiada de `js/patterns.js`):', '', F + 'js', declLine(key), F, '',
      'Padrão efetivo usado por `full`, com as âncoras:', '', F + 'text', PAT[key].full.source, F, '',
      '**Equivalência e operadores utilizados** (atalhos do código × operadores formais):', '', '| Sintaxe no código | Significado | Forma formal |', '|---|---|---|');
    me.equiv.concat([['^(?:…)$  (aplicado por make)', 'âncoras + grupo: a cadeia inteira deve casar; não são símbolos do alfabeto', '(não aparece na ER formal)']])
      .forEach(([a, b, c]) => L.push(`| ${cod(cell(a))} | ${cell(b)} | ${cod(cell(c))} |`));
    L.push('', `**AFNε** (Thompson): estado inicial q${f.start}; estado final q${f.end}; ${m.n} estados; ${m.t.length} transições, das quais ${eps} são movimentos vazios (ε). Arquivos: \`automatos/afne_${key}.jff\` (JFLAP) e \`automatos/afne_${key}.md\`.`, '');
    if (key !== 'dialogue') L.push(`![AFNε da ${me.id}](diagramas/afne_${key}.png)`, `(vetorial: \`diagramas/afne_${key}.svg\`)`, '', 'Legenda: seta vinda de um ponto = estado inicial; círculo duplo = estado final; linha tracejada cinza = movimento ε; U, L, m, d, n, B = classes das convenções; ␣ = espaço.', '', tabela(m));
    else L.push('Visão em blocos (cada subautômato colapsado em uma caixa; os estados q0 … q93 são os mesmos do `.jff`):', '', '![AFNε da ER-06, em blocos](diagramas/afne_dialogue_blocos.png)', '(vetorial: `diagramas/afne_dialogue_blocos.svg`)', '',
      'Diagrama completo, com os 94 estados: `diagramas/afne_dialogue_completo.svg` (PNG: `diagramas/afne_dialogue_completo.png`). Tabela completa em `automatos/afne_dialogue.md`.', '',
      'Legenda: seta vinda de um ponto = estado inicial; círculo duplo = estado final; linha tracejada cinza = movimento ε; B = Σ_corpo; ␣ = espaço.', '');
    const na = CASES[key].accept.length, nr = CASES[key].reject.length;
    L.push(`**Testes** (${na} aceitas e ${nr} rejeitadas; mínimo da lauda: 6 e 6; cada ER tem ao menos um caso-limite):`, '', '| Cadeia | Esperado | Regex | AFNε | Obs. |', '|---|---|---|---|---|');
    for (const kind of ['accept', 'reject']) CASES[key][kind].forEach((c) => {
      const s = Array.isArray(c) ? c[0] : c, exp = kind === 'accept', rx = PAT[key].full.test(s), af = accepts(m, f, s);
      L.push(`| ${show(s)} | ${w(exp)} | ${w(rx)} | ${w(af)} | ${Array.isArray(c) ? '**caso-limite**' : ''}${rx === exp && af === exp ? '' : ' ⚠ DIVERGE'} |`);
    });
    const okAll = ['accept', 'reject'].every((kind) => CASES[key][kind].every((c) => { const s = Array.isArray(c) ? c[0] : c; return PAT[key].full.test(s) === (kind === 'accept') && accepts(m, f, s) === (kind === 'accept'); }));
    L.push('', `**Resultado e limite.** Comportamento observado: ${okAll ? 'todos os testes acima dão o resultado esperado na Regex do código e no AFNε' : '⚠ HÁ DIVERGÊNCIA nos testes acima'}. Limitações e possíveis falsos resultados:`, '');
    me.limitesTexto.forEach((t) => L.push('- ' + t));
    const comParser = key === 'dialogue';
    L.push('', `Cadeias-limite observadas (comportamento real, calculado na geração desta ficha):`, '', `| Cadeia | Regex | AFNε |${comParser ? ' Parser (linha a linha) |' : ''} Por que é um limite |`, `|---|---|---|${comParser ? '---|' : ''}---|`);
    me.limites.forEach(([s, why]) => L.push(`| ${show(s)} | ${w(PAT[key].full.test(s))} | ${w(accepts(m, f, s))} |${comParser ? ' ' + w(PARSER.parse(s).ok) + ' |' : ''} ${cell(why)} |`));
    L.push('');
  });
  const sym = BODY.map((c) => (c === ' ' ? '␣' : c)), rows = [];
  for (let i = 0; i < sym.length; i += 24) rows.push(sym.slice(i, i + 24).join(' '));
  L.push(`## Apêndice A — Σ_corpo enumerado (${BODY.length} símbolos; B = Σ_corpo)`, '', '`␣` representa o espaço. Não contém `{`, `}`, `[` nem `]`.', '', F, ...rows, F, '');
  return L.join('\n');
}

let bad = 0; const built = {};
for (const key of ORDER) {
  const m = new M(), f = FN[key](m); built[key] = { m, f };
  fs.writeFileSync(path.join(__dirname, `afne_${key}.jff`), jff(m, f));
  fs.writeFileSync(path.join(__dirname, `afne_${key}.md`), md(key, m, f));
  const eps = m.t.filter((t) => t[2] === null).length;
  if (key !== 'dialogue') render(dotOf(m, f, `${META[key].id} — ${META[key].nome}: AFNε (inicial q${f.start}, final q${f.end})`), `afne_${key}`);
  else render(dotOf(m, f, `${META[key].id} — ${META[key].nome}: AFNε completo (inicial q${f.start}, final q${f.end})`), 'afne_dialogue_completo');
  let ok = 0, total = 0;
  for (const kind of ['accept', 'reject']) CASES[key][kind].forEach((c) => {
    const s = Array.isArray(c) ? c[0] : c; total++;
    if (accepts(m, f, s) === (kind === 'accept')) ok++; else { bad++; console.log('  DIVERGE:', key, kind, JSON.stringify(s)); }
  });
  console.log(`${key.padEnd(9)} ${String(m.n).padStart(2)} estados, ${String(m.t.length).padStart(3)} transições (${eps} ε) | ${ok}/${total} cadeias concordam com a Regex`);
}
const blocks = dialogueBlocks();
if (JSON.stringify(blocks.m.t) !== JSON.stringify(built.dialogue.m.t) || blocks.f.start !== built.dialogue.f.start || blocks.f.end !== built.dialogue.f.end) { console.log('  ERRO: visão em blocos difere do AFNε do diálogo'); bad++; }
render(dotOf(blocks.m, blocks.f, `ER-06 — Linha de diálogo: AFNε em blocos (inicial q${blocks.f.start}, final q${blocks.f.end})`, blocks.ranges), 'afne_dialogue_blocos');
fs.writeFileSync(path.join(ROOT, 'docs/FICHA_EXPRESSOES.md'), ficha(built, blocks));
console.log('docs/FICHA_EXPRESSOES.md' + (diagOk ? ' e docs/diagramas/ gerados' : ' gerada (sem diagramas)'));
process.exit(bad ? 1 : 0);
