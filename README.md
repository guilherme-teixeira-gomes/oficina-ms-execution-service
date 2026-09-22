# Oficina — Execution Service

Microsserviço de **Execução e Produção** — Tech Challenge Fase 4 (Grupo MotorMind).

## Propósito

Gerencia a fila de execução dos reparos de uma OS:

- Recebe a ordem para iniciar a execução (após o pagamento aprovado)
- Controla o progresso do diagnóstico e reparos
- Comunica a finalização (ou falha) de volta ao orquestrador

## Tecnologias

- Node.js 20 + TypeScript + Express
- **Mongoose + MongoDB** (banco **NoSQL** próprio deste serviço)
- RabbitMQ (mensageria assíncrona)
- Jest + Supertest (testes unitários, integração e BDD)
- Docker + Kubernetes + GitHub Actions + SonarCloud

## Por que MongoDB (NoSQL)

Cumpre o requisito da Fase 4 de usar pelo menos um banco não relacional. O documento
de execução é naturalmente flexível — cada OS tem uma quantidade variável de itens de
reparo, notas e etapas — o que se modela melhor como documento do que como tabela rígida.

## Papel na arquitetura (Saga)

Participante do Saga orquestrado pelo OS Service:

| Recebe (comando) | Faz | Publica (evento) |
|------------------|-----|------------------|
| execution.iniciar | cria execução e inicia | os.execucao-iniciada |
| (REST /finish) | conclui reparos | os.execucao-finalizada |
| (REST /fail) | marca falha | os.execucao-falhou (dispara compensação) |

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /execution | Lista execuções |
| GET | /execution/:orderId | Consulta execução de uma OS |
| POST | /execution/:orderId/finish | Finaliza a execução |
| POST | /execution/:orderId/fail | Marca falha (dispara rollback do Saga) |
| GET | /health | Healthcheck |

## Execução local

```bash
npm install
npm test
npm run test:coverage   # cobertura >80%
npm run dev             # requer MongoDB e RabbitMQ
```

## Testes

- Unitários dos use-cases (iniciar, finalizar, falhar)
- Integração das rotas HTTP (Supertest)
- **BDD** do fluxo de execução e da compensação (`tests/execucao-fluxo.bdd.spec.ts`)
- Cobertura: **~91%** (mínimo exigido: 80%)

## Deploy

Pipeline (GitHub Actions): testes + SonarCloud → build/push Docker → deploy no EKS.

Banco **MongoDB próprio e isolado** (`k8s/mongo.yaml`) — nenhum outro serviço acessa este banco.

## Documentação da API (Swagger)

Com o serviço rodando, acesse: **http://localhost:3003/api-docs**
(porta 3000 quando rodando fora do docker-compose)