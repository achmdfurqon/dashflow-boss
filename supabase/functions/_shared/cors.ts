// Origin allowlist for CORS. Update ALLOWED_ORIGINS with your production domains.
const ALLOWED_ORIGINS = [
  'https://siap-eviden.lovable.app',
  'https://siap.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
]

// Fallback headers used for preflight/response even when origin is not matched
const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const isLovablePreview = !!origin && /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin)
  const isLovableEditor = !!origin && /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin)
  const allowed = !!origin && (ALLOWED_ORIGINS.includes(origin) || isLovablePreview || isLovableEditor)

  if (allowed) {
    return {
      ...baseHeaders,
      'Access-Control-Allow-Origin': origin!,
    }
  }
  return baseHeaders
}

// Kept for backwards compatibility with existing imports.
// Prefer getCorsHeaders(req.headers.get('origin')) in new code.
export const corsHeaders = {
  ...baseHeaders,
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
}
