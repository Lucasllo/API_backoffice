---
phase: "02"
slug: entrega-confirmada
status: verified
threats_open: 0
asvs_level: 1
created: "2026-10-11"
---

# Fase 02 — Segurança

> Contrato de segurança da fase: registro de ameaças, riscos aceitos e trilha de auditoria.

---

## Fronteiras de confiança

| Fronteira | Descrição | Dado que cruza |
|----------|-------------|---------------|
| Entregador autenticado → POST /deliveryqueue/:idShopping | O id da rota e o JWT são entrada não confiável. O papel Delivery já é exigido pelo controller. Esta fase não alarga o guard. | Identificador do pedido e token |
| Entregador autenticado → POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping | O código viaja na URL. A comparação é em memória, contra a coluna já lida. | Código de verificação |
| DeliveryqueueService → MySQL | O save e o find passam pelo repositório TypeORM. O código da URL não entra em SQL concatenado. | Linha da fila e status do pedido |
| seed/demo.sql → MySQL | O texto versionado roda no npm run seed. O UNIQUE nasce aí porque ENV=demo não sincroniza. | Schema da demo |

---

## Registro de ameaças

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-02-01 | Tampering | DeliveryqueueService.create | high | mitigate | `create` espera `deliveryQueueRepository.save` com `DeliveryStatus.Waiting` antes do handler resolver | closed |
| T-02-02 | Tampering | DeliveryqueueService.validateDelivery | high | mitigate | `findByShopping` carrega a linha e `save` grava essa instância. O método não faz `new DeliveryQueueEntity()` | closed |
| T-02-03 | Tampering | deliveryqueue.shoppingId | high | mitigate | O ramo com linha já lança `Shopping já usado`. `seed/demo.sql` declara `UQ_deliveryqueue_shoppingId` no CREATE e no ALTER idempotente. O catch de `ER_DUP_ENTRY` ou errno `1062` relança a mesma mensagem | closed |
| T-02-04 | Tampering | DeliveryqueueService.validateDelivery | high | mitigate | Pedido nulo, código divergente e fila com tamanho diferente de 1 lançam `Dados invalidos` antes de `save` e antes de `updateStatus` | closed |
| T-02-05 | Tampering | verificationCode na URL | high | mitigate | A comparação `shopping.verificationCode != verificationCode` fica em memória. O parâmetro não é concatenado em SQL | closed |
| T-02-06 | Information disclosure | QueryFailedError no create | medium | mitigate | Só `ER_DUP_ENTRY` e errno `1062`, também em `driverError`, viram `Shopping já usado`. Os outros erros não são reempacotados com `error.message` | closed |
| T-02-07 | Information disclosure | corpo HTTP da fila | medium | mitigate | `create` não devolve `verificationCode`. O 400 de código divergente usa só `Dados invalidos`. O método não grava foto, assinatura, documento, GPS nem telefone | closed |
| T-02-08 | Elevation of privilege | validateDelivery sem dono do token | medium | accept | DLVY-06 fica fora do v1. Qualquer entregador com papel Delivery pode confirmar o pedido semeado. O dado é fictício. O guard global e o RoleGuard permanecem | closed |
| T-02-SC | Tampering | npm ci | high | mitigate | Nenhum pacote novo entrou no `package.json` desta fase | closed |

*Status: open · closed · open — abaixo do limiar high (não bloqueia)*
*Severidade: critical > high > medium > low — só ameaças abertas no limiar `high` ou acima entram em `threats_open`*
*Disposition: mitigate · accept · transfer*

---

## Riscos aceitos

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-08 | Confirmar sem amarrar o token ao dono da fila é DLVY-06, fora do v1. O pedido e o entregador são fictícios. | Plano 02-01 | 2026-10-11 |

*Riscos aceitos não voltam em auditorias futuras.*

---

## Trilha de auditoria

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-10-11 | 9 | 9 | 0 | gsd-verify-work |

Classificação no nível ASVS 1, com o registro escrito no plano. Nenhuma ameaça aberta no limiar `high`.

---

## Sign-Off

- [x] Todas as ameaças têm disposition (mitigate / accept / transfer)
- [x] Riscos aceitos documentados no log
- [x] `threats_open: 0` confirmado
- [x] `status: verified` no frontmatter

**Approval:** verified 2026-10-11
