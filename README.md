# AO MARKET

Plataforma de comércio e marketplace para Angola (B2C e B2B), preparada para
compradores, produtores, transportadores, empresas, administradores e
suporte. Frontend Web hoje, com a mesma base de código pronta para Android
e iOS via Capacitor no futuro.

## Stack

- **Frontend**: React + Vite + React Router, CSS puro (sem Next.js)
- **Backend**: Node.js + Express
- **Base de dados**: PostgreSQL
- **ORM**: Prisma
- **Mobile (futuro)**: Capacitor (Android/iOS), mesma API e mesma lógica de negócio

## Estrutura

Ver `docs/ARCHITECTURE.md`.

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ (local ou remoto)

## Instalação

```bash
git clone <repositório>
cd ao-market
npm install
```

Isto instala as dependências de `backend/` e `frontend/` (workspaces npm).

## Configuração do backend

```bash
cd backend
cp .env.example .env
```

Edita `.env` e define `DATABASE_URL` com as credenciais do teu PostgreSQL,
e gera valores aleatórios fortes para `JWT_SECRET` e `JWT_REFRESH_SECRET`.

Cria a base de dados no PostgreSQL (ex.):

```sql
CREATE DATABASE ao_market;
CREATE USER ao_market_user WITH ENCRYPTED PASSWORD 'a_tua_password';
GRANT ALL PRIVILEGES ON DATABASE ao_market TO ao_market_user;
```

## Migrations

```bash
npm run prisma:generate --workspace=backend
npm run prisma:migrate --workspace=backend
npm run prisma:seed --workspace=backend
```

O comando `prisma:seed` cria os papéis (roles) e permissões base do RBAC.

## Executar o backend

```bash
npm run dev:backend
```

Backend disponível em `http://localhost:4000`. Testa com:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/health/db
```

## Configuração e execução do frontend

```bash
cd frontend
cp .env.example .env
cd ..
npm run dev:frontend
```

Frontend disponível em `http://localhost:5173`.

## Testes

```bash
npm run test:backend
```

## Build de produção (frontend)

```bash
npm run build --workspace=frontend
```

## Documentação adicional

- `docs/ARCHITECTURE.md` — arquitetura em detalhe
- `docs/RBAC.md` — modelo de papéis e permissões
- `docs/WORKFLOW.md` — roteiro de implementação por fases

## Estado do projeto

Fase 1 concluída (estrutura, schema de dados, autenticação base, RBAC).
Módulo Segurança Social (INSS) implementado — ver `docs/INSS-INTEGRATION.md`.
Ver `docs/WORKFLOW.md` para o roteiro completo.
