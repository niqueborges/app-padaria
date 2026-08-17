# Padaria do Pedro - Sistema de Gestao Comercial e Ponto de Venda

Sistema de gestao de produtos, controle transacional de vendas com baixa automatica de estoque, relatorios financeiros consolidados e interface de ponto de venda (PDV). Desenvolvido com Clean Architecture, TypeScript estrito, Prisma ORM v7, PostgreSQL e React + Vite.

---

## 1. Contexto e Problema de Negocio

O estabelecimento operava com anotacoes manuais em papel para registrar as vendas do dia, controle visual de estoque e ausencia de consolidacao financeira. Esse modelo gerava tres gargalos operacionais principais:

1. **Divergencia de Estoque**: Ausencia de baixa atomica no momento da venda, resultando em indisponibilidade de itens sem aviso previo.
2. **Incerteza Financeira**: Dificuldade em apurar o faturamento real diario e mensal de forma confiavel e automatizada.
3. **Falta de Seguranca Operacional**: Ausencia de autenticacao e identificacao dos operadores responsaveis pelas vendas no caixa (Pedro e Maria).

---

## 2. Solucao Implementada

Desenvolveu-se uma solucao integrada composta por:

- **Backend RESTful**: Desenvolvido sob os principios da Clean Architecture e SOLID, desacoplando regras de negocio puras da camada de persistencia e do protocolo HTTP.
- **Transacoes Atomicas**: Baixa automatica e concorrente de estoque via transacao no banco de dados (`prisma.$transaction`) no momento exato da conclusao da venda.
- **Modulo de Relatorios**: Agregacao sob demanda de faturamento diario por data e receita mensal por ano e mes.
- **Autenticacao JWT e Hashing Bcrypt**: Controle de acesso seguro para os operadores cadastrados com expiracao configuravel.
- **Frontend SPA**: Ponto de Venda (PDV) agil com comanda virtual, catalogo de produtos com status de estoque em tempo real e dashboard de indicadores financeiros.
- **Conteinerizacao Multi-Stage**: Build unificado de producao que serve tanto a API quanto a interface web em uma unica porta, com usuario sem privilegios de root.

---

## 3. Arquitetura e Decisoes de Design

A estrutura do projeto segue estritamente a separacao de responsabilidades em 4 camadas fundamentais:

```
src/
├── domain/                     # Camada de Dominio: Entidades puras e classes de erro de negocio
│   ├── entities/               # Product, Sale, SaleItem, User
│   └── errors/                 # AppError, NotFoundError, ConflictError, ValidationError, UnauthorizedError
├── application/                # Camada de Aplicacao: Orquestracao de casos de uso e contratos
│   ├── services/               # ProductService, SaleService, ReportService, AuthService
│   ├── dto/                    # Schemas de validacao Zod e tipagens inferidas
│   └── ports/                  # Interfaces/Portas dos Repositorios (DIP)
├── infrastructure/             # Camada de Infraestrutura: Detalhes tecnicos concretos
│   ├── database/               # PrismaClient, Driver Adapter PG (@prisma/adapter-pg), Repositorios
│   ├── http/                   # Controllers, rotas Express e documentacao Swagger JSDoc
│   └── middleware/             # Request Logger (Pino), Error Handler global, AuthMiddleware
├── shared/                     # Modulos transversais (Logger estruturado, helpers)
frontend/                       # Aplicacao React + Vite + TypeScript (PDV, Estoque, Relatorios)
Dockerfile                      # Build multi-estagio (Frontend Builder, Backend Builder, Runner)
docker-compose.yml              # Orquestracao local de servicos (API + PostgreSQL)
```

### Principais Decisoes Arquiteturais

- **Inversao de Dependencia (DIP)**: Os servicos de aplicacao dependem exclusivamente de interfaces (`UserRepositoryPort`, `ProductRepositoryPort`, `SaleRepositoryPort`). Nenhuma regra de negocio depende diretamente do Prisma ou do Express.
- **Imutabilidade e Tipagem Estrita**: TypeScript configurado em modo ESM nativo (`NodeNext`), sem uso de `any`, com esquemas Zod garantindo a sanitizacao e validacao na borda da aplicacao.
- **Observabilidade Estruturada**: Logger Pino assincrono gerando saida em JSON com correlacao por identificador unico de requisicao (`x-request-id`) e medicao de latencia.
- **Seguranca Defensiva**: Aplicacao de Helmet para cabeçalhos HTTP, Rate Limiting para mitigacao de forca bruta e usuario `USER node` em ambiente Docker.

---

## 4. Stack Tecnologica e Justificativas

