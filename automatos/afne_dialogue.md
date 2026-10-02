# AFNε — ER-06 Linha de diálogo completa (`dialogue`)

- **Alfabeto:** Σ = Σ_corpo ∪ {'{', '}', '[', ']'}  (Σ_corpo enumerado no Apêndice A).
- **Estados:** q0..q93 (94)
- **Inicial:** q0
- **Final:** q93
- **Construção:** Thompson (movimentos vazios ε)
- **Legenda:** `ε` = movimento vazio; `␣` = espaço; U, L, m, d, n e B = classes definidas nas convenções da ficha (B = Σ_corpo; no `.jff` o B vem expandido, uma transição por símbolo).

| De | Símbolo | Para |
|---|---|---|
| q0 | U | q1 |
| q1 | ε | q4 |
| q2 | U ∪ L ∪ {_} | q3 |
| q3 | ε | q2 |
| q3 | ε | q5 |
| q4 | ε | q2 |
| q4 | ε | q5 |
| q5 | ε | q54 |
| q6 | ␣ | q7 |
| q7 | ε | q8 |
| q8 | [ | q9 |
| q9 | ε | q50 |
| q10 | f | q11 |
| q11 | e | q12 |
| q12 | l | q13 |
| q13 | i | q14 |
| q14 | z | q15 |
| q15 | ε | q51 |
| q16 | t | q17 |
| q17 | r | q18 |
| q18 | i | q19 |
| q19 | s | q20 |
| q20 | t | q21 |
| q21 | e | q22 |
| q22 | ε | q51 |
| q23 | r | q24 |
| q24 | a | q25 |
| q25 | i | q26 |
| q26 | v | q27 |
| q27 | a | q28 |
| q28 | ε | q51 |
| q29 | m | q30 |
| q30 | e | q31 |
| q31 | d | q32 |
| q32 | o | q33 |
| q33 | ε | q51 |
| q34 | s | q35 |
| q35 | u | q36 |
| q36 | r | q37 |
| q37 | p | q38 |
| q38 | r | q39 |
| q39 | e | q40 |
| q40 | s | q41 |
| q41 | a | q42 |
| q42 | ε | q51 |
| q43 | n | q44 |
| q44 | e | q45 |
| q45 | u | q46 |
| q46 | t | q47 |
| q47 | r | q48 |
| q48 | o | q49 |
| q49 | ε | q51 |
| q50 | ε | q10 |
| q50 | ε | q16 |
| q50 | ε | q23 |
| q50 | ε | q29 |
| q50 | ε | q34 |
| q50 | ε | q43 |
| q51 | ε | q52 |
| q52 | ] | q53 |
| q53 | ε | q55 |
| q54 | ε | q6 |
| q54 | ε | q55 |
| q55 | ε | q56 |
| q56 | : | q57 |
| q57 | ε | q58 |
| q58 | ␣ | q59 |
| q59 | ε | q92 |
| q60 | B | q61 |
| q61 | ε | q91 |
| q62 | { | q63 |
| q63 | ε | q80 |
| q64 | s | q65 |
| q65 | o | q66 |
| q66 | m | q67 |
| q67 | ε | q81 |
| q68 | i | q69 |
| q69 | t | q70 |
| q70 | e | q71 |
| q71 | m | q72 |
| q72 | ε | q81 |
| q73 | e | q74 |
| q74 | f | q75 |
| q75 | e | q76 |
| q76 | i | q77 |
| q77 | t | q78 |
| q78 | o | q79 |
| q79 | ε | q81 |
| q80 | ε | q64 |
| q80 | ε | q68 |
| q80 | ε | q73 |
| q81 | ε | q82 |
| q82 | : | q83 |
| q83 | ε | q86 |
| q84 | m ∪ {_} | q85 |
| q85 | ε | q84 |
| q85 | ε | q87 |
| q86 | ε | q84 |
| q87 | ε | q88 |
| q88 | } | q89 |
| q89 | ε | q91 |
| q90 | ε | q60 |
| q90 | ε | q62 |
| q91 | ε | q90 |
| q91 | ε | q93 |
| q92 | ε | q90 |
