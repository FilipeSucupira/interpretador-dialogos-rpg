// Runner compartilhado (navegador e Node). Retorna resultados; não toca no DOM.
(function (RPG) {
  const norm = (c) => (Array.isArray(c) ? { s: c[0], limite: true } : { s: c, limite: false });
  RPG.Tests = {
    run() {
      const rows = [];
      for (const key of Object.keys(RPG.Cases)) {
        const p = RPG.Patterns[key];
        for (const kind of ['accept', 'reject']) {
          RPG.Cases[key][kind].map(norm).forEach((c) => {
            const got = p.full.test(c.s);
            rows.push({ group: p.name, src: p.src, input: c.s, expected: kind === 'accept', got, limite: c.limite, pass: got === (kind === 'accept') });
          });
        }
      }
      RPG.ParserCases.forEach((c) => {
        const r = RPG.Parser.parse(c.input);
        const pass = r.ok === c.ok
          && (c.commands === undefined || r.commands.length === c.commands)
          && (c.errorContains === undefined || r.errors.some((e) => e.message.includes(c.errorContains)))
          && (c.errorLine === undefined || (r.errors[0] && r.errors[0].line === c.errorLine));
        rows.push({ group: 'Parser', src: '', input: c.nome, expected: c.ok, got: r.ok, limite: false, pass });
      });
      return rows;
    },
  };
})(window.RPG);
