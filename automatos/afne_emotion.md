# AFNε — ER-02 Tag de emoção (`emotion`)

- **Alfabeto:** Σ = m ∪ {'[', ']'}  (m = letras minúsculas a–z).
- **Estados:** q0..q45 (46)
- **Inicial:** q0
- **Final:** q45
- **Construção:** Thompson (movimentos vazios ε)
- **Legenda:** `ε` = movimento vazio; `␣` = espaço; U, L, m, d, n e B = classes definidas nas convenções da ficha (B = Σ_corpo; no `.jff` o B vem expandido, uma transição por símbolo).

| De | Símbolo | Para |
|---|---|---|
| q0 | [ | q1 |
| q1 | ε | q42 |
| q2 | f | q3 |
| q3 | e | q4 |
| q4 | l | q5 |
| q5 | i | q6 |
| q6 | z | q7 |
| q7 | ε | q43 |
| q8 | t | q9 |
| q9 | r | q10 |
| q10 | i | q11 |
| q11 | s | q12 |
| q12 | t | q13 |
| q13 | e | q14 |
| q14 | ε | q43 |
| q15 | r | q16 |
| q16 | a | q17 |
| q17 | i | q18 |
| q18 | v | q19 |
| q19 | a | q20 |
| q20 | ε | q43 |
| q21 | m | q22 |
| q22 | e | q23 |
| q23 | d | q24 |
| q24 | o | q25 |
| q25 | ε | q43 |
| q26 | s | q27 |
| q27 | u | q28 |
| q28 | r | q29 |
| q29 | p | q30 |
| q30 | r | q31 |
| q31 | e | q32 |
| q32 | s | q33 |
| q33 | a | q34 |
| q34 | ε | q43 |
| q35 | n | q36 |
| q36 | e | q37 |
| q37 | u | q38 |
| q38 | t | q39 |
| q39 | r | q40 |
| q40 | o | q41 |
| q41 | ε | q43 |
| q42 | ε | q2 |
| q42 | ε | q8 |
| q42 | ε | q15 |
| q42 | ε | q21 |
| q42 | ε | q26 |
| q42 | ε | q35 |
| q43 | ε | q44 |
| q44 | ] | q45 |
