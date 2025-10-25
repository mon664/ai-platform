// Diagnostic endpoint to check environment variables
export async function onRequest({ env }) {
  const ok = {
    OPENAI: Boolean(env.OPENAI_API_KEY),
    GEMINI: Boolean(env.GEMINI_API_KEY),
  };
  return new Response(JSON.stringify(ok), {
    headers: { "content-type": "application/json" },
  });
}
