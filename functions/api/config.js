export async function onRequest(context) {
  return new Response(JSON.stringify({
    apiKey: context.env.API_KEY
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
