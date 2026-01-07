export async function onRequest(context) {
  // Get the origin from the request
  const origin = context.request.headers.get('Origin');
  const allowedOrigins = [
    context.env.PAGES_URL || '', // Cloudflare Pages deployment URL
    'http://localhost:8788', // Local development
    'http://127.0.0.1:8788'
  ].filter(Boolean);

  // Check if origin is allowed (same origin policy or allowed list)
  const corsOrigin = allowedOrigins.includes(origin) ? origin : 
                     (origin && origin.startsWith(context.request.url.origin) ? origin : null);

  return new Response(JSON.stringify({
    apiKey: context.env.API_KEY
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': corsOrigin || context.request.url.origin
    }
  });
}
