const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Trace Company API',
    description: 'RESTful API para captura de leads de Landing Page de Consultoria Fitness',
    version: '1.0.0',
    contact: {
      name: 'Trace Company',
      url: 'https://trace.company',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
    {
      url: 'https://api.trace.company',
      description: 'Production Server',
    },
  ],
  paths: {
    '/api/leads': {
      post: {
        summary: 'Criar novo lead',
        description: 'Cria um novo lead com dados do formulário da landing page',
        tags: ['Leads'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateLeadRequest',
              },
              example: {
                name: 'João Silva',
                whatsapp: '5511987654321',
                instagram: 'joao.silva',
                utm_source: 'google',
                utm_medium: 'cpc',
                utm_campaign: 'fitness_consultoria',
                utm_content: 'ad_1',
                utm_term: 'consultoria fitness',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Lead criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LeadResponse',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      get: {
        summary: 'Listar todos os leads',
        description: 'Lista todos os leads com paginação',
        tags: ['Leads'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Número máximo de leads a retornar',
            schema: {
              type: 'integer',
              default: 10,
              minimum: 1,
              maximum: 100,
            },
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Número de leads a pular',
            schema: {
              type: 'integer',
              default: 0,
              minimum: 0,
            },
          },
          {
            name: 'not_in_crm',
            in: 'query',
            description: 'Se true, retorna apenas leads que não estão no CRM',
            schema: {
              type: 'string',
              enum: ['true', 'false'],
              default: 'false',
            },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Termo de busca (name, instagram, whatsapp) — usado com not_in_crm=true',
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          200: {
            description: 'Lista de leads',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ListLeadsResponse',
                },
              },
            },
          },
          500: {
            description: 'Erro no servidor',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/leads/control': {
      get: {
        summary: 'Listar leads com colunas de controle',
        description: 'Lista leads com campos de controle (curva_abc, respondeu, reuniao_agendada, etc)',
        tags: ['Leads'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0, minimum: 0 },
          },
        ],
        responses: {
          200: {
            description: 'Lista de leads com colunas de controle',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListLeadsControlResponse' },
              },
            },
          },
          500: {
            description: 'Erro no servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/leads/get-leads': {
      get: {
        summary: 'Listar todos os leads (alias)',
        description: 'Lista todos os leads com paginação (mesmo comportamento do GET /api/leads)',
        tags: ['Leads'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0, minimum: 0 },
          },
        ],
        responses: {
          200: {
            description: 'Lista de leads',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListLeadsResponse' },
              },
            },
          },
          500: {
            description: 'Erro no servidor',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/crm/stages': {
      get: {
        summary: 'Listar fases do CRM',
        description: 'Retorna todas as fases (colunas) do funil ordenadas por position',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de fases',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ListStagesResponse' },
              },
            },
          },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/board': {
      get: {
        summary: 'Obter board completo',
        description: 'Retorna o board com stages, cards e dados do lead agrupados',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Board do CRM',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BoardResponse' },
              },
            },
          },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/cards': {
      post: {
        summary: 'Criar card no CRM',
        description: 'Adiciona um lead ao funil. Se stage_id omitido, usa a fase "qualificar"',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCardRequest' },
              example: { lead_id: '550e8400-e29b-41d4-a716-446655440000', priority: 'Normal' },
            },
          },
        },
        responses: {
          201: { description: 'Card criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/CardResponse' } } } },
          400: { description: 'Referência inválida (stage_id ou lead_id)', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          409: { description: 'Lead já possui card no CRM', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/cards/reorder': {
      patch: {
        summary: 'Reordenar cards dentro de uma fase',
        description: 'Atualiza a position de um card dentro da mesma fase. Reindexa automaticamente se gap < 1',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReorderCardsRequest' },
              example: { stage_id: '550e8400-e29b-41d4-a716-446655440000', card_id: '660e8400-e29b-41d4-a716-446655440000', new_position: 150 },
            },
          },
        },
        responses: {
          200: { description: 'Cards reordenados', content: { 'application/json': { schema: { $ref: '#/components/schemas/ListCardsResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/cards/{id}/move': {
      patch: {
        summary: 'Mover card entre fases',
        description: 'Move um card para outra fase. Se position omitido, coloca no final',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID do card', schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MoveCardRequest' },
              example: { stage_id: '770e8400-e29b-41d4-a716-446655440000' },
            },
          },
        },
        responses: {
          200: { description: 'Card movido', content: { 'application/json': { schema: { $ref: '#/components/schemas/CardResponse' } } } },
          404: { description: 'Card não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/cards/{id}': {
      get: {
        summary: 'Obter detalhes do card',
        description: 'Retorna os detalhes do card + dados do lead',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID do card', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Detalhes do card', content: { 'application/json': { schema: { $ref: '#/components/schemas/CardDetailResponse' } } } },
          404: { description: 'Card não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      patch: {
        summary: 'Atualizar dados do card',
        description: 'Atualiza priority e/ou assigned_to sem mudar de fase',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID do card', schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCardRequest' },
              example: { priority: 'Alta', assigned_to: 'user@example.com' },
            },
          },
        },
        responses: {
          200: { description: 'Card atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/CardResponse' } } } },
          404: { description: 'Card não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
      delete: {
        summary: 'Remover card do CRM',
        description: 'Remove o card do funil (não deleta o lead)',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID do card', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Card removido', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, message: { type: 'string' } } } } } },
          404: { description: 'Card não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/cards/{id}/history': {
      get: {
        summary: 'Histórico de movimentação do card',
        description: 'Retorna o histórico de mudanças de fase do card',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, description: 'ID do card', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Histórico do card', content: { 'application/json': { schema: { $ref: '#/components/schemas/CardHistoryResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/metrics/funnel': {
      get: {
        summary: 'Métricas do funil',
        description: 'Retorna contagem de leads por etapa do funil',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Métricas do funil', content: { 'application/json': { schema: { $ref: '#/components/schemas/FunnelMetricsResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/crm/metrics/tempo-medio': {
      get: {
        summary: 'Tempo médio por etapa',
        description: 'Retorna o tempo médio (em horas) que os leads passam em cada fase',
        tags: ['CRM'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Tempo médio por etapa', content: { 'application/json': { schema: { $ref: '#/components/schemas/TempoMedioResponse' } } } },
          500: { description: 'Erro no servidor', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/leads/{id}': {
      get: {
        summary: 'Buscar lead por ID',
        description: 'Retorna os detalhes de um lead específico',
        tags: ['Leads'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do lead',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Lead encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LeadResponse',
                },
              },
            },
          },
          404: {
            description: 'Lead não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      put: {
        summary: 'Atualizar lead',
        description: 'Atualiza os dados de um lead existente',
        tags: ['Leads'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do lead',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateLeadRequest',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Lead atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LeadResponse',
                },
              },
            },
          },
          404: {
            description: 'Lead não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Deletar lead',
        description: 'Remove um lead do sistema',
        tags: ['Leads'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID do lead',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Lead deletado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    message: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Lead não encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Lead: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único do lead',
          },
          name: {
            type: 'string',
            description: 'Nome completo do lead',
          },
          whatsapp: {
            type: 'string',
            description: 'Número de WhatsApp do lead',
          },
          instagram: {
            type: 'string',
            nullable: true,
            description: 'Handle do Instagram do lead',
          },
          utm_source: {
            type: 'string',
            nullable: true,
            description: 'Fonte UTM (google, facebook, etc)',
          },
          utm_medium: {
            type: 'string',
            nullable: true,
            description: 'Meio UTM (cpc, organic, etc)',
          },
          utm_campaign: {
            type: 'string',
            nullable: true,
            description: 'Campanha UTM',
          },
          utm_content: {
            type: 'string',
            nullable: true,
            description: 'Conteúdo UTM',
          },
          utm_term: {
            type: 'string',
            nullable: true,
            description: 'Termo UTM',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Data de criação do lead',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Data da última atualização',
          },
        },
        required: ['id', 'name', 'whatsapp', 'created_at', 'updated_at'],
      },
      CreateLeadRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            description: 'Nome completo do lead',
          },
          whatsapp: {
            type: 'string',
            pattern: '^\\d{10,15}$',
            description: 'Número de WhatsApp (10 a 15 dígitos)',
          },
          instagram: {
            type: 'string',
            description: 'Handle do Instagram (opcional)',
          },
          utm_source: {
            type: 'string',
            description: 'Fonte UTM (opcional)',
          },
          utm_medium: {
            type: 'string',
            description: 'Meio UTM (opcional)',
          },
          utm_campaign: {
            type: 'string',
            description: 'Campanha UTM (opcional)',
          },
          utm_content: {
            type: 'string',
            description: 'Conteúdo UTM (opcional)',
          },
          utm_term: {
            type: 'string',
            description: 'Termo UTM (opcional)',
          },
        },
        required: ['name', 'whatsapp'],
      },
      UpdateLeadRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            description: 'Nome completo do lead',
          },
          whatsapp: {
            type: 'string',
            pattern: '^\\d{10,15}$',
            description: 'Número de WhatsApp',
          },
          instagram: {
            type: 'string',
            description: 'Handle do Instagram',
          },
          utm_source: {
            type: 'string',
            description: 'Fonte UTM',
          },
          utm_medium: {
            type: 'string',
            description: 'Meio UTM',
          },
          utm_campaign: {
            type: 'string',
            description: 'Campanha UTM',
          },
          utm_content: {
            type: 'string',
            description: 'Conteúdo UTM',
          },
          utm_term: {
            type: 'string',
            description: 'Termo UTM',
          },
        },
      },
      LeadResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          message: {
            type: 'string',
          },
          data: {
            $ref: '#/components/schemas/Lead',
          },
        },
      },
      ListLeadsResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Lead',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              total: {
                type: 'integer',
              },
              limit: {
                type: 'integer',
              },
              offset: {
                type: 'integer',
              },
              pages: {
                type: 'integer',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
      LeadControl: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          instagram: { type: 'string', nullable: true },
          curva_abc: { type: 'string', nullable: true },
          respondeu: { type: 'integer', nullable: true },
          reuniao_agendada: { type: 'integer', nullable: true },
          reuniao_concluida: { type: 'integer', nullable: true },
          proposta_enviada: { type: 'integer', nullable: true },
          conversao: { type: 'integer', nullable: true },
          objecao: { type: 'integer', nullable: true },
        },
      },
      ListLeadsControlResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/LeadControl' } },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              limit: { type: 'integer' },
              offset: { type: 'integer' },
              pages: { type: 'integer' },
            },
          },
        },
      },
      CrmStage: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          position: { type: 'integer' },
          color: { type: 'string', nullable: true },
          is_closed: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'name', 'slug', 'position', 'is_closed', 'created_at'],
      },
      ListStagesResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/CrmStage' } },
        },
      },
      CrmCard: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          lead_id: { type: 'string', format: 'uuid' },
          stage_id: { type: 'string', format: 'uuid' },
          priority: { type: 'string', enum: ['Baixa', 'Normal', 'Alta', 'Urgente'], nullable: true },
          position: { type: 'integer' },
          assigned_to: { type: 'string', nullable: true },
          entered_stage_at: { type: 'string', format: 'date-time' },
          closed_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'lead_id', 'stage_id', 'position', 'entered_stage_at', 'created_at', 'updated_at'],
      },
      CardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/CrmCard' },
        },
      },
      ListCardsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/CrmCard' } },
        },
      },
      CardLead: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          whatsapp: { type: 'string' },
          instagram: { type: 'string', nullable: true },
          curva_abc: { type: 'string', nullable: true },
        },
      },
      CardDetail: {
        type: 'object',
        allOf: [
          { $ref: '#/components/schemas/CrmCard' },
          {
            type: 'object',
            properties: {
              lead: { $ref: '#/components/schemas/CardLead' },
            },
          },
        ],
      },
      CardDetailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: '#/components/schemas/CardDetail' },
        },
      },
      BoardCard: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          lead_id: { type: 'string', format: 'uuid' },
          stage_id: { type: 'string', format: 'uuid' },
          priority: { type: 'string', enum: ['Baixa', 'Normal', 'Alta', 'Urgente'], nullable: true },
          position: { type: 'integer' },
          assigned_to: { type: 'string', nullable: true },
          entered_stage_at: { type: 'string', format: 'date-time' },
          closed_at: { type: 'string', format: 'date-time', nullable: true },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
          lead: { $ref: '#/components/schemas/CardLead' },
        },
      },
      BoardStage: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          position: { type: 'integer' },
          color: { type: 'string', nullable: true },
          is_closed: { type: 'boolean' },
          cards: { type: 'array', items: { $ref: '#/components/schemas/BoardCard' } },
        },
        required: ['id', 'name', 'slug', 'position', 'is_closed', 'cards'],
      },
      BoardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/BoardStage' } },
        },
      },
      CreateCardRequest: {
        type: 'object',
        properties: {
          lead_id: { type: 'string', format: 'uuid', description: 'ID do lead' },
          stage_id: { type: 'string', format: 'uuid', nullable: true, description: 'ID da fase (opcional, default: qualificar)' },
          priority: { type: 'string', enum: ['Baixa', 'Normal', 'Alta', 'Urgente'], nullable: true },
        },
        required: ['lead_id'],
      },
      MoveCardRequest: {
        type: 'object',
        properties: {
          stage_id: { type: 'string', format: 'uuid', description: 'ID da fase de destino' },
          position: { type: 'integer', nullable: true, description: 'Nova position (opcional, default: final)' },
        },
        required: ['stage_id'],
      },
      ReorderCardsRequest: {
        type: 'object',
        properties: {
          stage_id: { type: 'string', format: 'uuid' },
          card_id: { type: 'string', format: 'uuid' },
          new_position: { type: 'integer' },
        },
        required: ['stage_id', 'card_id', 'new_position'],
      },
      UpdateCardRequest: {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['Baixa', 'Normal', 'Alta', 'Urgente'] },
          assigned_to: { type: 'string', nullable: true },
        },
      },
      CardHistoryEntry: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          card_id: { type: 'string', format: 'uuid' },
          from_stage_id: { type: 'string', format: 'uuid', nullable: true },
          to_stage_id: { type: 'string', format: 'uuid' },
          changed_at: { type: 'string', format: 'date-time' },
          from_stage_name: { type: 'string', nullable: true },
          to_stage_name: { type: 'string' },
        },
      },
      CardHistoryResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/CardHistoryEntry' } },
        },
      },
      FunnelMetrics: {
        type: 'object',
        properties: {
          stage_id: { type: 'string', format: 'uuid' },
          etapa: { type: 'string' },
          position: { type: 'integer' },
          total_leads: { type: 'integer' },
        },
      },
      FunnelMetricsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/FunnelMetrics' } },
        },
      },
      TempoMedio: {
        type: 'object',
        properties: {
          to_stage_id: { type: 'string', format: 'uuid' },
          etapa: { type: 'string' },
          horas_media: { type: 'number', nullable: true },
        },
      },
      TempoMedioResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'array', items: { $ref: '#/components/schemas/TempoMedio' } },
        },
      },
    },
  },
};

export default swaggerSpec;

