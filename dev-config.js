;(() => {
  console.log('Test config', window.config) // eslint-disable-line no-console
  if (window.config) return
  window.config = {
    issuer: 'https://demo.duendesoftware.com',
    authorizationEndpoint: '/connect/authorize',
    tokenEndpoint: '/connect/token',
    clientId: 'interactive.public'
  }
  console.log('Dev config', window.config) // eslint-disable-line no-console
})()
