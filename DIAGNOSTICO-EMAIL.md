# Diagnóstico de Envio de Emails Brevo

## Problema Relatado
Cliente não recebeu email após último POST de lead no banco.

## Melhorias Implementadas

### 1. Logging Detalhado
- Logs na inicialização do serviço mostrando se está configurado corretamente
- Logs antes de cada tentativa de envio
- Logs de sucesso com Message ID da Brevo
- Logs de erro detalhados com status HTTP e código de erro da Brevo

### 2. Validação Antecipada
- Variáveis de ambiente são validadas no construtor do serviço
- Sistema avisa imediatamente se alguma configuração está faltando
- Mensagens claras sobre qual variável está faltando

## Checklist de Configuração

Verifique se as seguintes variáveis de ambiente estão configuradas no arquivo `.env`:

```env
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=seu-email@seudominio.com
BREVO_SENDER_NAME=Nome da Empresa
LEAD_NOTIFICATION_EMAIL=destinatario@seudominio.com
```

### Verificações Importantes:

1. **BREVO_API_KEY**: 
   - Obtida em https://app.brevo.com/settings/keys/api
   - Deve começar com `xkeysib-`
   - Validar se não está expirada

2. **BREVO_SENDER_EMAIL**:
   - Deve ser um email verificado na Brevo
   - Se usar domínio próprio, deve ter SPF/DKIM configurados
   - Verificar em https://app.brevo.com/settings/sender

3. **LEAD_NOTIFICATION_EMAIL**:
   - Email que receberá as notificações de leads
   - Pode ser qualquer email válido

4. **BREVO_SENDER_NAME** (opcional):
   - Nome que aparece como remetente
   - Padrão: "Trace Company"

## Como Testar o Envio

### 1. Teste Isolado
Execute o script de teste:

```bash
npm run build
node dist/test-email.js
```

Você verá logs detalhados mostrando:
- Se o serviço está configurado
- Quais variáveis estão faltando (se houver)
- Tentativa de envio
- Sucesso ou erro com detalhes

### 2. Verificar Logs do Servidor

Quando o servidor iniciar, procure por estas mensagens:

**Se configurado corretamente:**
```
[BrevoLeadNotificationService] Serviço configurado com sucesso
  - Remetente: Nome <email@dominio.com>
  - Destinatário: destinatario@dominio.com
```

**Se houver problema:**
```
[BrevoLeadNotificationService] CONFIGURAÇÃO INCOMPLETA:
  - BREVO_API_KEY: ✗ faltando
  - BREVO_SENDER_EMAIL: ✓ configurada
  - LEAD_NOTIFICATION_EMAIL: ✗ faltando
  Emails de notificação de leads NÃO serão enviados!
```

### 3. Verificar Logs Durante Criação de Lead

Quando um lead for criado via POST, procure por:

**Sucesso:**
```
[BrevoLeadNotificationService] Iniciando envio de email para lead: "Nome do Lead" (11999999999)
[BrevoLeadNotificationService] ✓ Email enviado com sucesso para lead "Nome do Lead"
  - Message ID: <abcd1234-5678-90ef-ghij-klmnopqrstuv@domain.com>
```

**Erro de configuração:**
```
[BrevoLeadNotificationService] Email NÃO enviado para lead "Nome do Lead" - configuração incompleta
```

**Erro da API Brevo:**
```
[BrevoLeadNotificationService] ERRO ao enviar email:
  - Lead: "Nome do Lead"
  - Status HTTP: 400
  - Mensagem: Invalid API key
  - Código Brevo: invalid_parameter
```

## Possíveis Causas do Problema

### 1. Variáveis de Ambiente Não Carregadas
- Arquivo `.env` não existe ou está no lugar errado
- Servidor não foi reiniciado após configurar variáveis
- Variáveis não foram definidas no ambiente de produção

### 2. Configuração Incorreta da Brevo
- API Key inválida ou expirada
- Email remetente não verificado
- Domínio sem SPF/DKIM configurado
- Limite de envios atingido na conta Brevo

### 3. Erro Silencioso (CORRIGIDO)
- Antes: erros eram apenas logados, não era possível ver
- Agora: logs detalhados em todos os casos

### 4. Servidor Não Reiniciado
- Mudanças no `.env` só são carregadas ao iniciar o servidor
- Sempre reiniciar após alterar variáveis de ambiente

## Próximos Passos

1. **Verificar logs do servidor ao iniciar**
   - Ver se mostra "Serviço configurado com sucesso"

2. **Executar teste isolado**
   - `npm run build && node dist/test-email.js`

3. **Criar um lead de teste via API**
   - POST para `/api/leads`
   - Verificar logs no console do servidor

4. **Verificar dashboard da Brevo**
   - Acessar https://app.brevo.com/
   - Menu "Transactional" > "Email" > "Logs"
   - Verificar se email foi enviado ou rejeitado

5. **Verificar spam/lixeira**
   - Emails podem cair em spam na primeira vez
   - Marcar como "não é spam" se necessário

## Comandos Úteis

```bash
# Testar envio de email
npm run build && node dist/test-email.js

# Ver logs do servidor em tempo real (se usando PM2)
pm2 logs trace-api --lines 100

# Reiniciar servidor
pm2 restart trace-api

# Verificar variáveis de ambiente carregadas
node -e "require('dotenv').config(); console.log(process.env.BREVO_API_KEY ? 'API Key OK' : 'API Key FALTANDO')"
```
