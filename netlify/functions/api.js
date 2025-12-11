import serverless from 'serverless-http';
import { createApp } from '../../server/app.js';

let cachedHandler;

export const handler = async (event, context) => {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app, { basePath: '/.netlify/functions/api' });
  }
  return cachedHandler(event, context);
};
