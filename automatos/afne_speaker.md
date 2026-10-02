# AFNε — ER-01 Identificador de locutor (`speaker`)

- **Alfabeto:** Σ = U ∪ L ∪ {_}  (U e L definidos nas convenções).
- **Estados:** q0..q5 (6)
- **Inicial:** q0
- **Final:** q5
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
