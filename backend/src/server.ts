import { app } from './app.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

async function start() {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`servidor rodando em http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();