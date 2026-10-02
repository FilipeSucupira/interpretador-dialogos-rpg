// Alfabetos (Σ) compartilhados por gerar.js e verificar.js.
const R = (a, b) => Array.from({ length: b.charCodeAt(0) - a.charCodeAt(0) + 1 }, (_, i) => String.fromCharCode(a.charCodeAt(0) + i));
const UP = [...R('A', 'Z'), ...'ÁÀÂÃÉÊÍÓÔÕÚÇ'];           // U: maiúsculas (locutor)
const LOW = [...R('a', 'z'), ...'áàâãéêíóôõúüç'];          // L: minúsculas (locutor)
const AZ = R('a', 'z');                                     // m: minúsculas ASCII (identificadores)
const DIG = R('0', '9'), NZ = R('1', '9');
// Σ_corpo: ASCII imprimível + letras acentuadas do português + pontuação tipográfica, sem { } [ ]
const BODY = [...new Set([...R(' ', '~'), ...UP, ...LOW, ...'–—‘’“”…'])].filter((c) => !'{}[]'.includes(c));
const SIGMA_ALL = new Set([...BODY, '{', '}', '[', ']']);
module.exports = { R, UP, LOW, AZ, DIG, NZ, BODY, SIGMA_ALL };
