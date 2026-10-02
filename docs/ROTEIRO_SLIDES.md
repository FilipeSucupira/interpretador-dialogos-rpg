# Roteiro de slides (≈ 14 slides, 12–15 min)

1. **Título** — nome do projeto, equipe, disciplina, link do GitHub.
2. **Problema** — erros de formato em roteiros de RPG só aparecem tarde; objetivo: validar antes de executar.
3. **Entrada → processamento → saída** — diagrama de 3 caixas (texto → parser com ER → caixas de diálogo / erros).
4. **Arquitetura** — `patterns.js` · `parser.js` (sem DOM e sem regex própria) · `ui.js` (sem regex).
5. **Linguagem do roteiro** — exemplo de 5 linhas com cada elemento destacado.
6–10. **ER-01 a ER-05, um slide (ou dois) por ER**, com exatamente os campos do guia, copiados de `docs/FICHA_EXPRESSOES.md`:
   identificação e função · alfabeto Σ · linguagem L · ER formal · sintaxe implementada (com âncoras) · equivalência (atalhos × operadores) · AFNε (imagem de `docs/diagramas/`) · 4+ aceitas e 4+ rejeitadas (a lauda pede 6+6) com o caso-limite · resultado e limite.
   Lado a lado: **ER formal** e **sintaxe do código**.
11. **ER-06 Diálogo (composição)** — ER formal `S ( ␣ E )? ':' ␣ ( B | V )+` com S = ER-01, E = ER-02, V = ER-03, B = Σ_corpo; mostrar `docs/diagramas/afne_dialogue_blocos.png` (não os 94 estados).
12. **Erros claros** — tabela de 5 erros típicos com a mensagem exibida (da tela real).
13. **Testes e resultados** — 96/96; 0 divergências em cerca de 600 mil cadeias aleatórias Regex × `.jff`; casos-limite.
14. **Limites e conclusão** — falsos negativos por desenho, `trim`, Σ_corpo, `@espera` sem limite superior; contribuições de cada integrante.

A ER formal e a sintaxe de cada slide devem ser idênticas às da ficha (o `verificar.js` confere a ficha, o README e o relatório).

## Roteiro da demonstração (ao vivo)
1. Abrir `index.html` direto no navegador (funciona por `file://`). Clicar **Executar** com o roteiro padrão.
2. Colar `exemplos/roteiro_com_erros.txt` → mostrar as 6 mensagens diferentes e que nada executa.
3. Colar `exemplos/roteiro_valido.txt` → executar (cena, eventos e pausas).
4. Abrir `tests/index.html` → 96/96. Abrir um `.jff` no JFLAP e simular `Aria:␣Olá` (aceita) e `aria:␣Olá` (rejeita).
Ensaie no computador da apresentação, com os arquivos abertos em abas.
