# AFNε — ER-05 Comando de cena (`scene`)

- **Alfabeto:** Σ = m ∪ {'#', _, ␣}.
- **Estados:** q0..q10 (11)
- **Inicial:** q0
- **Final:** q10
- **Construção:** Thompson (movimentos vazios ε)
- **Legenda:** `ε` = movimento vazio; `␣` = espaço; U, L, m, d, n e B = classes definidas nas convenções da ficha (B = Σ_corpo; no `.jff` o B vem expandido, uma transição por símbolo).

| De | Símbolo | Para |
|---|---|---|
| q0 | # | q1 |
| q1 | c | q2 |
| q2 | e | q3 |
| q3 | n | q4 |
| q4 | a | q5 |
| q5 | ␣ | q6 |
| q6 | ε | q9 |
| q7 | m ∪ {_} | q8 |
| q8 | ε | q7 |
| q8 | ε | q10 |
| q9 | ε | q7 |
