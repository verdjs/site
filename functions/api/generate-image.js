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
            // Generic error message to avoid leaking configuration details
            return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Build the image generation URL with the secure API key
        const encoded = encodeURIComponent(prompt);
        // Use default seed and pass API key correctly
        const imgUrl = `https://image.pollinations.ai/prompt/${encoded}?model=zimage&width=2048&height=2048&key=${apiKey}`;
        
        // Fetch the image from pollinations.ai with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
        
        const response = await fetch(imgUrl, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        
        // Return the image with appropriate headers
        return new Response(response.body, {
            status: 200,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'image/png',
                'Cache-Control': 'public, max-age=3600',
                // Allow all origins since this is a public site
                // Change to specific domain if you want to restrict access
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        // Handle timeout errors specifically
        if (error.name === 'AbortError') {
            return new Response(JSON.stringify({ error: 'Image generation timed out' }), {
                status: 504,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        // Generic error message to avoid exposing internal details
        console.error('Image generation error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
