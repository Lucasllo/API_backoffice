# Pesquisa de funcionalidades

**Domínio:** confirmação de entrega de um pedido já existente no backoffice de farmácia (iFarma / Colibri)
**Pesquisado:** 2026-10-04
**Confiança:** MÉDIA

O leitor deste marco é quem clona o repositório e percorre um pedido semeado até a confirmação. O ator HTTP desse caminho é o entregador (`Role.Delivery`). A API não cria pedido: `POST /shopping` lista. O contrato já existente é `POST /deliveryqueue/:idShopping` e depois `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping`.

No mercado de última milha, reivindicar e confirmar com código significa o seguinte. Um pedido tem no máximo um entregador ativo. A reivindicação persiste. Uma segunda reivindicação do mesmo pedido é recusada. O cliente é quem detém o código. O entregador digita esse código na entrega. Código certo conclui. Código errado não conclui. Foto, assinatura, GPS, SMS do PIN e “entregar sem código” são camadas de produto comercial, não deste portfólio.

Confiança MÉDIA nas expectativas de mercado (busca cruzada com documentação Uber Direct, Instacart e material público do iFood). Confiança alta no contrato deste repositório, lido em `src/services/deliveryqueue.service.ts` e `src/controllers/deliveryqueue.controller.ts`.

## Panorama de funcionalidades

### Obrigatórias (table stakes)

Sem isto a demo falha: a pessoa não sobe a API, não reivindica o pedido semeado ou a confirmação não fecha a mesma entrega. O comando de teste prova só esse caminho.

| Funcionalidade | Por que é esperada | Complexidade | Notas |
|----------------|--------------------|--------------|-------|
| Pedido semeado, não criado pela API | O domínio trata o pedido como dado que já existe. `POST /shopping` lista. Quem clona precisa de um `id` conhecido para chamar a fila. | BAIXA | Semente versionada e fictícia em `shoppings`, com `verificationCode`, `storeCode` e cliente. Sem `POST` de criação de pedido. |
| Loja, operador e entregador fictícios na mesma semente | O login do entregador exige linha em `userdelivery`. O pedido pertence a uma loja. O projeto pede os três atores no conjunto de demonstração, mesmo com o teste usando só o entregador. | BAIXA | Senha com bcrypt compatível com `UserDeliveryRepository.login`. Papel `Role.Delivery`. Segredos reais fora do repositório. |
| README em português e exemplo de ambiente | O valor do portfólio é clonar, configurar e subir. Sem isso o caminho HTTP não é reproduzível. | BAIXA | Exemplo de ambiente sem segredo. `synchronize` em `src/app.module.ts` só liga quando `process.env.ENV === 'developmen'`. O exemplo tem de criar o schema da demo ou a semente tem de trazer as tabelas. Não abrir pipeline de migração além disso. |
| Autenticação do entregador no fluxo | `DeliveryqueueController` exige `@Roles(Role.Delivery)` e `@UseGuards(RoleGuard)`. Sem Bearer de `POST /auth/loginDelivery`, a fila não roda. | BAIXA | O teste autentica. Não é auditoria de JWT, CORS ou revogação. |
| `POST /deliveryqueue/:idShopping` persiste a fila | O entregador espera que “pegar o pedido” grave a atribuição e sobreviva à próxima leitura. Hoje `DeliveryqueueService.create` chama `save` sem `await`. | BAIXA | Gravar `DeliveryQueueEntity` com `shoppingId`, `userDeliveryId` do token, `status` `DeliveryStatus.Waiting` (`1`) e `createdAt`. O `idShopping` vem do pedido semeado. |
| Segunda reivindicação do mesmo pedido recusada | Um pedido tem uma entrega ativa. Outro `POST` no mesmo `idShopping` não pode parecer sucesso. O service já lança `BadRequestException` com `Shopping já usado` quando `findByShopping` acha linha. | BAIXA | Vale depois que o primeiro `save` realmente persistiu. Não implementar lock de linha nem teste de corrida neste comando. |
| Código certo conclui a mesma fila e o pedido | iFood, Uber Direct e Instacart só finalizam depois do código correto. Aqui o código já está em `ShoppingEntity.verificationCode`. A confirmação tem de atualizar a linha `Waiting` para `DeliveryStatus.Finished` (`2`) e o pedido para `solicitacaoCompraStatus.Concluded` (`4`). | MÉDIA | Hoje `validateDelivery` faz `new DeliveryQueueEntity()` sem `id`, sem `shoppingId` e sem `userDeliveryId`, e dá `save`. O efeito esperado é `findByShopping` + atualizar essa instância + `ShoppingService.updateStatus`. As duas gravações precisam valer juntas para o teste. |
| Código errado não conclui | Confirmar com código deixa de ser confirmação se qualquer string fecha a entrega. O ramo atual compara `shopping.verificationCode` e lança `BadRequestException` com `Dados invalidos`. | BAIXA | Pedido e fila permanecem como estavam. O teste único afirma o caminho feliz e esta recusa. Não cria limite de tentativas nem fluxo de suporte. |
| Pedido ou entregador inexistente não abre fila | Reivindicar um id que a semente não tem não pode gravar fila órfã. O service já lança `Dados invalidos` quando `findOne` do pedido ou do entregador volta vazio. | BAIXA | Manter o comportamento. Não é um caso novo de produto. |
| Um comando de teste só desse caminho | O portfólio precisa de uma prova automática: semente, login do entregador, fila persistida, código certo conclui a mesma linha e o pedido, código errado não conclui. | MÉDIA | Jest já está em `package.json` (`test`). O comando aponta para esse spec. `npm test` da suíte inteira e `test/app.e2e-spec.ts` (espera `GET /` com `Hello World!`) ficam de fora. |

