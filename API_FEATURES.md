# 🚀 Trace Company API - Funcionalidades

## Visão Geral

A **Trace Company API** é uma solução completa para captura e gerenciamento de leads com autenticação JWT integrada.

---

## 🔐 Autenticação JWT

### Registro de Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha-segura",
  "name": "Nome do Usuário"
}
```

**Resposta (201 Created):**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "id": "uuid-do-usuario",
    "email": "usuario@example.com",
    "name": "Nome do Usuário",
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "senha-segura"
}
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "id": "uuid-do-usuario",
    "email": "usuario@example.com",
    "name": "Nome do Usuário",
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 📝 Gerenciamento de Leads

### ✅ Criar Lead
```http
POST /api/leads
Authorization: Bearer <token>
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

### 📋 Listar Leads (Endpoint Original)
```http
GET /api/leads?limit=10&offset=0
Authorization: Bearer <token>
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

### 🆕 Obter Leads (Novo Endpoint)
```http
GET /api/get-leads?limit=10&offset=0
Authorization: Bearer <token>
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

### 🔍 Buscar Lead por ID
```http
GET /api/leads/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
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

### ✏️ Atualizar Lead
```http
PUT /api/leads/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
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

### 🗑️ Deletar Lead
```http
DELETE /api/leads/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Resposta (200 OK):**
```json
{
  "success": true,
  "message": "Lead deletado com sucesso"
}
```

---

## 🔒 Segurança

- ✅ Todas as rotas de leads requerem autenticação JWT
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Tokens JWT com expiração de 24h
- ✅ CORS configurável por origem
- ✅ Validação rigorosa de entrada com Zod
- ✅ Row Level Security (RLS) no Supabase

---

## 📊 Headers Obrigatórios

Para acessar qualquer endpoint de leads, inclua:

```http
Authorization: Bearer <seu-token-jwt>
Content-Type: application/json
```

---

## ⚠️ Códigos de Erro

| Código | Mensagem | Causa |
|--------|----------|-------|
| 400 | Email já cadastrado | Email duplicado no registro |
| 400 | Email, senha e nome são obrigatórios | Campos faltando no registro |
| 400 | Email e senha são obrigatórios | Campos faltando no login |
| 401 | Email ou senha inválidos | Credenciais incorretas |
| 401 | Usuário inativo | Usuário desativado |
| 401 | Token não fornecido | Header Authorization ausente |
| 401 | Token inválido ou expirado | Token JWT inválido ou expirado |
| 401 | Formato de token inválido | Header Authorization mal formatado |
| 404 | Lead não encontrado | ID do lead não existe |
| 500 | Erro ao processar requisição | Erro interno do servidor |

---

## 🧪 Exemplo de Uso com cURL

### Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "AdminTrace@2026",
    "name": "ricardo"
  }'
```

### Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@admin.com",
    "password": "AdminTrace@2026"
  }'
```

### Criar Lead
```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "whatsapp": "5511987654321",
    "instagram": "joao.silva"
  }'
```

### Listar Leads (Endpoint Original)
```bash
curl -X GET "http://localhost:3000/api/leads?limit=10&offset=0" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Obter Leads (Novo Endpoint)
```bash
curl -X GET "http://localhost:3000/api/get-leads?limit=10&offset=0" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Buscar Lead por ID
```bash
curl -X GET http://localhost:3000/api/leads/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Atualizar Lead
```bash
curl -X PUT http://localhost:3000/api/leads/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "instagram": "joao.silva.fit"
  }'
```

### Deletar Lead
```bash
curl -X DELETE http://localhost:3000/api/leads/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📚 Endpoints Resumo

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/api/auth/register` | ❌ | Registrar novo usuário |
| POST | `/api/auth/login` | ❌ | Fazer login e obter token |
| POST | `/api/leads` | ✅ | Criar novo lead |
| GET | `/api/leads` | ✅ | Listar leads com paginação |
| GET | `/api/get-leads` | ✅ | Obter leads com paginação (novo) |
| GET | `/api/leads/:id` | ✅ | Buscar lead por ID |
| PUT | `/api/leads/:id` | ✅ | Atualizar lead |
| DELETE | `/api/leads/:id` | ✅ | Deletar lead |

---

## 🚀 Deploy

A API está pronta para deploy na Vercel com suporte a:
- ✅ Serverless Functions
- ✅ Variáveis de Ambiente
- ✅ Supabase PostgreSQL
- ✅ CORS configurável
- ✅ Autenticação JWT

Configure as variáveis de ambiente na Vercel:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
CORS_ORIGIN=https://seu-dominio.com
JWT_SECRET=sua-chave-secreta-segura
JWT_EXPIRATION=24h
```

---

**Desenvolvido com ❤️ pela Trace Company**
