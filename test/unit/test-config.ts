export const oauthConfig = {
  issuer: 'https://unit-test.oauth-issuer.com',
  clientId: 'unit_test_oauth_client',
  redirectUri: 'http://localhost:1337/oauth-callback',
  tokenLeewaySeconds: 60,
  scopes: ['api1']
}

export const oidcConfig = {
  issuer: 'https://unit-test.oauth-issuer.com',
  clientId: 'unit_test_oauth_client',
  redirectUri: 'http://localhost:1337/oauth-callback',
  tokenLeewaySeconds: 60,
  scopes: ['api1', 'openid'],
  metaData: {
    issuer: 'https://unit-test.oauth-issuer.com',
    authorization_endpoint:
      'https://unit-test.oauth-issuer.com/connect/authorize',
    token_endpoint: 'https://unit-test.oauth-issuer.com/connect/token',
    userinfo_endpoint: 'https://unit-test.oauth-issuer.com/connect/userinfo',
    jwks_uri: 'https://unit-test.oauth-issuer.com/connect/jwks',
    response_types_supported: ['code'],
    subject_types_supported: ['pairwise', 'public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid']
  }
}
