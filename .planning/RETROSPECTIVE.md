# Retrospective

## Milestone: v1.0 — MVP

**Shipped:** 2026-10-11
**Phases:** 3 | **Plans:** 4 | **Tasks:** 9
**Timeline:** 2026-10-04 → 2026-10-11 (8 dias)
**Git range:** `681973e` (docs: define v1 requirements) → arquivo do marco

### What Was Built

- MySQL 8.4 local, semente idempotente da loja 2312 e login do entregador com o JWT de demonstração
- O entregador grava o pedido 1 como Waiting, o segundo POST responde `Shopping já usado`, e o código `4821` conclui essa mesma linha
- `npm run test:delivery` prova a fila, o código `0000` e o código `4821`
- O README em português leva até a confirmação, e `npm run seed` espera o MySQL do Compose por até 130 segundos

### What Worked

- As três fases seguiram a ordem da pesquisa: ambiente e semente, fila, README e prova.
- A semente versionada e o `ENV=demo` subiram a demo sem ligar `synchronize` e sem pacote novo.
- Um comando Jest isolado provou só o caminho da entrega.
- UAT das três fases fechou sem issues abertos (5, 6 e 5 testes).

### What Was Inefficient

- A verificação da fase 1 ficou `stale`. O marco fechou com override explícito, sem reexecutar `/gsd-verify-work 1`.
- A primeira verificação da fase 3 falhou com `ECONNREFUSED` porque o MySQL da demo estava parado. O relatório só passou depois do banco no ar e do digest oficial no arquivo.
- Não houve auditoria de marco (`/gsd-audit-milestone`) antes do arquivo.

### Patterns Established

- `ENV=demo` mantém o literal `developmen` de `synchronize`.
- A chave única de `shoppingId` fica no SQL da demo, não na entidade.
- A confirmação grava `Finished` na linha já carregada.
- `npm run test:delivery` não usa `--forceExit`.

### Key Lessons

- O status canônico da verificação exige `passed` e o digest oficial. Trocar só o texto do relatório não fecha a fase.
- `npm run test:delivery` precisa do MySQL em `127.0.0.1:3306` antes de afirmar o caminho.
- WR-01 e WR-02 da fase 1 continuam abertos porque não travam a demo.

### Cost Observations

- Mix de modelos: não registrado neste marco.
- Período: 8 dias, de 2026-10-04 a 2026-10-11.
- Commits de feature concentrados na semente (fase 1) e na fila (fase 2). A fase 3 foi README e o comando de prova.

## Cross-Milestone Trends

| Milestone | Phases | Plans | Timeline | Closeout |
|-----------|--------|-------|----------|----------|
| v1.0 MVP | 3 | 4 | 8 dias | override (fase 1 stale) |
