// src/routes/status/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import type {Data} from "../../../types"


export const GET: RequestHandler = async () => {
  try {
    const res = await fetch('https://launch-server.onrender.com/status');

    if (!res.ok) {
      // forward upstream error status
      return new Response(`Upstream error: ${res.statusText}`, { status: res.status });
    }

    const data: Data = await res.json();
    return json(data);
  } catch (err) {
    console.error('Error fetching status:', err);
    return new Response('Internal server error', { status: 500 });
  }
};
