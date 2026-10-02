# AFNε — ER-03 Evento embutido (`event`)

- **Alfabeto:** Σ = m ∪ {_, ':', '{', '}'}.
- **Estados:** q0..q27 (28)
- **Inicial:** q0
- **Final:** q27
- **Construção:** Thompson (movimentos vazios ε)
- **Legenda:** `ε` = movimento vazio; `␣` = espaço; U, L, m, d, n e B = classes definidas nas convenções da ficha (B = Σ_corpo; no `.jff` o B vem expandido, uma transição por símbolo).

| De | Símbolo | Para |
|---|---|---|
| q0 | { | q1 |
| q1 | ε | q18 |
| q2 | s | q3 |
| q3 | o | q4 |
| q4 | m | q5 |
| q5 | ε | q19 |
| q6 | i | q7 |
| q7 | t | q8 |
| q8 | e | q9 |
| q9 | m | q10 |
| q10 | ε | q19 |
| q11 | e | q12 |
| q12 | f | q13 |
| q13 | e | q14 |
| q14 | i | q15 |
| q15 | t | q16 |
| q16 | o | q17 |
| q17 | ε | q19 |
| q18 | ε | q2 |
| q18 | ε | q6 |
| q18 | ε | q11 |
| q19 | ε | q20 |
| q20 | : | q21 |
| q21 | ε | q24 |
| q22 | m ∪ {_} | q23 |
| q23 | ε | q22 |
| q23 | ε | q25 |
| q24 | ε | q22 |
| q25 | ε | q26 |
| q26 | } | q27 |