### Diferenciais (pular neste portfólio)

Úteis num produto de entrega. Não fazem a demo falhar. Não entram no comando único.

| Funcionalidade | Proposta de valor | Complexidade | Notas |
|----------------|-------------------|--------------|-------|
| `GET /deliveryqueue/findByUserDelivery` | O entregador revê o que reivindicou, com `shoppingEntity`. A rota já existe. | BAIXA | O teste não precisa dela. O README pode citá-la só se já responder sem trabalho extra. |
| Confirmação só pelo entregador que reivindicou | Em produção, quem não está na fila não deveria concluir o pedido. O `validateDelivery` atual não lê `@Delivery()`. | MÉDIA | Expectativa real de última milha. Fora deste marco: o isolamento de loja e o restante da auditoria não travam a demo. |
| Limite de tentativas e “não achei o cliente” | Instacart manda o shopper ao suporte depois de códigos errados repetidos. Uber e iFood têm ajuda quando o cliente não informa o PIN. | ALTA | Exige contador, mensagem ao cliente e exceção operacional. A demo usa o código impresso na semente. |
| SMS ou push com o `verificationCode` | Uber e Instacart enviam o PIN ao cliente. O iFood mostra o código no app de quem pediu. | ALTA | `MailingService` não participa deste fluxo. Não ligar SMTP para a demo. |
| Status intermediários até `Concluded` | Apps de entrega passam por coletado, a caminho e no local. O enum `solicitacaoCompraStatus` tem `WaitingMotoboy` (`6`), `OrderOnTheWay` (`7`) e `OrderAtTheDeliveryPoint` (`8`). | MÉDIA | `validateDelivery` já salta para `Concluded`. Percorrer os oito valores não é o caminho semeado. |
| Listagem `POST /shopping` sem estourar relação nula | `ShoppingMapper.toDTO` lê `entity.userClientEntity.name`. Relação nula quebra a lista, não a fila. | BAIXA | `DeliveryqueueService` usa `ShoppingService.findOne`, que devolve a entidade, sem mapper. Só entra se o README mandar listar pedidos. |
| Itens (`GET /product/findByShopping/:id`) e telefone do cliente | Contexto operacional do entregador. Rotas existem. Não são reivindicar nem confirmar. | BAIXA | Fora do comando único. |
| Corrida de dois entregadores com lock | Check-then-insert sem trava perde atualização se dois `POST` passam juntos por `findByShopping` vazio. | ALTA | Desnecessário para um leitor só. A recusa `Shopping já usado` no caso sequencial basta. |
| Replay idempotente da confirmação | Rede do app reenvia o mesmo “entregue”. Produção trata a segunda chamada como sucesso vazio ou conflito estável, sem segunda linha. | MÉDIA | O conserto obrigatório é não inserir outra `deliveryqueue`. Chave de idempotência fica para depois. |
| Foto, assinatura ou geofence como prova | Logística comercial empilha foto e carimbo de tempo. PIN e assinatura entram em entrega de maior valor. Uber Direct trata o PIN como opcional e combinável com foto. | ALTA | Este backoffice já prova a entrega com `verificationCode`. Outra modalidade é outro produto. |

### Anti-funcionalidades (não construir)

