# Motor Interpretador de Diálogos para RPG

Aplicação web (JavaScript puro, HTML5, CSS3) que analisa roteiros de texto com Expressões Regulares,
valida locutor, emoção, tempo, cena e eventos embutidos e renderiza o resultado como caixas de diálogo.
Entrada inválida bloqueia a execução e mostra a linha e o motivo do erro.

- Repositório: **[PREENCHER: link definitivo do GitHub]**
- Equipe: **[PREENCHER: nomes dos integrantes]**

## Como executar
Sem instalação e sem dependências. Abra `index.html` no navegador (duplo clique) e clique em **Executar**.
Para testar, cole `exemplos/roteiro_valido.txt` ou `exemplos/roteiro_com_erros.txt` na caixa "Roteiro".

## Linguagem do roteiro
```
#cena taverna_antiga
Aria [feliz]: Bem-vinda! {som:sino}
João: Olá, viajante!
@espera 1s
```

## Expressões Regulares
As seis ER (ER-01 locutor, ER-02 emoção, ER-03 evento, ER-04 tempo, ER-05 cena, ER-06 linha de diálogo) estão
em `js/patterns.js`, exatamente assim (`${...}` é interpolação do template; o padrão efetivo, com as âncoras
`^(?:…)$`, está na ficha):

```js
const speakerSrc = String.raw`[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][A-Za-zÁÀÂÃÉÊÍÓÔÕÚÇáàâãéêíóôõúüç_]*`;
const emotionSrc = String.raw`\[(feliz|triste|raiva|medo|surpresa|neutro)\]`;
const eventSrc   = String.raw`\{(som|item|efeito):([a-z_]+)\}`;
const timeSrc    = String.raw`@(espera|pausa) ([1-9][0-9]*)(ms|s)`;
const sceneSrc   = String.raw`#cena ([a-z_]+)`;
const lineSrc    = String.raw`(${speakerSrc})(?: ${emotionSrc})?: ((?:[^{}\[\]]|${eventSrc})+)`;
```

ER formal correspondente (notação do guia: `|` união, justaposição, `*`, `+`, `?`, `ε`; ver abreviações U, L, m, d, n, B na ficha):

```text
ER-01  U ( U | L | _ )*
ER-02  '[' ( feliz | triste | raiva | medo | surpresa | neutro ) ']'
ER-03  '{' ( som | item | efeito ) ':' ( m | _ )+ '}'
ER-04  '@' ( espera | pausa ) ␣ n d* ( ms | s )
ER-05  '#cena' ␣ ( m | _ )+
ER-06  S ( ␣ E )? ':' ␣ ( B | V )+
```

- Não há retroreferências, recursão, condicionais, lookaround, `.`, `\d`, `\s` nem `\w`; `(?:…)` é só agrupamento.
- Nenhuma regex é definida fora de `js/patterns.js` (o parser e a interface só a usam).
- **Ficha completa de cada ER** (identificação, alfabeto, linguagem, ER formal, sintaxe implementada, equivalência, AFNε com diagrama, testes, resultado e limite): **`docs/FICHA_EXPRESSOES.md`**.

## Estrutura
- `js/patterns.js` Regex · `js/parser.js` análise (sem DOM) · `js/ui.js` interface
- `tests/` casos de teste (≥ 6 aceitas + ≥ 6 rejeitadas por ER, com caso-limite) e casos do parser: `tests/index.html` no navegador ou `node tests/run-node.js`
- `automatos/` AFNε de cada ER: `.jff` (JFLAP) e `.md` (tabelas) + `gerar.js`, `verificar.js`, `meta.js`, `alfabeto.js`
- `docs/` ficha das ER, `diagramas/` (SVG/PNG dos AFNε), relatório técnico, roteiro de slides, checklist de conformidade
- `exemplos/` roteiros de exemplo

**Depois de alterar qualquer Regex:** atualize `tests/cases.js`, o construtor em `automatos/gerar.js`, o texto em `automatos/meta.js` e os documentos que citam o padrão; então rode

```
node automatos/gerar.js && node automatos/verificar.js && node tests/run-node.js
```

`verificar.js` compara os `.jff` reais com as Regex (casos + cerca de 600 mil cadeias aleatórias, semente fixa), confere que não há regex fora de `patterns.js`, que não há sintaxe proibida pelo guia e que README, relatório, ficha e roteiro citam os padrões e as ER formais exatamente como estão no código. O gerador precisa do Graphviz (`dot`) só para refazer os diagramas; os arquivos já estão no projeto.

## JFLAP
Os `.jff` usam `␣` no lugar do espaço. Ao simular, digite `␣` onde haveria espaço (ex.: `Aria:␣Olá`, `@espera␣1s`).

## Decisões e limitações
- Cada linha passa por `trim()` antes da análise (indentação, espaços finais e CRLF são ignorados): pré-processamento, fora da linguagem das ER.
- Locutor aceita letras acentuadas do português; cena e evento aceitam só `a–z` e `_` (identificadores). Sem dígitos, hífen ou apóstrofo em locutor, cena e evento.
- A fala não pode conter `[ ] { }` fora de eventos.
- O alfabeto da fala (Σ_corpo) é finito por causa do AFNε: ASCII imprimível, letras acentuadas do português e `– — ‘ ’ “ ” …`. Símbolos fora dele (ex.: emoji, tabulação) o código aceita, mas não fazem parte da linguagem formal.
- `@espera` não tem limite superior: valores acima de 2.147.483.647 ms ultrapassam o limite do `setTimeout`.
- Demais limites e falsos resultados, por ER: seção "Resultado e limite" da ficha.

## Contribuições
| Integrante | Contribuição |
|---|---|
| [PREENCHER] | [PREENCHER] |

## Referências
- Construção de Thompson para AFNε: K. Thompson, "Regular expression search algorithm", *Communications of the ACM*, 11(6), 1968.
- JFLAP (simulação dos AFNε): https://www.jflap.org
- Graphviz (diagramas): https://graphviz.org
- Bibliotecas externas: nenhuma. **[PREENCHER: acrescente qualquer outra fonte usada]**
