// Simple test function
export async function onRequest() {
  return new Response(
    JSON.stringify({
      message: 'Functions are working!',
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
