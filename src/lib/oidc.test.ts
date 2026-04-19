import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOidcConfig, onOidcSigninCallback } from './oidc';

describe('oidc config', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    window.history.replaceState({}, '', '/');
  });

  it('builds OIDC config from env values', () => {
    vi.stubEnv('VITE_OIDC_ISSUER', 'https://issuer.example.com');
    vi.stubEnv('VITE_OIDC_CLIENT_ID', 'web-client');

    const config = getOidcConfig();

    expect(config.authority).toBe('https://issuer.example.com');
    expect(config.client_id).toBe('web-client');
    expect(config.redirect_uri).toBe(`${window.location.origin}/auth/callback`);
    expect(config.post_logout_redirect_uri).toBe(`${window.location.origin}/`);
    expect(config.response_type).toBe('code');
  });

  it('throws when required env vars are missing', () => {
    vi.stubEnv('VITE_OIDC_ISSUER', '');
    vi.stubEnv('VITE_OIDC_CLIENT_ID', '');

    expect(() => getOidcConfig()).toThrowError('Missing required env var: VITE_OIDC_ISSUER');
  });

  it('replaces callback URL with root path after signin', () => {
    window.history.replaceState({}, '', '/auth/callback?code=test&state=test');

    onOidcSigninCallback();

    expect(window.location.pathname).toBe('/');
    expect(window.location.search).toBe('');
  });
});
