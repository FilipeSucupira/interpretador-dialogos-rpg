// Padrões (Expressões Regulares) do motor: única fonte de Regex do parser, dos testes e da ficha.
// Os AFNε são construídos em automatos/gerar.js e conferidos contra estes padrões por automatos/verificar.js.
window.RPG = window.RPG || {};
(function (RPG) {
  const speakerSrc = String.raw`[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-Za-zÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúüç_]*`;
  const emotionSrc = String.raw`\[(feliz|triste|raiva|medo|surpresa|neutro)\]`;
  const eventSrc   = String.raw`\{(som|item|efeito):([a-z_]+)\}`;
  const timeSrc    = String.raw`@(espera|pausa) ([1-9][0-9]*)(ms|s)`;
  const sceneSrc   = String.raw`#cena ([a-z_]+)`;
  const lineSrc    = String.raw`(${speakerSrc})(?: ${emotionSrc})?: ((?:[^{}\[\]]|${eventSrc})+)`;

  // full: reconhece a cadeia inteira (âncoras ^ $ apenas delimitam a cadeia; não são símbolos do alfabeto)
  // scan: mesmo padrão, sem âncoras e com a flag g; o parser o usa só para localizar eventos
  //       dentro de um texto que já passou por 'full' (não é reconhecimento de linguagem)
  function make(name, src) {
    return {
      name, src,
      full: new RegExp('^(?:' + src + ')$'),
      scan: () => new RegExp(src, 'g'),
    };
  }

  RPG.Patterns = {
    speaker:  make('Identificador de locutor', speakerSrc),
    emotion:  make('Tag de emoção', emotionSrc),
    event:    make('Evento embutido', eventSrc),
    time:     make('Comando de tempo', timeSrc),
    scene:    make('Comando de cena', sceneSrc),
    dialogue: make('Linha de diálogo completa', lineSrc),
  };
})(window.RPG);
