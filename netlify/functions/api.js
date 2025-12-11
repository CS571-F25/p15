import serverless from 'serverless-http';
import { createApp } from '../../server/app.js';

let cachedHandler;

export const handler = async (event, context) => {
  if (!cachedHandler) {
    const app = await createApp();
    // Netlify will mount the function at /.netlify/functions/api; let routing stay as-is (/api/*) via redirects.
    cachedHandler = serverless(app);
  }
  return cachedHandler(event, context);
};
