// Casos de teste: 6 aceitas + 6 rejeitadas por Regex. ['cadeia', 'limite'] marca caso-limite.
window.RPG = window.RPG || {};
RPG.Cases = {
  speaker: {
    accept: ['Aria', 'Kael', 'Mago_Negro', 'João', 'Inês', 'Ângelo', ['A', 'limite']],
    reject: ['aria', '1Aria', 'Mago Negro', 'Zoë', 'Aria!', 'ângelo', ['', 'limite']],
  },
  emotion: {
    accept: ['[feliz]', '[triste]', '[raiva]', '[medo]', '[surpresa]', ['[neutro]', 'limite']],
    reject: ['[alegre]', 'feliz', '[feliz', '[Feliz]', '[feliz][medo]', ['[]', 'limite']],
  },
  event: {
    accept: ['{som:sino}', '{item:chave_de_ferro}', '{efeito:tremor}', '{item:espada}', '{efeito:x_y}', ['{som:a}', 'limite']],
    reject: ['{musica:x}', '{som:Sino}', '{som sino}', 'som:sino', '{som:sino}{item:x}', ['{som:}', 'limite']],
  },
  time: {
    accept: ['@espera 1s', '@pausa 500ms', '@espera 10s', '@espera 120s', '@pausa 9s', ['@pausa 1ms', 'limite']],
    reject: ['@espera 05s', '@espera s', '@espera 2', '@esperar 2s', '@espera  2s', ['@espera 0s', 'limite']],
  },
  scene: {
    accept: ['#cena taverna', '#cena floresta_sombria', '#cena praia', '#cena x_y', '#cena castelo', ['#cena a', 'limite']],
    reject: ['#cena Taverna', '#cena taverna antiga', '#Cena taverna', 'cena taverna', '#cena castelo1', ['#cena ', 'limite']],
  },
  dialogue: {
    accept: [
      'Aria: Olá', 'Aria [feliz]: Olá! {som:sino}', 'Kael [raiva]: Devolva a espada!',
      'Mago_Negro [medo]: Corra! {som:trovao} agora {item:mapa}',
      'Rei [neutro]: Horário: 10:30, sala 3.', 'João [feliz]: Olá, você está bem?', ['Kael [raiva]: {efeito:tremor}', 'limite'],
    ],
    reject: ['aria: oi', 'Aria [alegre]: oi', 'Aria [feliz]: oi {som:}', 'Aria [feliz]:oi', 'Aria: [x]', 'Mago Negro: oi', 'Aria [feliz] : oi', ['Aria: ', 'limite']],
  },
};
// Casos do Parser (pré-processamento, bloqueio e mensagens de erro).
RPG.ParserCases = [
  { nome: 'roteiro vazio é rejeitado', input: '', ok: false, errorContains: 'vazio' },
  { nome: 'apenas espaços/linhas em branco é rejeitado', input: '  \n\n ', ok: false },
  { nome: 'entrada que não é texto (null) é rejeitada', input: null, ok: false },
  { nome: 'roteiro válido é aceito', input: '#cena a\nAria [feliz]: Oi {som:x}\n@espera 1s', ok: true, commands: 3 },
  { nome: 'locutor com acento é aceito', input: 'João [feliz]: Olá!', ok: true, commands: 1 },
  { nome: 'CRLF (Windows) é aceito', input: 'Aria: oi\r\nKael: oi\r\n', ok: true, commands: 2 },
  { nome: 'indentação e espaços finais são normalizados (trim)', input: '   Aria: oi   ', ok: true, commands: 1 },
  { nome: 'uma linha inválida bloqueia tudo', input: 'Aria: Oi\nkael: oi', ok: false, commands: 0, errorLine: 2 },
  { nome: 'erro: dois pontos ausentes', input: 'Aria oi', ok: false, errorContains: "Falta ':'" },
  { nome: 'erro: locutor minúsculo', input: 'kael: oi', ok: false, errorContains: 'Locutor inválido' },
  { nome: 'erro: nome com espaço', input: 'Mago Negro: oi', ok: false, errorContains: 'não pode ter espaços' },
  { nome: 'erro: emoção inexistente', input: 'Aria [alegre]: oi', ok: false, errorContains: 'Emoção inválida' },
  { nome: 'erro: espaço antes de ":"', input: 'Aria [feliz] : oi', ok: false, errorContains: 'antes de' },
  { nome: 'erro: falta espaço depois de ":"', input: 'Aria [feliz]:oi', ok: false, errorContains: 'espaço depois' },
  { nome: 'erro: fala vazia', input: 'Aria:', ok: false, errorContains: 'Fala vazia' },
  { nome: 'erro: evento vazio', input: 'Aria: oi {som:}', ok: false, errorContains: 'Evento inválido' },
  { nome: 'erro: colchetes na fala', input: 'Aria: veja [isto]', ok: false, errorContains: 'Colchetes' },
  { nome: 'erro: tempo com zero à esquerda', input: '@espera 05s', ok: false, errorContains: 'tempo inválido' },
  { nome: 'erro: cena com maiúscula', input: '#cena Taverna', ok: false, errorContains: 'Cena inválida' },
];
