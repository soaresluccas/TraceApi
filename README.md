# 🚀 Trace Company API

> **RESTful API para captura de leads de Landing Page de Consultoria Fitness**

[![Node.js](https://img.shields.io/badge/Node.js-20+-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Swagger](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white)](https://swagger.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📋 Sobre

A **Trace Company API** é uma solução completa para captura e gerenciamento de leads de landing pages de consultoria fitness. Desenvolvida seguindo os princípios de **Domain-Driven Design (DDD)**, a API oferece uma arquitetura robusta, escalável e bem documentada.

### ✨ Características Principais

- ✅ **API RESTful Completa** - CRUD completo para leads
- ✅ **Arquitetura DDD** - Separação clara de responsabilidades
- ✅ **TypeScript** - Tipagem estática para maior segurança
- ✅ **Documentação Swagger/OpenAPI** - API auto-documentada
- ✅ **Validação com Zod** - Schemas robustos de validação
- ✅ **Supabase/PostgreSQL** - Banco de dados gerenciado
- ✅ **Ready para Vercel** - Deploy serverless plug-and-play
- ✅ **CORS Configurável** - Segurança cross-origin
- ✅ **Injeção de Dependência** - Código desacoplado e testável

---


## 📦 Tecnologias

| Tecnologia | Versão | Descrição |
|-----------|--------|----------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Express** | 4.18+ | Framework Web |
| **TypeScript** | 5.2+ | Linguagem tipada |
| **Supabase** | 2.38+ | Backend PostgreSQL |
| **Zod** | 3.22+ | Validação de schemas |
| **Swagger** | 5.0+ | Documentação API |
| **CORS** | 2.8+ | Segurança cross-origin |

---

## 🚀 Primeiros Passos

### ✅ Pré-requisitos

- Node.js 20+ instalado
- npm ou yarn
- Conta no [Supabase](https://supabase.com)
- Git

### 📥 Instalação

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd TraceApi
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```

4. **Preencha as variáveis no arquivo `.env`**
   ```env
   PORT=3000
   NODE_ENV=development
   
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_ANON_KEY=sua-chave-anonima
   
   CORS_ORIGIN=http://localhost:3000
   ```

### 💻 Rodando Localmente

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

O servidor estará disponível em: **http://localhost:3000**

---

## 📚 Documentação Swagger

Após iniciar o servidor, acesse a documentação interativa:

```
http://localhost:3000/api-docs
```

Lá você pode:
- 📖 Visualizar todas as rotas e seus parâmetros
- 🧪 Testar endpoints diretamente
- 📋 Ver exemplos de requisição/resposta

---

## 🔌 Endpoints da API

### Base URL
```
http://localhost:3000/api
```

### 📝 Criar Lead (POST)
Captura um novo lead do formulário.

```http
POST /api/leads
Content-Type: application/json

{
  "name": "João Silva",
  "whatsapp": "5511987654321",
  "instagram": "joao.silva",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "fitness_consultoria",
  "utm_content": "anuncio_1",
  "utm_term": "consultoria fitness"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Lead criado com sucesso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "whatsapp": "5511987654321",
    "instagram": "joao.silva",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "fitness_consultoria",
    "utm_content": "anuncio_1",
    "utm_term": "consultoria fitness",
    "created_at": "2024-04-30T08:46:47.834Z",
    "updated_at": "2024-04-30T08:46:47.834Z"
  }
}
```

---

### 📋 Listar Leads (GET)
Recupera todos os leads com paginação.

```http
GET /api/leads?limit=10&offset=0
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "whatsapp": "5511987654321",
      "instagram": "joao.silva",
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "fitness_consultoria",
      "utm_content": "anuncio_1",
      "utm_term": "consultoria fitness",
      "created_at": "2024-04-30T08:46:47.834Z",
      "updated_at": "2024-04-30T08:46:47.834Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "pages": 5
  }
}
```

**Parâmetros de Query:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|----------|
| `limit` | integer | 10 | Máximo de resultados (1-100) |
| `offset` | integer | 0 | Número de resultados a pular |

---

### 🔍 Buscar Lead por ID (GET)
Recupera um lead específico.

```http
GET /api/leads/550e8400-e29b-41d4-a716-446655440000
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "whatsapp": "5511987654321",
    "instagram": "joao.silva",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "fitness_consultoria",
    "utm_content": "anuncio_1",
    "utm_term": "consultoria fitness",
    "created_at": "2024-04-30T08:46:47.834Z",
    "updated_at": "2024-04-30T08:46:47.834Z"
  }
}
```

---

### ✏️ Atualizar Lead (PUT)
Atualiza dados de um lead existente.

```http
PUT /api/leads/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "instagram": "joao.silva.fit"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Lead atualizado com sucesso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "whatsapp": "5511987654321",
    "instagram": "joao.silva.fit",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "fitness_consultoria",
    "utm_content": "anuncio_1",
    "utm_term": "consultoria fitness",
    "created_at": "2024-04-30T08:46:47.834Z",
    "updated_at": "2024-04-30T11:22:15.123Z"
  }
}
```

---

### 🗑️ Deletar Lead (DELETE)
Remove um lead do sistema.

```http
DELETE /api/leads/550e8400-e29b-41d4-a716-446655440000
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Lead deletado com sucesso"
}
```

---

## 🗄️ Setup do Banco de Dados (Supabase)

### 1. Criar Projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Copie `SUPABASE_URL` e `SUPABASE_ANON_KEY`

### 2. Criar Tabela `leads`

Na seção **SQL Editor** do Supabase, execute:

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  instagram TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice para melhor performance
CREATE INDEX leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX leads_whatsapp_idx ON leads(whatsapp);

-- Habilitar Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (se necessário)
CREATE POLICY "Enable read access for all users" ON leads
  FOR SELECT USING (true);

-- Política para insert (leads são sempre criados)
CREATE POLICY "Enable insert for all users" ON leads
  FOR INSERT WITH CHECK (true);
```

