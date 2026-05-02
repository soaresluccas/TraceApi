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
};

export default swaggerSpec;

