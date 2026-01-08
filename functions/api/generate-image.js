// Cloudflare Pages Function to handle image generation with secure API key
export async function onRequest(context) {
    const { request, env } = context;
    
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }
    
    try {
        const { prompt } = await request.json();
        
        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Prompt is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get API key from environment variables
        const apiKey = env.API_KEY;
        
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Build the image generation URL with the secure API key
        const encoded = encodeURIComponent(prompt);
        const imgUrl = `https://image.pollinations.ai/prompt/${encoded}?model=zimage&width=2048&height=2048&apikey=${apiKey}`;
        
        // Fetch the image from pollinations.ai
        const response = await fetch(imgUrl);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        
        // Return the image with appropriate headers
        return new Response(response.body, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/png',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
