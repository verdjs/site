export async function onRequest(context) {
  // Only allow POST requests
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Get the origin from the request
  const origin = context.request.headers.get('Origin');
  const referer = context.request.headers.get('Referer');
  
  // For same-origin requests, origin might be null, check referer
  const requestOrigin = origin || (referer ? new URL(referer).origin : null);
  
  // Get the deployment URL from the request
  const deploymentOrigin = new URL(context.request.url).origin;
  
  // Only allow requests from the same origin as the deployment
  if (!requestOrigin || requestOrigin !== deploymentOrigin) {
    return new Response(JSON.stringify({
      error: 'Unauthorized'
    }), {
      status: 403,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Parse the request body
  let prompt;
  try {
    const body = await context.request.json();
    prompt = body.prompt;
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Invalid JSON in request body'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  if (!prompt) {
    return new Response(JSON.stringify({
      error: 'Prompt is required'
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Make request to zimage API with API key from environment
  // Note: zimage API requires the API key in the URL query parameter
  // This is a limitation of their API design, but since this runs server-side
  // on Cloudflare, the API key is not exposed to the client browser
  const zimageUrl = `https://api.zimage.ai/v1/generate?prompt=${encodeURIComponent(prompt)}&width=2048&height=2048&model=zimage&apikey=${context.env.API_KEY}`;
  
  try {
    const response = await fetch(zimageUrl);
    
    // Return the image with appropriate headers
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Access-Control-Allow-Origin': requestOrigin,
        'Cache-Control': 'public, max-age=31536000'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to generate image'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
