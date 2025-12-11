import { createApp } from './app.js';
import { loadEnv, getConfig } from './config/env.js';

loadEnv();

const { port } = getConfig();
const app = await createApp();

app.listen(port, '0.0.0.0', () => {
  console.log(`Azterra backend listening on port ${port}`);
});
