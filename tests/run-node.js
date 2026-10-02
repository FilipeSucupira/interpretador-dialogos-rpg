// Uso: node tests/run-node.js
const vm = require('vm'), fs = require('fs'), path = require('path');
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
for (const f of ['../js/patterns.js', '../js/parser.js', 'cases.js', 'runner.js'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);
const rows = ctx.RPG.Tests.run();
let last = '';
rows.forEach((r) => {
  if (r.group !== last) { console.log('\n' + r.group); last = r.group; }
  console.log(`  ${r.pass ? 'OK  ' : 'FALHA'} ${r.expected ? 'aceita ' : 'rejeita'} ${r.limite ? '[limite] ' : ''}${JSON.stringify(r.input)}`);
});
const fails = rows.filter((r) => !r.pass).length;
console.log(`\n${rows.length - fails}/${rows.length} testes passaram`);
process.exit(fails ? 1 : 0);
