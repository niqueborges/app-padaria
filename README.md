# Padaria do Pedro - Sistema de Gestão Comercial e Ponto de Venda

Sistema de gestão de produtos, controle transacional de vendas com baixa automática de estoque, relatórios financeiros consolidados e interface de ponto de venda (PDV). Desenvolvido com Clean Architecture, TypeScript estrito, Prisma ORM v7, PostgreSQL e React + Vite.

---

## 1. Contexto e Problema de Negócio

O estabelecimento operava com anotações manuais em papel para registrar as vendas do dia, controle visual de estoque e ausência de consolidação financeira. Esse modelo gerava três gargalos operacionais principais:

1. **Divergência de Estoque**: Ausência de baixa atômica no momento da venda, resultando em indisponibilidade de itens sem aviso prévio.
2. **Incerteza Financeira**: Dificuldade em apurar o faturamento real diário e mensal de forma confiável e automatizada.
3. **Falta de Segurança Operacional**: Ausência de autenticação e identificação dos operadores responsáveis pelas vendas no caixa (Pedro e Maria).

---

## 2. Solução Implementada

Desenvolveu-se uma solução integrada composta por:

- **Backend RESTful**: Desenvolvido sob os princípios da Clean Architecture e SOLID, desacoplando regras de negócio puras da camada de persistência e do protocolo HTTP.
- **Transações Atômicas**: Baixa automática e concorrente de estoque via transação no banco de dados (`prisma.$transaction`) no momento exato da conclusão da venda.
- **Módulo de Relatórios**: Agregação sob demanda de faturamento diário por data e receita mensal por ano e mês.
- **Autenticação JWT e Hashing Bcrypt**: Controle de acesso seguro para os operadores cadastrados com expiração configurável.
- **Frontend SPA**: Ponto de Venda (PDV) ágil com comanda virtual, catálogo de produtos com status de estoque em tempo real e dashboard de indicadores financeiros.
- **Conteinerização Multi-Stage**: Build unificado de produção que serve tanto a API quanto a interface web em uma única porta, com usuário sem privilégios de root.

---

## 3. Arquitetura e Decisões de Design

A estrutura do projeto segue estritamente a separação de responsabilidades em 4 camadas fundamentais:

```
src/
├── domain/                     # Camada de Domínio: Entidades puras e classes de erro de negócio
│   ├── entities/               # Product, Sale, SaleItem, User
│   └── errors/                 # AppError, NotFoundError, ConflictError, ValidationError, UnauthorizedError
├── application/                # Camada de Aplicação: Orquestração de casos de uso e contratos
│   ├── services/               # ProductService, SaleService, ReportService, AuthService
│   ├── dto/                    # Schemas de validação Zod e tipagens inferidas
│   └── ports/                  # Interfaces/Portas dos Repositórios (DIP)
├── infrastructure/             # Camada de Infraestrutura: Detalhes técnicos concretos
│   ├── database/               # PrismaClient, Driver Adapter PG (@prisma/adapter-pg), Repositórios
│   ├── http/                   # Controllers, rotas Express e documentação Swagger JSDoc
│   └── middleware/             # Request Logger (Pino), Error Handler global, AuthMiddleware
├── shared/                     # Módulos transversais (Logger estruturado, helpers)
frontend/                       # Aplicação React + Vite + TypeScript (PDV, Estoque, Relatórios)
Dockerfile                      # Build multi-estágio (Frontend Builder, Backend Builder, Runner)
docker-compose.yml              # Orquestração local de serviços (API + PostgreSQL)
```

### Principais Decisões Arquiteturais

- **Inversão de Dependência (DIP)**: Os serviços de aplicação dependem exclusivamente de interfaces (`UserRepositoryPort`, `ProductRepositoryPort`, `SaleRepositoryPort`). Nenhuma regra de negócio depende diretamente do Prisma ou do Express.
- **Imutabilidade e Tipagem Estrita**: TypeScript configurado em modo ESM nativo (`NodeNext`), sem uso de `any`, com esquemas Zod garantindo a sanitização e validação na borda da aplicação.
- **Observabilidade Estruturada**: Logger Pino assíncrono gerando saída em JSON com correlação por identificador único de requisição (`x-request-id`) e medição de latência.
- **Segurança Defensiva**: Aplicação de Helmet para cabeçalhos HTTP, Rate Limiting para mitigação de força bruta e usuário `USER node` em ambiente Docker.

---

## 4. Stack Tecnológica e Justificativas

