#!/bin/sh
set -e

# Replace environment variables in config.json.template and save to config.json.
# Explicit variable list prevents accidental substitution of other $ tokens in the JSON.
# Include optional VITE_OIDC_JWT_AUD so the audience can be injected at runtime if set.
envsubst '$VITE_API_URL $VITE_OIDC_ISSUER $VITE_OIDC_CLIENT_ID $VITE_OIDC_SCOPES' \
  < /usr/share/nginx/html/config.json.template \
  > /usr/share/nginx/html/config.json

# Build the Content-Security-Policy header with runtime-resolved OIDC issuer.
# NOTE: the script-src SHA-256 hash in security-headers.conf.template is tied to the
# exact content of the inline theme-init script in index.html. If that script changes,
# the hash must be regenerated — see the comment in nginx.security-headers.conf.template.
envsubst '$VITE_API_URL $VITE_OIDC_ISSUER' \
  < /etc/nginx/snippets/security-headers.conf.template \
  > /etc/nginx/snippets/security-headers.conf

# Execute the original command
exec "$@"
