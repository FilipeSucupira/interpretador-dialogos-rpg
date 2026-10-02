# AFNε — ER-04 Comando de tempo (`time`)

- **Alfabeto:** Σ = m ∪ d ∪ {'@', ␣}.
- **Estados:** q0..q31 (32)
- **Inicial:** q0
- **Final:** q31
- **Construção:** Thompson (movimentos vazios ε)
- **Legenda:** `ε` = movimento vazio; `␣` = espaço; U, L, m, d, n e B = classes definidas nas convenções da ficha (B = Σ_corpo; no `.jff` o B vem expandido, uma transição por símbolo).

| De | Símbolo | Para |
|---|---|---|
| q0 | @ | q1 |
| q1 | ε | q15 |
| q2 | e | q3 |
| q3 | s | q4 |
| q4 | p | q5 |
| q5 | e | q6 |
| q6 | r | q7 |
| q7 | a | q8 |
| q8 | ε | q16 |
| q9 | p | q10 |
| q10 | a | q11 |
| q11 | u | q12 |
| q12 | s | q13 |
| q13 | a | q14 |
| q14 | ε | q16 |
| q15 | ε | q2 |
| q15 | ε | q9 |
| q16 | ε | q17 |
| q17 | ␣ | q18 |
| q18 | ε | q19 |
| q19 | n | q20 |
| q20 | ε | q23 |
| q21 | d | q22 |
| q22 | ε | q21 |
| q22 | ε | q24 |
| q23 | ε | q21 |
| q23 | ε | q24 |
| q24 | ε | q30 |
| q25 | m | q26 |
| q26 | s | q27 |
| q27 | ε | q31 |
| q28 | s | q29 |
| q29 | ε | q31 |
| q30 | ε | q25 |
| q30 | ε | q28 |
