// Texto das fichas das ER (fonte única para a ficha, os AFNε e a verificação de consistência dos documentos).
// A sintaxe do código e os testes NÃO ficam aqui: vêm de js/patterns.js e tests/cases.js.
const ORDER = ['speaker', 'emotion', 'event', 'time', 'scene', 'dialogue'];
const VAR = { speaker: 'speakerSrc', emotion: 'emotionSrc', event: 'eventSrc', time: 'timeSrc', scene: 'sceneSrc', dialogue: 'lineSrc' };
const META = {
  speaker: {
    id: 'ER-01', nome: 'Identificador de locutor',
    funcao: 'Valida o nome de quem fala (ex.: Aria, Mago_Negro, João). Compõe a ER-06; o parser também a aplica isoladamente ao nome para dizer se o erro está no locutor.',
    alfabeto: 'Σ = U ∪ L ∪ {_}  (U e L definidos nas convenções).',
    linguagem: 'Cadeias que começam com uma letra maiúscula (U) seguida de zero ou mais símbolos de U, L ou "_". Não aceita a cadeia vazia, espaço, dígito, pontuação nem inicial minúscula.',
    formal: 'U ( U | L | _ )*',
    equiv: [
      ['[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]', 'classe finita (primeiro símbolo)', 'U'],
      ['[A-Za-zÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúüç_]', 'classe finita (demais símbolos)', '( U | L | _ )'],
      ['*', 'fecho de Kleene: zero ou mais (inclui ε)', '*'],
      ['(justaposição)', 'concatenação', '(justaposição)'],
    ],
    limites: [["D'Artagnan", 'apóstrofo'], ['Ana-Maria', 'hífen'], ['Guarda2', 'dígito'], ['Zoë', "'ë' não pertence a L"], ['Mago Negro', 'espaço (use Mago_Negro)']],
    limitesTexto: [
      'Rejeita por desenho nomes plausíveis em RPG (falsos negativos): com hífen, apóstrofo, dígito ou letra fora de U e L. Nomes compostos devem usar "_".',
      'Falso positivo não observado nos testes nem nas cadeias aleatórias de verificar.js: toda cadeia aceita começa com maiúscula e só tem símbolos de U, L ou "_".',
    ],
  },
  emotion: {
    id: 'ER-02', nome: 'Tag de emoção',
    funcao: 'Valida a emoção entre colchetes que acompanha o locutor (ex.: [feliz]). Compõe a ER-06; o parser também a aplica isoladamente à tag para dizer se o erro está na emoção.',
    alfabeto: "Σ = m ∪ {'[', ']'}  (m = letras minúsculas a–z).",
    linguagem: 'Exatamente uma das seis palavras feliz, triste, raiva, medo, surpresa ou neutro, entre colchetes. Diferencia maiúsculas de minúsculas; não aceita colchetes desbalanceados, espaços internos nem duas tags.',
    formal: "'[' ( feliz | triste | raiva | medo | surpresa | neutro ) ']'",
    equiv: [
      ['\\[  e  \\]', "escape: colchetes literais (sem a barra seriam uma classe de caracteres)", "'['  e  ']'"],
      ['(feliz|triste|raiva|medo|surpresa|neutro)', 'agrupamento + alternância; a captura não altera a linguagem', '( feliz | triste | raiva | medo | surpresa | neutro )'],
      ['(justaposição)', 'concatenação dos símbolos de cada palavra', 'f e l i z, t r i s t e, …'],
    ],
    limites: [['[Feliz]', 'maiúscula'], ['[ feliz ]', 'espaços dentro dos colchetes'], ['[alegre]', 'fora das seis emoções']],
    limitesTexto: [
      'Só as seis emoções, com minúsculas; incluir uma nova emoção exige alterar a ER, o AFNε, os testes e a ficha.',
      'Falso positivo não observado nos testes nem nas cadeias aleatórias de verificar.js.',
    ],
  },
  event: {
    id: 'ER-03', nome: 'Evento embutido',
    funcao: 'Valida eventos sonoros, visuais ou de item inseridos na fala (ex.: {som:sino}). Compõe a ER-06; o parser usa a variante scan (sem âncoras, flag g) para localizar os eventos dentro de uma fala já validada.',
    alfabeto: "Σ = m ∪ {_, ':', '{', '}'}.",
    linguagem: 'Chave de abertura, um tipo (som, item ou efeito), dois pontos, um nome com uma ou mais letras minúsculas a–z ou "_", e chave de fechamento. Nome vazio, maiúsculas e tipos desconhecidos são rejeitados.',
    formal: "'{' ( som | item | efeito ) ':' ( m | _ )+ '}'",
    equiv: [
      ['\\{  e  \\}', "escape: chaves literais (uma chave sem escape poderia ser lida como quantificador)", "'{'  e  '}'"],
      ['(som|item|efeito)', 'agrupamento + alternância; a captura não altera a linguagem', '( som | item | efeito )'],
      [':', 'símbolo literal', "':'"],
      ['([a-z_]+)', 'classe finita + fecho positivo: r+ = r r*', '( m | _ )+  ≡  ( m | _ )( m | _ )*'],
    ],
    limites: [['{item:chave2}', 'dígito'], ['{som:Sino}', 'maiúscula'], ['{item:chave-de-ferro}', 'hífen']],
    limitesTexto: [
      'Nomes só com a–z e "_": identificadores com dígito, hífen ou maiúscula são rejeitados por desenho (falsos negativos).',
      'Falso positivo não observado nos testes nem nas cadeias aleatórias de verificar.js.',
    ],
  },
  time: {
    id: 'ER-04', nome: 'Comando de tempo',
    funcao: 'Valida pausas do roteiro (ex.: @espera 2s, @pausa 500ms). Uma linha aceita vira o comando wait, com a duração em milissegundos.',
    alfabeto: "Σ = m ∪ d ∪ {'@', ␣}.",
    linguagem: 'Arroba, espera ou pausa, um espaço, um inteiro positivo sem zero à esquerda (primeiro dígito 1–9, depois zero ou mais dígitos) e a unidade ms ou s. Rejeita 0s, 05s, número ou unidade ausentes e espaço duplo.',
    formal: "'@' ( espera | pausa ) ␣ n d* ( ms | s )",
    equiv: [
      ['@', 'símbolo literal', "'@'"],
      ['(espera|pausa)', 'agrupamento + alternância', '( espera | pausa )'],
      ['(espaço)', 'símbolo literal', '␣'],
      ['[1-9]', 'intervalo finito', 'n = ( 1 | 2 | … | 9 )'],
      ['[0-9]*', 'intervalo finito + fecho de Kleene', 'd*  com  d = ( 0 | 1 | … | 9 )'],
      ['(ms|s)', 'agrupamento + alternância', '( ms | s )'],
    ],
    limites: [['@espera 1.5s', 'decimal'], ['@espera 1min', 'unidade não prevista'], ['@espera 3000000s', 'sem limite superior']],
    limitesTexto: [
      'Só inteiros positivos em ms ou s; sem decimais nem outras unidades (falsos negativos por desenho).',
      'Sem limite superior: a ER aceita, por exemplo, @espera 3000000s (3.000.000.000 ms), valor acima do máximo de 2.147.483.647 ms do setTimeout; pelo que se conhece dos navegadores, nesse caso a espera costuma terminar imediatamente (não verificado em navegador). É um limite da execução, não da linguagem reconhecida.',
    ],
  },
  scene: {
    id: 'ER-05', nome: 'Comando de cena',
    funcao: 'Valida a troca de cena (ex.: #cena taverna_antiga). Uma linha aceita vira o comando scene, que atualiza o título da cena.',
    alfabeto: "Σ = m ∪ {'#', _, ␣}.",
    linguagem: 'A cadeia #cena, um espaço e um nome com uma ou mais letras minúsculas a–z ou "_". Rejeita maiúsculas, espaços no nome, dígitos, acentos e nome ausente.',
    formal: "'#cena' ␣ ( m | _ )+",
    equiv: [
      ['#cena ', "sequência de símbolos literais (a notação 'abc' = a b c), incluindo um espaço", "'#cena' ␣"],
      ['([a-z_]+)', 'classe finita + fecho positivo: r+ = r r*', '( m | _ )+  ≡  ( m | _ )( m | _ )*'],
    ],
    limites: [['#cena praça', 'acento'], ['#cena castelo_2', 'dígito'], ['#cena taverna antiga', 'espaço no nome']],
    limitesTexto: [
      'Nome só com a–z e "_": sem acento, dígito ou espaço (falsos negativos por desenho); "#cena" exige exatamente um espaço.',
      'Falso positivo não observado nos testes nem nas cadeias aleatórias de verificar.js.',
    ],
  },
  dialogue: {
    id: 'ER-06', nome: 'Linha de diálogo completa',
    funcao: 'Valida uma linha inteira de fala: locutor, emoção opcional, dois pontos, espaço e fala com eventos opcionais. Uma linha aceita vira o comando dialogue.',
    alfabeto: "Σ = Σ_corpo ∪ {'{', '}', '[', ']'}  (Σ_corpo enumerado no Apêndice A).",
    linguagem: 'Locutor (ER-01), opcionalmente espaço + emoção (ER-02), dois pontos, um espaço e uma fala com ao menos um item, onde cada item é um símbolo de Σ_corpo (B) ou um evento (ER-03, V). A fala não pode ser vazia nem conter colchetes ou chaves fora de eventos.',
    formal: "S ( ␣ E )? ':' ␣ ( B | V )+",
    formalNota: 'com S = ER-01, E = ER-02, V = ER-03 e B = Σ_corpo (Apêndice A)',
    equiv: [
      ['(${speakerSrc})', 'grupo de captura que contém a ER-01 inteira', 'S'],
      ['(?: ${emotionSrc})?', 'grupo NÃO capturante (só agrupamento; não é lookaround) + opcionalidade: r? = ( r | ε )', '( ␣ E )?  ≡  ( ␣ E | ε )'],
      [': ', 'símbolos literais dois pontos e espaço', "':' ␣"],
      ['[^{}\\[\\]]', 'classe negada, tomada sobre Σ_corpo = união finita dos símbolos do Apêndice A', 'B'],
      ['[^{}\\[\\]]|${eventSrc}', 'alternância entre um símbolo comum e um evento', '( B | V )'],
      ['( … )+', 'fecho positivo: r+ = r r*', '( B | V )+  ≡  ( B | V )( B | V )*'],
    ],
    limites: [['Aria: 😀', 'emoji fora de Σ_corpo'], ['Aria: a\nKael: b', 'quebra de linha no corpo'], ['Aria: a\tb', 'tabulação no corpo'], ['Aria:  ', 'corpo só com espaço'], ['Aria: veja [isto]', 'colchetes na fala'], ['Aria: {som:}', 'evento vazio']],
    limitesTexto: [
      'Como o código usa a classe negada [^{}\\[\\]], a ER aceita símbolos fora de Σ_corpo (emoji, quebra de linha, tabulação); o AFNε, cujo alfabeto é finito, os rejeita. Nenhuma divergência existe dentro de Σ (conferido por verificar.js).',
      'O parser só entrega linhas isoladas à ER (divide o texto em "\\n" e aplica trim), então "\\n" não chega ao corpo; um "\\r" isolado não é separador e fica no corpo.',
      'Uma fala só de espaços casa com a ER, mas o trim do parser a reduz a "Aria:" e ela é rejeitada com "Fala vazia".',
      'Colchetes e chaves fora de eventos válidos são rejeitados por desenho.',
    ],
  },
};
module.exports = { ORDER, VAR, META };
