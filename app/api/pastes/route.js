import { Redis } from '@upstash/redis';

const kv = Redis.fromEnv();
import { nanoid } from 'nanoid';

export async function POST(request) {
  try {
    const body = await request.json();
    const { content, ttl_seconds, max_views } = body;

    // Validation
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return Response.json(
        { error: 'content is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
      return Response.json(
        { error: 'ttl_seconds must be an integer >= 1' },
        { status: 400 }
      );
    }

    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
      return Response.json(
        { error: 'max_views must be an integer >= 1' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = nanoid(10);

    // Calculate expiry timestamp
    let expires_at = null;
    if (ttl_seconds) {
      expires_at = Date.now() + (ttl_seconds * 1000);
    }

    // Store paste data
    const pasteData = {
      content,
      expires_at,
      max_views: max_views || null,
      remaining_views: max_views || null,
      created_at: Date.now()
    };

    await kv.set(`paste:${id}`, pasteData);

    // Build URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const url = `${protocol}://${host}/p/${id}`;

    return Response.json({ id, url }, { status: 200 });

  } catch (error) {
    console.error('Error creating paste:', error);
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}