| Camada / Ferramenta | Tecnologia | Justificativa Tecnica |
| :--- | :--- | :--- |
| **Linguagem** | TypeScript 6 (Node.js 20+) | Seguranca de tipos em tempo de compilacao, reducao de falhas em runtime e suporte a ESM nativo. |
| **Framework Web** | Express.js 4 | Minimalista, baixo overhead, previsibilidade e facilidade de integracao com middlewares customizados. |
| **ORM & Database** | Prisma 7 + PostgreSQL 16 | Type-safety de ponta a ponta, migrations declarativas, pool de conexao via Driver Adapter (`@prisma/adapter-pg`). |
| **Validacao de Esquemas**| Zod 4 | Validacao declarativa com inferencia automatica de tipos TypeScript e mensagens de erro estruturadas. |
| **Seguranca & Criptografia** | Bcrypt + JsonWebToken (JWT) | Hash adaptativo com salt rounds para senhas e emissao de tokens de autenticacao stateless para os operadores. |
| **Observabilidade** | Pino | Logger estruturado em JSON com baixissimo custo de CPU, ideal para agregacao em ferramentas de log modernas. |
| **Frontend** | React 18 + Vite + TypeScript | Renderizacao reativa veloz, consumo direto da API com Axios e design system customizado em CSS. |
| **Qualidade & Testes** | Jest + ESLint v10 + Prettier + Husky | Pipeline de qualidade automatizada com validacao de commits semanticos (Conventional Commits) e suites unitarias. |
| **Conteinerizacao** | Docker (Multi-stage) | Padronizacao de ambiente, isolamento de dependencias de build e imagens finais compactas baseadas em Alpine Linux. |

---

## 5. Guia de Reproducao Local

### 5.1 Pre-requisitos

- **Node.js**: Versao 20.x ou superior.
- **Docker e Docker Compose**: Instalados e em execucao.
- **Git**: Para clonagem do repositorio.

### 5.2 Passo a Passo de Instalacao

1. **Clonar o Repositorio**:
```bash
git clone https://github.com/niqueborges/app-padaria.git
cd app-padaria
```

2. **Instalar Dependencias do Backend e Frontend**:
```bash
# Dependencias da API (backend)
npm install

# Dependencias da interface (frontend)
cd frontend
npm install
cd ..
```

3. **Configurar as Variaveis de Ambiente**:
```bash
# Copiar arquivo de exemplo para o .env local
cp .env.example .env
```

Conteudo padrao do `.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:dev@localhost:5432/padaria
JWT_SECRET=dev-secret-change-in-prod-super-secure-key-123456
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

4. **Inicializar o Banco de Dados PostgreSQL**:
```bash
docker compose up -d db
```

5. **Executar Migracoes e Povoamento Inicial (Seed)**:
```bash
# Aplicar schema no banco de dados
npm run prisma:migrate

# Executar seed com usuarios (Pedro e Maria) e catalogo inicial de produtos
npm run prisma:seed
```

Credenciais criadas no Seed:
- **Pedro (Dono)**: `pedro@padaria.com` | Senha: `padaria123`
- **Maria (Esposa)**: `maria@padaria.com` | Senha: `maria123`

---

## 6. Execucao da Aplicacao

### Modo Desenvolvimento (Backend + Frontend Separados)

Em um terminal, inicie a API:
```bash
npm run dev
```

Em outro terminal, inicie a aplicacao web:
```bash
npm run dev:frontend
```
- Interface Web: `http://localhost:5173`
- API Backend: `http://localhost:3000`
- Documentacao Swagger: `http://localhost:3000/api-docs`

---

### Modo Producao (Build Unificado)

Para compilar o backend e o frontend simultaneamente e executar em modo integrado:
```bash
# Compila o backend e o bundle do frontend
npm run build:all

# Inicia o servidor Node servindo a API e a SPA na porta 3000
npm start
```
- Acesso completo: `http://localhost:3000`

---

### Execucao Completa via Docker Compose

```bash
# Constroi as imagens multi-stage e sobe todos os servicos
docker compose up --build -d
```

---

## 7. Testes e Qualidade de Codigo

### Executar Testes Unitarios
```bash
npm test
```

### Executar Testes com Relatorio de Cobertura
```bash
npm run test:coverage
```

### Validar Padroes de Codigo com ESLint
```bash
npm run lint
```

### Validar Formatacao com Prettier
```bash
npm run format:check
```

---

## 8. Documentacao dos Endpoints REST

A documentacao OpenAPI interativa completa esta disponivel em `http://localhost:3000/api-docs`. Abaixo, o resumo dos endpoints principais:

| Metodo | Endpoint | Descricao | Autenticacao | Payload / Parametros |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Verificacao de saude da aplicacao | Publico | - |
| `POST` | `/api/auth/login` | Autenticacao de operador e emissao de JWT | Publico | `{ email, password }` |
| `GET` | `/api/auth/me` | Dados do operador autenticado | Bearer JWT | - |
| `GET` | `/api/products` | Listagem de todos os produtos do catalogo | Publico | - |
| `GET` | `/api/products/:id` | Consulta detalhada de produto por ID | Publico | `id` (UUID) |
| `POST` | `/api/products` | Cadastro de novo produto | Publico | `{ name, price, stock }` |
| `PUT` | `/api/products/:id` | Atualizacao de dados e estoque de produto | Publico | `{ name?, price?, stock? }` |
| `DELETE` | `/api/products/:id` | Remocao de produto do catalogo | Publico | `id` (UUID) |
| `POST` | `/api/sales` | Registro de venda com baixa atomica de estoque | Publico | `{ items: [{ productId, quantity }] }` |
| `GET` | `/api/reports/daily` | Relatorio consolidado de vendas do dia | Publico | `?date=YYYY-MM-DD` |
| `GET` | `/api/reports/monthly` | Relatorio consolidado de receita mensal | Publico | `?year=YYYY&month=MM` |
