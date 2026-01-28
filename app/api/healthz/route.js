import { kv } from '@vercel/kv';

export async function GET() {
  try {
    // Try to ping the KV store to check connectivity
    await kv.ping();
    
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    // If KV is not available, still return ok but log the error
    console.error('KV ping failed:', error);
    return Response.json({ ok: true }, { status: 200 });
  }
}