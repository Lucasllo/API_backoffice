# Phase 3: Percurso e prova - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-10-11
**Phase:** 3-Percurso e prova
**Areas discussed:** Passos do README

---

## Áreas oferecidas e não escolhidas

A apresentação inicial também ofereceu o estado do pedido `1` depois de `npm run test:delivery` e a primeira subida (espera do MySQL e `DB_DATABASE`). O usuário discutiu só os passos do README e, no fechamento, pediu para gravar o contexto.

---

## Passos do README

### Quais chamadas a pessoa executa

| Option | Description | Selected |
|--------|-------------|----------|
| Quatro passos com a resposta esperada | Login do entregador, enfileirar o pedido 1, código errado sem concluir, código 4821 concluindo a mesma entrega | ✓ |
| Só o caminho até a confirmação | Login, enfileirar e código 4821. O código errado fica só no teste | |
| Você decide | Percurso que um leitor repete sem abrir o Swagger às cegas | |

**User's choice:** Quatro passos com a resposta esperada
**Notes:** Nenhuma nota livre.

### Como cada passo aparece

| Option | Description | Selected |
|--------|-------------|----------|
| Bloco para colar no terminal | Método, rota, body e a linha do que a resposta precisa mostrar. Uma frase aponta o Swagger em /api | ✓ |
| Roteiro no Swagger | Abrir http://localhost:3000/api e repetir os quatro passos em Try it out | |
| Você decide | Formato que alguém reproduz sem adivinhar o body | |

**User's choice:** Bloco para colar no terminal
**Notes:** Nenhuma nota livre.

### O que cada bloco promete

| Option | Description | Selected |
|--------|-------------|----------|
| Status e o que a resposta realmente traz | Login mostra o token. Enfileirar e o código 4821 mostram sucesso sem corpo. Código errado mostra 400 e Dados invalidos. O texto descreve espera e conclusão no banco | ✓ |
| GET /deliveryqueue/findByUserDelivery | Duas chamadas a mais para ver Waiting e Finished na resposta | |
| Você decide | O README só afirma o que a pessoa vê ao colar o comando | |

**User's choice:** Status e o que a resposta realmente traz
**Notes:** O GET ficou de fora dos quatro passos.

### Como os dados da semente entram no texto

| Option | Description | Selected |
|--------|-------------|----------|
| Quadro único e depois os curls | E-mail, senha, pedido e código 4821 uma vez no topo. Os três passos seguintes levam Authorization: Bearer. O código errado do exemplo é 0000 | ✓ |
| Cada bloco repete os dados | E-mail, senha, pedido, código e header dentro de cada exemplo | |
| Você decide | O leitor acha os dados sem caçar no meio do texto | |

**User's choice:** Quadro único e depois os curls
**Notes:** Nenhuma nota livre.

---

## Claude's Discretion

O usuário não escolheu "Você decide" em nenhuma pergunta. No fechamento, pediu para gravar o contexto sem discutir o estado do pedido depois da prova nem a primeira subida. Essas duas ficaram no critério do contexto:

- `npm run test:delivery` reaplica a semente antes das asserções e deixa o pedido `1` concluído.
- WR-04 entra porque a ordem do README é subir o MySQL e semear em seguida. WR-01 e WR-02 ficam abertos.
- O quadro cita só o entregador. A seção de subida vem antes dos quatro blocos, e o comando de prova fecha o README.

## Deferred Ideas

- `GET /deliveryqueue/findByUserDelivery` no README (`DLVY-05`).
- WR-01 e WR-02.
- `DLVY-06`, `DLVY-07` e `DLVY-08`.