| Camada / Ferramenta | Tecnologia | Justificativa Técnica |
| :--- | :--- | :--- |
| **Linguagem** | TypeScript 6 (Node.js 20+) | Segurança de tipos em tempo de compilação, redução de falhas em runtime e suporte a ESM nativo. |
| **Framework Web** | Express.js 4 | Minimalista, baixo overhead, previsibilidade e facilidade de integração com middlewares customizados. |
| **ORM & Database** | Prisma 7 + PostgreSQL 16 | Type-safety de ponta a ponta, migrations declarativas, pool de conexão via Driver Adapter (`@prisma/adapter-pg`). |
| **Validação de Esquemas**| Zod 4 | Validação declarativa com inferência automática de tipos TypeScript e mensagens de erro estruturadas. |
| **Segurança & Criptografia** | Bcrypt + JsonWebToken (JWT) | Hash adaptativo com salt rounds para senhas e emissão de tokens de autenticação stateless para os operadores. |
| **Observabilidade** | Pino | Logger estruturado em JSON com baixíssimo custo de CPU, ideal para agregação em ferramentas de log modernas. |
| **Frontend** | React 18 + Vite + TypeScript | Renderização reativa veloz, consumo direto da API com Axios e design system customizado em CSS. |
| **Qualidade & Testes** | Jest + ESLint v10 + Prettier + Husky | Pipeline de qualidade automatizada com validação de commits semânticos (Conventional Commits) e suítes unitárias. |
| **Conteinerização** | Docker (Multi-stage) | Padronização de ambiente, isolamento de dependências de build e imagens finais compactas baseadas em Alpine Linux. |

---

## 5. Guia de Reprodução Local

### 5.1 Pré-requisitos

- **Node.js**: Versão 20.x ou superior.
- **Docker e Docker Compose**: Instalados e em execução.
- **Git**: Para clonagem do repositório.

### 5.2 Passo a Passo de Instalação

1. **Clonar o Repositório**:
```bash
git clone https://github.com/niqueborges/app-padaria.git
cd app-padaria
```

2. **Instalar Dependências do Backend e Frontend**:
```bash
# Dependências da API (backend)
npm install

# Dependências da interface (frontend)
cd frontend
npm install
cd ..
```

3. **Configurar as Variáveis de Ambiente**:
```bash
# Copiar arquivo de exemplo para o .env local
cp .env.example .env
```

Conteúdo padrão do `.env`:
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

5. **Executar Migrações e Povoamento Inicial (Seed)**:
```bash
# Aplicar schema no banco de dados
npm run prisma:migrate

# Executar seed com usuários (Pedro e Maria) e catálogo inicial de produtos
npm run prisma:seed
```

Credenciais criadas no Seed:
- **Pedro (Dono)**: `pedro@padaria.com` | Senha: `padaria123`
- **Maria (Esposa)**: `maria@padaria.com` | Senha: `maria123`

---

## 6. Execução da Aplicação

### Modo Desenvolvimento (Backend + Frontend Separados)

Em um terminal, inicie a API:
```bash
npm run dev
```

Em outro terminal, inicie a aplicação web:
```bash
npm run dev:frontend
```
- Interface Web: `http://localhost:5173`
- API Backend: `http://localhost:3000`
- Documentação Swagger: `http://localhost:3000/api-docs`

---

### Modo Produção (Build Unificado)

Para compilar o backend e o frontend simultaneamente e executar em modo integrado:
```bash
# Compila o backend e o bundle do frontend
npm run build:all

# Inicia o servidor Node servindo a API e a SPA na porta 3000
npm start
```
- Acesso completo: `http://localhost:3000`

---

### Execução Completa via Docker Compose

```bash
# Constrói as imagens multi-stage e sobe todos os serviços
docker compose up --build -d
```

---

## 7. Testes e Qualidade de Código

### Executar Testes Unitários
```bash
npm test
```

### Executar Testes com Relatório de Cobertura
```bash
npm run test:coverage
```

### Validar Padrões de Código com ESLint
```bash
npm run lint
```

### Validar Formatação com Prettier
```bash
npm run format:check
```

---

## 8. Documentação dos Endpoints REST

A documentação OpenAPI interativa completa está disponível em `http://localhost:3000/api-docs`. Abaixo, o resumo dos endpoints principais:

| Método | Endpoint | Descrição | Autenticação | Payload / Parâmetros |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Verificação de saúde da aplicação | Público | - |
| `POST` | `/api/auth/login` | Autenticação de operador e emissão de JWT | Público | `{ email, password }` |
| `GET` | `/api/auth/me` | Dados do operador autenticado | Bearer JWT | - |
| `GET` | `/api/products` | Listagem de todos os produtos do catálogo | Público | - |
| `GET` | `/api/products/:id` | Consulta detalhada de produto por ID | Público | `id` (UUID) |
| `POST` | `/api/products` | Cadastro de novo produto | Público | `{ name, price, stock }` |
| `PUT` | `/api/products/:id` | Atualização de dados e estoque de produto | Público | `{ name?, price?, stock? }` |
| `DELETE` | `/api/products/:id` | Remoção de produto do catálogo | Público | `id` (UUID) |
| `POST` | `/api/sales` | Registro de venda com baixa atômica de estoque | Público | `{ items: [{ productId, quantity }] }` |
| `GET` | `/api/reports/daily` | Relatório consolidado de vendas do dia | Público | `?date=YYYY-MM-DD` |
| `GET` | `/api/reports/monthly` | Relatório consolidado de receita mensal | Público | `?year=YYYY&month=MM` |
