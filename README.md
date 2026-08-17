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

## 5. Guia Completo de Reprodução Passo a Passo

Este guia foi elaborado para que qualquer pessoa, mesmo sem experiência prévia no projeto, consiga clonar, configurar e executar a aplicação do zero.

### 5.1 Pré-requisitos Obrigatórios

Antes de iniciar, certifique-se de ter instalado em seu computador:

1. **Node.js** (versão 20 LTS ou superior): [nodejs.org](https://nodejs.org/)
   - Para verificar no terminal: `node -v` (deve retornar `v20.x.x` ou superior)
2. **Docker Desktop** (com Docker Compose habilitado): [docker.com](https://www.docker.com/products/docker-desktop/)
   - Para verificar no terminal: `docker compose version`
3. **Git**: [git-scm.com](https://git-scm.com/)
   - Para verificar no terminal: `git --version`

---

### 5.2 Passo 1: Clonar o Repositório

Abra o seu terminal (Bash, Zsh ou PowerShell) e execute:

```bash
git clone https://github.com/niqueborges/app-padaria.git
cd app-padaria
```

---

### 5.3 Passo 2: Instalar as Dependências

Instale os pacotes do backend (raiz) e do frontend:

```bash
# 1. Instala as dependências da API Backend na raiz
npm install

# 2. Instala as dependências da Interface Frontend
cd frontend
npm install
cd ..
```

---

### 5.4 Passo 3: Configurar as Variáveis de Ambiente

Copie o arquivo de exemplo para criar o seu arquivo `.env` local:

- **No Linux / macOS / Git Bash**:
  ```bash
  cp .env.example .env
  ```
- **No Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **No Windows (Prompt de Comando - CMD)**:
  ```cmd
  copy .env.example .env
  ```

> O arquivo `.env` já vem pré-configurado com as credenciais padrão do banco local e chave JWT de desenvolvimento. Nenhuma alteração manual é necessária para rodar localmente.

---

### 5.5 Passo 4: Subir o Banco de Dados PostgreSQL

Certifique-se de que o **Docker Desktop** está aberto e em execução. Em seguida, inicie o container do PostgreSQL:

```bash
docker compose up -d db
```

> **Verificação**: Execute `docker compose ps`. O serviço `db` deve aparecer com status `running (healthy)`.

---

### 5.6 Passo 5: Executar as Migrações e o Povoamento Inicial (Seed)

Execute as migrações para criar as tabelas no banco de dados e insira os dados iniciais do Pedro e da Maria:

```bash
# Cria as tabelas users, products, sales e sale_items
npm run prisma:migrate

# Popula o banco com os operadores e o catálogo inicial de pães e cafés
npm run prisma:seed
```

**Credenciais cadastradas automaticamente:**
- **Pedro (Dono)**: `pedro@padaria.com` | Senha: `padaria123`
- **Maria (Esposa)**: `maria@padaria.com` | Senha: `maria123`

---

## 6. Como Executar a Aplicação

### Opção A: Modo Desenvolvimento (Recomendado para Testar)

Neste modo, você roda o backend e o frontend com recarregamento automático a cada alteração de código.

1. **Terminal 1 (Backend API)**:
   ```bash
   npm run dev
   ```
   *Saída esperada:* `[INFO] Servidor rodando na porta 3000`

2. **Terminal 2 (Frontend React)**:
   ```bash
   npm run dev:frontend
   ```
   *Saída esperada:* `VITE v8.x.x ready in ... ms -> Local: http://localhost:5173/`

**Acessos disponíveis:**
- **Sistema Web (PDV & Gestão)**: [http://localhost:5173](http://localhost:5173)
  *(Dica: Na tela de login, clique no botão de atalho "Pedro (Dono)" para entrar imediatamente sem precisar digitar!)*
- **Documentação Interativa Swagger**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Healthcheck**: [http://localhost:3000/health](http://localhost:3000/health)

---

### Opção B: Modo Produção Unificado (Single Host)

Compila o frontend e o backend em arquivos otimizados e roda tudo em uma única porta (`3000`):

```bash
# 1. Compila o TypeScript e o bundle do React
npm run build:all

# 2. Inicia o servidor unificado
npm start
```
- Acesse todo o sistema (API + SPA) em: [http://localhost:3000](http://localhost:3000)

---

### Opção C: Execução 100% em Containers Docker

Caso queira subir o banco, a API e o frontend já empacotados em containers isolados:

```bash
docker compose up --build -d
```
- Acesse: [http://localhost:3000](http://localhost:3000)

---

## 7. Testes Automatizados e Qualidade de Código

Para validar que todo o sistema está funcionando e que todas as regras de negócio estão íntegras:

```bash
# Executa a suíte de 41 testes unitários com Jest
npm test

# Executa os testes com relatório detalhado de cobertura
npm run test:coverage

# Executa o linter ESLint para checar padrões de código
npm run lint

# Verifica a formatação do código com Prettier
npm run format:check
```

---

## 8. Documentação dos Endpoints REST

A documentação interativa com Swagger UI está disponível em `http://localhost:3000/api-docs`. Resumo dos principais endpoints:

| Método | Endpoint | Descrição | Autenticação | Payload / Parâmetros |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Verificação de saúde da aplicação | Público | - |
| `POST` | `/api/auth/login` | Autenticação de operador e emissão de JWT | Público | `{ "email": "...", "password": "..." }` |
| `GET` | `/api/auth/me` | Dados do operador autenticado | Bearer JWT | Header `Authorization: Bearer <token>` |
| `GET` | `/api/products` | Listagem de todos os produtos do catálogo | Público | - |
| `GET` | `/api/products/:id` | Consulta detalhada de produto por ID | Público | Parâmetro na URL `id` (UUID) |
| `POST` | `/api/products` | Cadastro de novo produto | Público | `{ "name": "...", "price": 0.0, "stock": 0 }` |
| `PUT` | `/api/products/:id` | Atualização de produto e estoque | Público | `{ "name"?: "...", "price"?: 0.0, "stock"?: 0 }` |
| `DELETE` | `/api/products/:id` | Remoção de produto do catálogo | Público | Parâmetro na URL `id` (UUID) |
| `POST` | `/api/sales` | Registro de venda com baixa atômica de estoque | Público | `{ "items": [{ "productId": "...", "quantity": 1 }] }` |
| `GET` | `/api/reports/daily` | Relatório consolidado de vendas do dia | Público | `?date=YYYY-MM-DD` |
| `GET` | `/api/reports/monthly` | Relatório consolidado de receita mensal | Público | `?year=YYYY&month=MM` |

---

## 9. Resolução de Dúvidas e Problemas Frequentes (Troubleshooting)

### O comando `docker compose up -d db` dá erro de conexão
- **Causa**: O aplicativo Docker Desktop não está aberto.
- **Solução**: Abra o Docker Desktop no seu computador, aguarde ele inicializar (ícone verde de status) e rode o comando novamente.

### Erro: `Port 5432 is already in use`
- **Causa**: Você já possui uma instância do PostgreSQL instalada diretamente no seu sistema operacional rodando na porta 5432.
- **Solução**: Pare o serviço do PostgreSQL local antes de rodar o Docker Compose, ou altere a porta mapeada em `docker-compose.yml` (ex: `"5433:5432"`) e atualize o `DATABASE_URL` no arquivo `.env`.

### Erro: `Cannot find module '../../generated/prisma/client.js'`
- **Causa**: Os tipos do Prisma Client ainda não foram gerados no ambiente local.
- **Solução**: Execute `npx prisma generate` no terminal.
