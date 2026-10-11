# Requirements: API iFarma Backoffice

**Defined:** 2026-10-04
**Core Value:** Uma pessoa clona o repositório, segue o README e confirma a entrega de um pedido, e um comando de teste prova esse caminho.

## v1 Requirements

Requisitos do portfólio. Cada um mapeia para uma fase do roadmap.

### Ambiente

- [ ] **ENV-01**: Quem clona o repositório segue um README em português e sobe a API até confirmar a entrega do pedido semeado
- [x] **ENV-02**: Quem clona configura MySQL e a API a partir de um exemplo de ambiente, sem segredo real e sem pacote novo no `package.json`

### Semente

- [x] **SEED-01**: A demo traz, em dados fictícios versionados, uma loja, um operador, um entregador e um pedido com `verificationCode` conhecido
- [x] **SEED-02**: A senha do entregador semeado autentica em `POST /auth/loginDelivery`

### Entrega

- [x] **DLVY-01**: O entregador autenticado envia `POST /deliveryqueue/:idShopping` e a fila desse pedido fica gravada como `DeliveryStatus.Waiting`
- [x] **DLVY-02**: Um segundo `POST /deliveryqueue/:idShopping` no mesmo pedido responde `Shopping já usado` e não abre outra fila
- [x] **DLVY-03**: `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` com o código da semente atualiza essa mesma linha para `DeliveryStatus.Finished` e o pedido para `solicitacaoCompraStatus.Concluded`
- [x] **DLVY-04**: Um código diferente de `verificationCode` não altera a fila nem o pedido

### Prova

- [ ] **TEST-01**: Um comando Jest prova só esse caminho: login do entregador, fila persistida, código certo conclui a mesma linha e o pedido, código errado não conclui

## v2 Requirements

Reconhecido, fora deste roadmap.

### Entrega

- **DLVY-05**: O README cita `GET /deliveryqueue/findByUserDelivery` só se a rota já responder sem trabalho extra
- **DLVY-06**: A confirmação só é aceita do entregador que reivindicou o pedido
- **DLVY-07**: Uma segunda confirmação do mesmo pedido não insere outra linha em `deliveryqueue`
- **DLVY-08**: `POST /shopping` não quebra quando `userClientEntity` vem nula, se o README passar a listar pedidos

## Out of Scope

| Feature | Reason |
|---------|--------|
| Criar pedido pela API | `POST /shopping` lista. A demo semeia o pedido. |
| Foto, assinatura, GPS, SMS ou documento de quem recebeu | A prova deste backoffice é o `verificationCode`. |
| Lock para dois entregadores ao mesmo tempo | Um leitor só. A recusa sequencial `Shopping já usado` basta. |
| Status intermediários até `Concluded` | `validateDelivery` conclui. O teste não afirma os oito status. |
| Fila Bull, Redis ou microserviço | A fila é a tabela `deliveryqueue`. |
| Recuperação de senha, e-mail, cartão, endereço e categoria | Não participam do caminho semeado. Stubs permanecem. |
| Auditoria de segurança que não trava a demo | PAN/CVV, isolamento de loja, rate limit, CORS e revogação ficam de fora. |
| Cobertura do restante da API e o e2e `Hello World` | O comando novo prova só a entrega. |
| Trocar o contrato HTTP da fila | O portfólio mostra as rotas que o Swagger já publica. |

## Traceability

Cada requisito v1 mapeia para uma fase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 3 | Pending |
| ENV-02 | Phase 1 | Complete |
| SEED-01 | Phase 1 | Complete |
| SEED-02 | Phase 1 | Complete |
| DLVY-01 | Phase 2 | Complete |
| DLVY-02 | Phase 2 | Complete |
| DLVY-03 | Phase 2 | Complete |
| DLVY-04 | Phase 2 | Complete |
| TEST-01 | Phase 3 | Pending |

**Coverage:**

- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---

*Requirements defined: 2026-10-04*
*Last updated: 2026-10-04 after roadmap*
