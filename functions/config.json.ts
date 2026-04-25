interface Env {
  VITE_API_URL: string;
  VITE_OIDC_ISSUER: string;
  VITE_OIDC_CLIENT_ID: string;
  VITE_OIDC_SCOPES?: string;
  VITE_OIDC_USER_MANAGEMENT_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = ({ env }) =>
  new Response(
    JSON.stringify({
      VITE_API_URL: env.VITE_API_URL,
      VITE_OIDC_ISSUER: env.VITE_OIDC_ISSUER,
      VITE_OIDC_CLIENT_ID: env.VITE_OIDC_CLIENT_ID,
      VITE_OIDC_SCOPES: env.VITE_OIDC_SCOPES,
      VITE_OIDC_USER_MANAGEMENT_URL: env.VITE_OIDC_USER_MANAGEMENT_URL,
    }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
