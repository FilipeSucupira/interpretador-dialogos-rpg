// UI: só DOM e apresentação. Toda análise é delegada a RPG.Parser.
(function (RPG) {
  const $ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let runId = 0;

  function showErrors(errors) {
    const ul = $('errors'); ul.innerHTML = ''; ul.hidden = false;
    errors.forEach((e) => {
      const li = document.createElement('li');
      li.textContent = (e.line ? 'Linha ' + e.line + ': ' : '') + e.message + (e.text ? '  →  "' + e.text + '"' : '');
      ul.appendChild(li);
    });
  }

  function bubble(c) {
    const box = document.createElement('div');
    box.className = 'bubble'; box.dataset.emotion = c.emotion;
    const name = document.createElement('strong');
    name.textContent = c.speaker + ' (' + c.emotion + ')';
    const p = document.createElement('p');
    c.body.forEach((t) => {
      if (t.kind === 'text') p.appendChild(document.createTextNode(t.value));
      else { const s = document.createElement('span'); s.className = 'event'; s.textContent = t.type + ': ' + t.value; p.appendChild(s); }
    });
    box.append(name, p);
    return box;
  }

  async function run() {
    const id = ++runId;
    $('stage').innerHTML = ''; $('errors').hidden = true; $('scene').textContent = 'Cena: —';
    const r = RPG.Parser.parse($('script').value);
    if (!r.ok) return showErrors(r.errors);          // entrada inválida bloqueia a execução
    for (const c of r.commands) {
      if (id !== runId) return;
      if (c.type === 'wait') await sleep(c.ms);
      else if (c.type === 'scene') $('scene').textContent = 'Cena: ' + c.name.split('_').join(' ');
      else { $('stage').appendChild(bubble(c)); await sleep(500); }
    }
  }

  $('run').addEventListener('click', run);
  $('clear').addEventListener('click', () => { runId++; $('script').value = ''; $('stage').innerHTML = ''; $('errors').hidden = true; });
})(window.RPG);
