import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Servidor iniciado na porta ${PORT}`);
    console.log(`📚 Documentação disponível em http://localhost:${PORT}/api-docs`);
  });
}

export default app;

