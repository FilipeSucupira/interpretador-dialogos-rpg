// Parser: lógica pura, sem acesso ao DOM e sem definir nenhuma regex própria:
// toda Expressão Regular vem de RPG.Patterns (js/patterns.js). automatos/verificar.js confere isso.
(function (RPG) {
  const P = RPG.Patterns;

  // Só é chamado para linhas que NENHUMA regex aceitou; descobre o motivo mais provável.
  function diagnose(t) {
    if (t[0] === '@') return 'Comando de tempo inválido. Use: @espera 2s ou @pausa 500ms (número sem zero à esquerda).';
    if (t[0] === '#') return 'Cena inválida. Use: #cena nome_em_minusculas (letras minúsculas e "_").';
    const i = t.indexOf(':');
    if (i < 0) return "Falta ':' depois do locutor. Formato: Nome [emocao]: fala";
    const head = t.slice(0, i), body = t.slice(i + 1);
    const parts = head.split(' ');
    if (!P.speaker.full.test(parts[0]))
      return 'Locutor inválido: deve começar com maiúscula e ter só letras (com ou sem acento) ou "_".';
    if (head.endsWith(' ')) return "Não deixe espaço antes de ':'. Formato: Nome [emocao]: fala";
    if (parts.length >= 2 && parts[1][0] !== '[')
      return 'O nome do locutor não pode ter espaços; use "_" (ex.: Mago_Negro).';
    if (parts.length > 2) return "Cabeçalho inválido. Use somente 'Nome [emocao]:' (uma tag de emoção).";
    if (parts.length === 2 && !P.emotion.full.test(parts[1]))
      return 'Emoção inválida. Use: [feliz], [triste], [raiva], [medo], [surpresa] ou [neutro].';
    if (body.trim() === '') return "Fala vazia: escreva o texto depois de ':'.";
    if (body[0] !== ' ') return "Falta um espaço depois de ':'. Formato: Nome [emocao]: fala";
    const semEventos = body.replace(P.event.scan(), '');
    if (semEventos.includes('{') || semEventos.includes('}')) return 'Evento inválido. Use {som:x}, {item:x} ou {efeito:x} (x em minúsculas ou "_") e feche a chave.';
    if (semEventos.includes('[') || semEventos.includes(']')) return 'Colchetes não são permitidos dentro da fala (só na tag de emoção antes de ":").';
    return 'Linha fora do formato. Use: Nome [emocao]: fala';
  }

  function tokenizeBody(body) {
    const out = []; let last = 0;
    for (const m of body.matchAll(P.event.scan())) {
      if (m.index > last) out.push({ kind: 'text', value: body.slice(last, m.index) });
      out.push({ kind: 'event', type: m[1], value: m[2] });
      last = m.index + m[0].length;
    }
    if (last < body.length) out.push({ kind: 'text', value: body.slice(last) });
    return out;
  }

  // Normalização (fora da linguagem das Regex): trim() ignora indentação, espaços finais e '\r' (CRLF).
  function parseLine(raw, line) {
    const t = raw.trim();
    if (t === '') return null;
    let m;
    if ((m = P.scene.full.exec(t))) return { type: 'scene', line, name: m[1] };
    if ((m = P.time.full.exec(t)))
      return { type: 'wait', line, ms: m[3] === 's' ? Number(m[2]) * 1000 : Number(m[2]) };
    if ((m = P.dialogue.full.exec(t)))
      return { type: 'dialogue', line, speaker: m[1], emotion: m[2] || 'neutro', body: tokenizeBody(m[3]) };
    return { type: 'error', line, text: t, message: diagnose(t) };
  }

  RPG.Parser = {
    parse(script) {
      if (typeof script !== 'string' || script.trim() === '')
        return { ok: false, commands: [], errors: [{ line: 0, message: 'O roteiro está vazio. Digite ao menos uma linha.' }] };
      const commands = [], errors = [];
      script.split('\n').forEach((raw, i) => {
        const r = parseLine(raw, i + 1);
        if (!r) return;
        (r.type === 'error' ? errors : commands).push(r);
      });
      return { ok: errors.length === 0, commands: errors.length ? [] : commands, errors };
    },
  };
})(window.RPG);
