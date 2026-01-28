import { kv } from '@vercel/kv';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Get paste from KV
    const paste = await kv.get(`paste:${id}`);

    if (!paste) {
      return Response.json({ error: 'Paste not found' }, { status: 404 });
    }

    // Get current time (support test mode)
    const testMode = process.env.TEST_MODE === '1';
    const testNowMs = request.headers.get('x-test-now-ms');
    const now = testMode && testNowMs ? parseInt(testNowMs, 10) : Date.now();

    // Check if expired
    if (paste.expires_at && now >= paste.expires_at) {
      return Response.json({ error: 'Paste expired' }, { status: 404 });
    }

    // Check if view limit exceeded
    if (paste.remaining_views !== null && paste.remaining_views <= 0) {
      return Response.json({ error: 'View limit exceeded' }, { status: 404 });
    }

    // Decrement view count if applicable
    let updatedPaste = { ...paste };
    if (paste.remaining_views !== null) {
      updatedPaste.remaining_views = paste.remaining_views - 1;
      await kv.set(`paste:${id}`, updatedPaste);
    }

    // Build response
    const response = {
      content: paste.content,
      remaining_views: updatedPaste.remaining_views,
      expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
    };

    return Response.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching paste:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}