---

## 🌐 Deploy na Vercel

### 1. Prepare o Projeto
```bash
npm run build
```

### 2. Push para GitHub
```bash
git push origin main
```

### 3. Conecte à Vercel
- Acesse [vercel.com](https://vercel.com)
- Clique em "New Project"
- Selecione seu repositório GitHub
- Configure as variáveis de ambiente

### 4. Configure Environment Variables
Na seção **Settings → Environment Variables** da Vercel, adicione:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
CORS_ORIGIN=https://seu-dominio.com
NODE_ENV=production
```

### 5. Deploy
Clique em "Deploy" e aguarde a conclusão. Sua API estará live em:
```
https://seu-projeto.vercel.app/api/leads
```

---

## ✅ Validações

### Nome
- ✅ Mínimo 2 caracteres
- ✅ Campo obrigatório

### WhatsApp
- ✅ 10 a 15 dígitos
- ✅ Apenas números
- ✅ Campo obrigatório

### Instagram
- ✅ Qualquer string válida
- ✅ Campo opcional

### Parâmetros UTM
- ✅ Todos opcionais
- ✅ Rastreamento de origem, meio, campanha, conteúdo e termo

---

## 🛠️ Desenvolvimento

### Adicionar Novo Endpoint

1. **Criar Use Case** (`src/application/use-cases/`)
   ```typescript
   export class MyUseCase {
     constructor(private readonly repository: ILeadRepository) {}
     async execute(input: Input): Promise<Output> { }
   }
   ```

2. **Adicionar ao Controller** (`src/presentation/controllers/LeadController.ts`)
   ```typescript
   async myMethod(req: Request, res: Response): Promise<void> {
     const result = await this.myUseCase.execute(req.body);
     res.json({ success: true, data: result });
   }
   ```

3. **Registrar na Rota** (`src/presentation/routes/lead.ts`)
   ```typescript
   router.post('/my-route', (req, res) => controller.myMethod(req, res));
   ```

4. **Documentar no Swagger** (`src/docs/swagger.ts`)

---

## 📊 Estrutura de Resposta

### Sucesso
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { }
}
```

### Erro
```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

---

## 🔒 Segurança

- ✅ CORS configurável
- ✅ Validação rigorosa com Zod
- ✅ Variáveis de ambiente protegidas
- ✅ Tipagem estática TypeScript
- ✅ Row Level Security no Supabase

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Suporte

Para dúvidas ou sugestões:
- 📧 Email: dev@trace.company
- 🌐 Website: https://trace.company
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/trace-api/issues)

---

## 🙏 Agradecimentos

- [Vercel](https://vercel.com) - Hosting
- [Supabase](https://supabase.com) - Database
- [Express.js](https://expressjs.com) - Web Framework
- [TypeScript](https://www.typescriptlang.org) - Type Safety

---

**Desenvolvido com ❤️ pela Trace Company**

> Última atualização: 2024-04-30
