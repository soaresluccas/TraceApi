# Exemplo de como testar a API localmente
# Execute: npm run dev

# POST - Criar novo lead
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "whatsapp": "5511987654321",
    "instagram": "joao.silva",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "fitness_consultoria",
    "utm_content": "anuncio_1",
    "utm_term": "consultoria fitness"
  }'

# GET - Listar todos os leads
curl http://localhost:3000/api/leads?limit=10&offset=0

# GET - Buscar lead por ID
curl http://localhost:3000/api/leads/{id}

# PUT - Atualizar lead
curl -X PUT http://localhost:3000/api/leads/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "instagram": "joao.silva.fit"
  }'

# DELETE - Deletar lead
curl -X DELETE http://localhost:3000/api/leads/{id}

# Health check
curl http://localhost:3000/health

# Home endpoint
curl http://localhost:3000/

# Acessar Swagger
# http://localhost:3000/api-docs