Pedidos comuns em app de entregador. Neste marco atrapalham o caminho semeado.

| Anti-funcionalidade | Por que alguém pediria | Por que é problema | No lugar disso |
|---------------------|------------------------|--------------------|----------------|
| Criar pedido na API | A demo “completa” teria checkout. | O domínio não cria pedido. `POST /shopping` é lista paginada. Um create novo muda o produto. | Semear `shoppings` e usar esse `id` em `POST /deliveryqueue/:idShopping`. |
| Vitrine de pedidos livres para o entregador escolher | Apps de oferta mostram corridas disponíveis. | Não há rota de pedidos não atribuídos no `DeliveryqueueController`. Seria dispatch novo. | O README informa o `idShopping` semeado. A reivindicação é esse `POST`. |
| Entregar sem código, ou aceitar qualquer código | Uber documenta “Deliver without PIN” via suporte quando o cliente não tem o PIN. | Anula a única prova que esta API tem. | Código da semente no README. Código diferente devolve `Dados invalidos` e não muda status. |
| Foto, assinatura, GPS, documento de quem recebeu | iFood pode pedir foto, nome ou documento além do código de 4 dígitos. Guias de POD tratam foto como registro de campo. | Não existe coluna nem rota para isso. Aumenta o marco sem provar o caminho atual. | Comparar `verificationCode` já gravado no pedido. |
| Máquina dos oito status no mesmo fluxo | O enum sugere separação, espera de motoboy, a caminho e no ponto. | A confirmação já conclui. O teste passaria a afirmar transições que a rota não faz. | `Waiting` na fila e `Concluded` no pedido. |
| Fila Bull, Redis ou microserviço | “Fila de entrega” soa como broker. | A fila é a tabela `deliveryqueue`, lida e escrita na request. Não há `@nestjs/microservices`. | Persistir e atualizar `DeliveryQueueEntity`. |
| Cobertura do restante da API e e2e `Hello World` | `npm test` e `npm run test:e2e` existem no README do Nest. | A suíte aponta para lacunas que não são este fluxo. O e2e espera `GET /` sem `AppController`. | Um comando, um spec: enfileirar e confirmar. |
| Recuperação de senha, e-mail, cartão, endereço, categoria | O grafo já tem esses módulos. | Handlers de cartão, endereço e categoria estão comentados. E-mail não entra na confirmação. | Deixar stub como está. |
| Auditoria que não trava a demo | `verificationCode` aparece em `GET /shopping/:id`. Não há rate limit, isolamento de loja nem revogação de sessão. | O portfólio é o fluxo, não o fechamento do mapa de riscos. | Autenticar o entregador no teste. Não esconder o código, não limitar tentativa e não filtrar `storeCode` neste marco. |
| Trocar o contrato HTTP | Um body JSON com o código seria mais claro do que o código na URL. | O demo mostra as rotas que o Swagger já publica. | Manter `POST /deliveryqueue/:idShopping` e `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping`. |

## Dependências entre funcionalidades

```
README + exemplo de ambiente
    └──requer──> schema MySQL da demo (ENV que liga synchronize, ou SQL versionado)

Semente (loja, operador, entregador, pedido com verificationCode)
    └──requer──> schema das tabelas userbackoffice, userdelivery, shoppings
    └──requer──> senha do entregador verificável no login

POST /auth/loginDelivery
    └──requer──> entregador semeado com Role.Delivery

POST /deliveryqueue/:idShopping persiste Waiting
    └──requer──> JWT de entregador
    └──requer──> pedido semeado
    └──completa──> segunda chamada recusada com "Shopping já usado"

POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping
    └──requer──> linha Waiting daquele shoppingId
    └──requer──> verificationCode do pedido semeado
    └──conflita──> new DeliveryQueueEntity() sem id na confirmação

Código errado
    └──conflita──> solicitacaoCompraStatus.Concluded

Comando de teste único
    └──requer──> semente + login + fila persistida + conclusão da mesma linha
    └──conflita──> meta de deixar npm test / test:e2e verdes no scaffold inteiro

Foto, assinatura, GPS, SMS, criar pedido
    └──conflita──> escopo semear → enfileirar → confirmar
```

### Notas de dependência

