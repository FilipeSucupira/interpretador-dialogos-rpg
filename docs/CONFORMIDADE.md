# Conformidade com a lauda e com o guia de sintaxe

Legenda: ✔ atendido e verificável no projeto · ⚠ depende da equipe (marcado **[PREENCHER]** ou ainda não feito).
"Auto" = conferido por `node automatos/verificar.js` / `node tests/run-node.js`.

## Lauda — requisitos do trabalho
| Requisito | Situação | Onde |
|---|---|---|
| Problema claramente definido | ✔ | README; relatório §1 |
| Entradas, processamento e saídas | ✔ | relatório §2 |
| ≥ 5 ER distintas e relevantes | ✔ 6 ER | ficha |
| Entradas vazias/inválidas tratadas | ✔ Auto | `ParserCases` |
| Mensagens claras | ✔ Auto (11 causas testadas) | `parser.js`, `ParserCases` |
| Código organizado em módulos | ✔ | `js/` |
| Executa corretamente na apresentação | ⚠ ensaiar no computador da apresentação (simulado em jsdom, não em navegador real) | roteiro de demonstração |
| Por ER: nome e finalidade, alfabeto, linguagem, ER formal, sintaxe exata do código, operadores, AFNε, ≥ 6 aceitas + ≥ 6 rejeitadas com caso-limite | ✔ | ficha |
| ER formal = slides = código = testes = AFNε | ✔ Auto para ficha/README/relatório/roteiro e `.jff`; ⚠ slides ainda não feitos: copiar da ficha | `verificar.js` |
| Entrega: programa, AFNε, testes e análise, documentação | ✔ | projeto, relatório §7 |
| Entrega: relatório técnico | ⚠ rascunho completo; faltam nomes, link, capturas do JFLAP | `docs/RELATORIO_TECNICO.md` |
| Entrega: apresentação (slides) | ⚠ só o roteiro | `docs/ROTEIRO_SLIDES.md` |
| Entrega: link definitivo do GitHub | ⚠ | README, relatório |
| Etapa 1 (planejamento, prazo 26/09) | ⚠ confirmar que foi registrada | Google Classroom |
| Originalidade; fontes externas referenciadas | ⚠ confirmar referências | README, relatório §10 |

## Guia de sintaxe
| Exigência do guia | Situação | Onde |
|---|---|---|
| ER formal e sintaxe do código lado a lado | ✔ | ficha, README, relatório §5 |
| Notação formal da tabela do guia (`\|`, concatenação, `*`, `+`, `?`, `ε`, classes) | ✔ | ficha, convenções |
| Sem retroreferência, recursão, condicional, lookaround | ✔ Auto | `verificar.js` (b) |
| Sem `.` e sem `\d \s \w` (classes expandidas) | ✔ Auto | `verificar.js` (b) |
| Classe negada com universo declarado | ✔ Σ_corpo enumerado | ficha, Apêndice A |
| Âncoras e `(?:…)` explicados como não-símbolos | ✔ | ficha |
| Sintaxe JavaScript admitida (`RegExp` com `^…$`) | ✔ | `patterns.js` |
| Padrão copiado exatamente do código, com escapes e âncoras | ✔ Auto | ficha (declaração + padrão efetivo) |
| Todas as ER realmente usadas têm ficha | ✔ Auto (nenhuma regex fora de `patterns.js`) | `verificar.js` (a) |
| Ficha: identificação, Σ, L, ER formal, sintaxe, equivalência, AFNε, testes, resultado e limite | ✔ | ficha |
| AFNε: diagrama legível, inicial, finais, transições e ε | ✔ diagramas em `docs/diagramas/` | ficha |
| Testes: mínimo do guia 4+4; da lauda 6+6 | ✔ (≥ 6+6) | `tests/cases.js` |
| Falsos resultados e limites documentados | ✔ (calculados na geração da ficha) | ficha |
