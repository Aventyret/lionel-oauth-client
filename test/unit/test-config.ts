export const oauthConfig = {
  issuer: 'https://unit-test.oauth-issuer.com',
  clientId: 'unit_test_oauth_client',
  redirectUri: 'http://localhost:1337/oauth-callback',
  tokenLeewaySeconds: 60,
  scopes: ['api1']
}

export const oidcConfig = {
  issuer: 'https://demo.duendesoftware.com',
  clientId: 'interactive.public',
  redirectUri: 'http://localhost:1337/oidc-callback.html',
  tokenLeewaySeconds: 60,
  scopes: ['api', 'openid'],
  useNonce: true,
  useUserInfoEndpoint: false,
  metaData: {
    issuer: 'https://demo.duendesoftware.com',
    authorization_endpoint: 'https://demo.duendesoftware.com/connect/authorize',
    token_endpoint: 'https://demo.duendesoftware.com/connect/token',
    userinfo_endpoint: 'https://demo.duendesoftware.com/connect/userinfo',
    jwks_uri: 'https://demo.duendesoftware.com/connect/jwks',
    response_types_supported: ['code'],
    subject_types_supported: ['pairwise', 'public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid']
  }
}
