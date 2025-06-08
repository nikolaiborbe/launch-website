// src/routes/api/status/+server.ts
import type { RequestHandler } from '../$types';

export const GET: RequestHandler = async () => {
  const res = await fetch('https://launch-server.onrender.com/status');
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};