- **A confirmação requer a fila persistida.** `validateDelivery` precisa achar a linha criada no `POST /deliveryqueue/:idShopping`. Inserir outra entidade não conclui a reivindicação.
- **A fila persistida requer o `await` no `save`.** Sem a escrita terminar, a segunda reivindicação ainda vê `findByShopping` vazio e a confirmação não tem linha para atualizar.
- **O teste requer a semente e o login.** Não há pedido sem `POST` de criação. O controller não aceita chamada anônima.
- **O README requer schema utilizável.** Com `ENV` diferente de `developmen`, o TypeORM não sincroniza. O exemplo de ambiente não pode mandar subir a API contra um banco vazio sem dizer como as tabelas nascem.
- **Código errado conflita com `Concluded`.** Os dois resultados não podem sair da mesma chamada.
- **Prova de entrega por foto conflita com o marco.** O código no pedido já é a prova. Somar foto muda tabela, rota e teste.
- **A listagem de pedidos não é dependência da fila.** `ShoppingMapper` nulo quebra `POST /shopping`. `findOne`, usado pela fila, não passa por esse mapper.

## Definição de MVP

### Entregar no v1

O mínimo para alguém clonar e ver a entrega confirmada, com um teste que prova isso.

- [ ] Exemplo de ambiente e README em português que sobem NestJS, MySQL e o schema da demo
- [ ] Semente fictícia: loja, operador, entregador e um pedido com `verificationCode` conhecido
- [ ] Login `POST /auth/loginDelivery` e uso do Bearer nas duas rotas da fila
- [ ] `POST /deliveryqueue/:idShopping` grava `DeliveryStatus.Waiting` para esse entregador e esse pedido
- [ ] Segundo `POST` no mesmo pedido responde `Shopping já usado`
- [ ] `POST /deliveryqueue/validateDelivery/:idShopping/:codeShopping` com o código da semente atualiza essa linha para `DeliveryStatus.Finished` e o pedido para `solicitacaoCompraStatus.Concluded`
- [ ] Código diferente não altera fila nem pedido
- [ ] Um comando Jest prova só esse caminho

### Depois da demo (v1.x)

Só se o caminho semeado já estiver estável.

- [ ] `GET /deliveryqueue/findByUserDelivery` no roteiro manual, se a resposta já vier consistente
- [ ] Confirmação restrita ao `userDeliveryId` da fila
- [ ] Segunda confirmação do mesmo pedido estável (sem linha nova), se o teste feliz ainda deixar esse buraco
- [ ] `POST /shopping` sem exceção quando `userClientEntity` vier nula, se o README passar a listar pedidos

### Consideração futura (v2+)

- [ ] SMS do código, limite de tentativas e entrega assistida sem PIN
- [ ] Foto, assinatura, geofence e documento de quem recebeu
- [ ] Ofertas, reatribuição e lock para dois entregadores
- [ ] Status intermediários, telefone do cliente e itens no mesmo passeio
- [ ] Fechamento de segurança do mapa de riscos (código no `GET`, isolamento de loja, rate limit, CORS, revogação)

## Matriz de priorização

| Funcionalidade | Valor para quem clona | Custo | Prioridade |
|----------------|----------------------|-------|------------|
| Semente com pedido e `verificationCode` | ALTO | BAIXO | P1 |
| README e ambiente que sobem o schema | ALTO | BAIXO | P1 |
| Login do entregador no fluxo | ALTO | BAIXO | P1 |
| Fila `Waiting` persistida | ALTO | BAIXO | P1 |
| Recusa `Shopping já usado` | ALTO | BAIXO | P1 |
| Código certo conclui a mesma linha e o pedido | ALTO | MÉDIO | P1 |
| Código errado não conclui | ALTO | BAIXO | P1 |
| Um comando de teste desse caminho | ALTO | MÉDIO | P1 |
| Listar a fila do entregador | MÉDIO | BAIXO | P2 |
| Só o entregador da fila confirma | MÉDIO | MÉDIO | P2 |
| Mapper de pedido com relação nula | BAIXO | BAIXO | P3 |
| Status intermediários | BAIXO | MÉDIO | P3 |
| Foto, SMS, GPS, criar pedido, cobertura geral | BAIXO | ALTO | P3 |

**Chave de prioridade:**

- P1: a demo falha sem isso
- P2: faz sentido depois do caminho feliz
- P3: fora deste portfólio

## Análise de comportamento esperado

Não há concorrente de produto para copiar. A tabela registra o que o entregador encontra nesses fluxos e o que esta demo faz com o contrato que já existe.

