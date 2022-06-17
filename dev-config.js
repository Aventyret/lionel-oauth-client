;(() => {
  console.log('Test config', window.config) // eslint-disable-line no-console
  if (window.config) return
  window.config = {
    issuer: 'https://lionel-identity-server-dev.azurewebsites.net',
    authorizationEndpoint: '/connect/authorize',
    tokenEndpoint: '/connect/token',
    clientId: 'lionel-client1'
  }
  console.log('Dev config', window.config) // eslint-disable-line no-console
})()
