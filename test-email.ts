import 'dotenv/config';
import { BrevoLeadNotificationService } from './src/infrastructure/services/BrevoLeadNotificationService';

const testLead = {
  id: 'test-123',
  name: 'Teste de Email',
  whatsapp: '11999999999',
  instagram: '@teste',
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  created_at: new Date(),
  updated_at: new Date(),
};

async function testEmailSending() {
  console.log('='.repeat(60));
  console.log('TESTE DE ENVIO DE EMAIL - BREVO');
  console.log('='.repeat(60));
  console.log('');

  const service = new BrevoLeadNotificationService();
  
  console.log('');
  console.log('Tentando enviar email de teste...');
  console.log('');

  try {
    await service.notifyNewLead(testLead);
    console.log('');
    console.log('='.repeat(60));
    console.log('✓ TESTE CONCLUÍDO COM SUCESSO');
    console.log('='.repeat(60));
    process.exit(0);
  } catch (error) {
    console.log('');
    console.log('='.repeat(60));
    console.error('✗ TESTE FALHOU');
    console.error('Erro:', error instanceof Error ? error.message : String(error));
    console.log('='.repeat(60));
    process.exit(1);
  }
}

testEmailSending();