| Comportamento | iFood (entregador) | Uber Direct / Instacart | Esta demo |
|---------------|--------------------|-------------------------|-----------|
| Quem segura o código | O cliente. O entregador pede os dígitos, digita e espera a validação antes de finalizar. | O cliente recebe o PIN (SMS na Uber e na Instacart). O entregador digita no dropoff. | O código já está no pedido semeado. O README mostra o valor. Não há SMS. |
| Código certo | Conclui a entrega. | Satisfaz a verificação e permite marcar a entrega. | Atualiza a `deliveryqueue` daquele `shoppingId` para `Finished` e o pedido para `Concluded`. |
| Código errado ou ausente | Não finaliza. O entregador aciona o atendimento. | Não marca delivered. Ajuda no app ou suporte depois de tentativas. | `Dados invalidos`. Nada é concluído. Sem suporte e sem “entregar sem PIN”. |
| Quem fica com o pedido | O entregador daquela oferta. | Uma atribuição ativa por pedido. Segunda atribuição é erro ou conflito. | O `userDeliveryId` do token no primeiro `POST`. O segundo `POST` recebe `Shopping já usado`. |
| Outras provas | Foto, nome ou documento podem aparecer além do código. | PIN pode conviver com foto ou assinatura. PIN não combina com deixar na porta. | Só `verificationCode`. Sem foto, assinatura ou GPS. |
| Origem do pedido | O app cria o pedido. | A API de create delivery cria a entrega. | Fora de escopo. A semente insere o pedido. |

## Fontes

- Código deste repositório (confiança alta, leitura direta): `src/services/deliveryqueue.service.ts`, `src/controllers/deliveryqueue.controller.ts`, `src/repositories/deliveryQueue.repository.ts`, `src/entities/deliveryQueue.entity.ts`, `src/entities/shopping.entity.ts`, `src/enums/deliveryStatus.enum.ts`, `src/enums/solicitacaoCompraStatus.enum.ts`, `src/mappers/shopping.mapper.ts`, `src/app.module.ts`.
- Uber Direct, guia de pincode (confiança MÉDIA, página oficial lida em 2026-10-04): https://developer.uber.com/docs/deliveries/guides/pincode — PIN de 4 dígitos no dropoff; código certo conclui; ausência do cliente vai para ajuda; PIN é opcional e incompatível com leave-at-door.
- Uber Help, confirmação com PIN (confiança MÉDIA, mesma busca): https://help.uber.com/driving-and-delivering/article/delivery-confirmation-with-pin-feature?nodeId=61478729-8a5f-4f93-ba77-8fbcec909c16 — pedir o PIN ao cliente; “Deliver without PIN” só depois de suporte.
- Instacart, code verified delivery, atualizado em 2026-05-14 (confiança MÉDIA, página oficial lida): https://docs.instacart.com/connect/fulfillment_guide/concepts/code_verified_delivery — código depois da chegada; códigos errados repetidos vão ao suporte; entrega sem código é exceção com geolocalização, não o caminho padrão.
- iFood Entregadores, código de entrega (confiança MÉDIA; a busca devolveu o FAQ, o fetch da página oficial expirou): https://entregador.ifood.com.br/faq-category/codigo-de-entrega/ — pedir o código, digitar, aguardar validação, finalizar. Recusa do cliente vai ao atendimento.
- iFood Entregadores, outras provas na confirmação (confiança MÉDIA, busca): https://entregador.ifood.com.br/noticias/como-confirmar-a-entrega-novas-opcoes-no-app/ — foto, nome ou documento podem ser pedidos além do código. Fora desta demo.
- Atribuição exclusiva (confiança MÉDIA, fontes de desenho, não manuais de produto): https://github.com/illia-malachyn/food-delivery/blob/main/docs/delivery-business-rules.md — uma entrega ativa por pedido; https://backend-bytes.hashnode.dev/the-bug-that-sent-two-delivery-partners-to-the-same-order — check-then-save sem versão perde a primeira atribuição.
- POD comercial com foto e geofence (confiança MÉDIA): https://www.dispatchtrack.com/blog/proof-of-delivery-system/ e https://theondemandapp.com/blog/courier-delivery-app-development/ — foto e carimbo são o registro de campo usual nesses produtos. Não promovem este marco, que já tem código no pedido.

Lacuna: não há documentação pública da Colibri/iFarma além deste código. O comportamento “o que o usuário espera” foi lido em apps de entrega genéricos e aplicado ao contrato `deliveryqueue` já implementado. Não foi verificado um manual interno de farmácia.

---
*Pesquisa de funcionalidades: confirmação de entrega com código num pedido semeado*
*Pesquisado: 2026-10-04*
