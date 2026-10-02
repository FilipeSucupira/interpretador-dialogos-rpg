# Relatório Técnico — Motor Interpretador de Diálogos para RPG

**Equipe:** [PREENCHER] · **Disciplina:** Linguagens Formais e Autômatos · **Professor:** [PREENCHER] · **Data:** 30/09/2026
**Repositório:** [PREENCHER: link definitivo do GitHub]

## 1. Problema
Roteiros de diálogo de RPG escritos como texto solto costumam ter erros de formato (locutor sem `:`, emoção inexistente, tempo mal escrito) que só aparecem quando o jogo já está rodando. O projeto valida o roteiro **antes** de executá-lo, aponta a linha e o motivo do erro e, se tudo estiver correto, encena o diálogo em caixas de fala.

## 2. Entradas, processamento e saídas
| Etapa | Descrição |
|---|---|
| Entrada | Texto do roteiro digitado/colado na área "Roteiro" (uma instrução por linha). |
| Processamento | Cada linha é normalizada (`trim`) e testada, em ordem, contra as ER de cena, tempo e diálogo; a linha de diálogo é decomposta em locutor, emoção e corpo (texto + eventos). |
| Saída (válido) | Caixas de diálogo renderizadas em sequência, nome da cena e pausas respeitadas. |
| Saída (inválido) | Lista de erros com número da linha, mensagem e a linha original; **nada é executado**. |

Entradas vazias ou inválidas: roteiro vazio, só com espaços ou não textual é rejeitado com mensagem; qualquer linha inválida bloqueia toda a execução.

## 3. Arquitetura
- `js/patterns.js` — única fonte das Expressões Regulares.
- `js/parser.js` — análise léxica e diagnóstico de erros, **sem acesso ao DOM e sem regex própria**.
- `js/ui.js` — interface e renderização, **sem regex**; delega tudo ao parser.
- `tests/` — casos e executor (navegador e Node). `automatos/` — geração e verificação dos AFNε e da consistência dos documentos.

## 4. Linguagem do roteiro
```
#cena nome_da_cena
Locutor [emocao]: fala com {som|item|efeito:nome} embutidos
@espera 2s      @pausa 500ms
```

## 5. Expressões Regulares
Sintaxe implementada, exatamente como está em `js/patterns.js` (`${...}` é interpolação do template):

```js
const speakerSrc = String.raw`[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-Za-zÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúüç_]*`;
const emotionSrc = String.raw`\[(feliz|triste|raiva|medo|surpresa|neutro)\]`;
const eventSrc   = String.raw`\{(som|item|efeito):([a-z_]+)\}`;
const timeSrc    = String.raw`@(espera|pausa) ([1-9][0-9]*)(ms|s)`;
const sceneSrc   = String.raw`#cena ([a-z_]+)`;
const lineSrc    = String.raw`(${speakerSrc})(?: ${emotionSrc})?: ((?:[^{}\[\]]|${eventSrc})+)`;
```

ER formal de cada uma (notação do guia; U, L, m, d, n, B definidos nas convenções da ficha; `␣` é o espaço):

```text
ER-01  U ( U | L | _ )*
ER-02  '[' ( feliz | triste | raiva | medo | surpresa | neutro ) ']'
ER-03  '{' ( som | item | efeito ) ':' ( m | _ )+ '}'
ER-04  '@' ( espera | pausa ) ␣ n d* ( ms | s )
ER-05  '#cena' ␣ ( m | _ )+
ER-06  S ( ␣ E )? ':' ␣ ( B | V )+
```

Para cada ER, a ficha **`docs/FICHA_EXPRESSOES.md`** traz: identificação e função, alfabeto, linguagem, ER formal, sintaxe implementada (com âncoras), equivalência entre os atalhos do código e os operadores formais, AFNε (tabela e diagrama), 12 ou mais cadeias de teste e "Resultado e limite". As ER não usam retroreferências, recursão, condicionais, lookaround, `.` nem classes abreviadas.

## 6. AFNε
Construídos pelo método de Thompson (`automatos/gerar.js`) e exportados para JFLAP (`.jff`), tabelas (`.md`) e diagramas (`docs/diagramas/`). Estados: ER-01 6, ER-02 46, ER-03 28, ER-04 32, ER-05 11, ER-06 94 (a ER-06 tem também uma visão em blocos). O símbolo B (Σ_corpo) é expandido em uma transição por símbolo nos `.jff`; o espaço é escrito `␣`.
**[PREENCHER: inclua 1–2 capturas do JFLAP simulando uma cadeia aceita e uma rejeitada.]**

## 7. Testes e análise dos resultados
| Verificação | Resultado |
|---|---|
| `node tests/run-node.js` | 96/96 (77 cadeias das 6 ER + 19 casos do parser) |
| Cadeias por ER (aceitas + rejeitadas) | ER-01 7+7, ER-02 6+6, ER-03 6+6, ER-04 6+6, ER-05 6+6, ER-06 7+8; cada ER tem ao menos um caso-limite |
| `node automatos/verificar.js` | cerca de 99 mil cadeias aleatórias por ER (semente fixa) comparando a Regex com o `.jff` real: 0 divergências |
| Consistência | sem regex fora de `patterns.js`; sem sintaxe proibida; documentos citam padrões e ER formais exatamente como no código |

Casos-limite: `A` e `""` (ER-01), `[neutro]` e `[]` (ER-02), `{som:a}` e `{som:}` (ER-03), `@pausa 1ms` e `@espera 0s` (ER-04), `#cena a` e `#cena ` (ER-05), `Kael [raiva]: {efeito:tremor}` e `Aria: ` (ER-06).
Análise: Regex do código, testes e AFNε concordam em todos os casos; o teste aleatório cobre combinações que os testes manuais não cobrem (fragmentos de emoção/evento misturados, acentos, espaços extras).

## 8. Mensagens de erro
O parser distingue: dois pontos ausentes, locutor inválido, nome com espaço, espaço antes de `:`, emoção inexistente, falta de espaço depois de `:`, fala vazia, evento inválido, colchetes na fala, tempo inválido e cena inválida. Cada uma tem teste em `tests/cases.js` (`ParserCases`).

## 9. Resultado e limite (resumo; detalhes por ER na ficha)
- Rejeitados por desenho (falsos negativos plausíveis): locutor com hífen, apóstrofo, dígito ou `ë`; evento e cena com dígito, hífen ou maiúscula; cena com acento; tempo decimal ou em outra unidade.
- ER-04 não tem limite superior: `@espera 3000000s` é aceito, mas excede o máximo do `setTimeout` (2.147.483.647 ms); costuma terminar imediatamente (não verificado em navegador).
- ER-06 aceita no corpo símbolos fora de Σ_corpo (emoji, tabulação, quebra de linha); o AFNε os rejeita. Dentro de Σ não há divergência. O parser divide o texto em linhas e aplica `trim`, então uma fala só de espaços é rejeitada por ele.
- `trim()` por linha é pré-processamento, fora das ER.

## 10. Originalidade e referências
Projeto próprio; proposta registrada na Etapa 1 **[PREENCHER: confirmar]**. Nenhuma biblioteca externa. Referências: Thompson (1968), *Regular expression search algorithm*, CACM 11(6); JFLAP; Graphviz. **[PREENCHER: outras fontes]**

## 11. Contribuições
| Integrante | Contribuição |
|---|---|
| [PREENCHER] | [PREENCHER] |
