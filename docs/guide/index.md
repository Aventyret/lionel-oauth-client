# Getting Started

Lionel oAuth Client is a work in progress – not ready for production.

## Overview

Write a description as to why this is good.

## Browser Support

Write a summary for which browsers are tested and supported.

## How to get going

### Installation

```bash
npm install lionel-oauth-client
```

```bash
yarn add lionel-oauth-client
```

### Initialize and configure client

The library exposes two factory functions, one for basic oAuth with Authorization Code Grant and the PKCE extension.

#### oAuth Client

Initialize your client with settings for your oAuth issuer.

```js
import { createOauthClient } from 'lionel-oauth-client'

const oAuthClient = createOauthClient({
  issuer, // Required, e.g. issuer: 'https://sso.example.com'
  clientId, // Required, e.g. clientId: 'example_app'
  redirectUri, // Required, e.g. clientId: 'http://localhost:3001/oauth-callback.html'
  scopes, // Optional
  authorizationEndpoint, // Optional, defaults to '/authorize'
  tokenEndpoint, // Optional, defaults to '/token'
  tokenStorage, // Optional, defaults to 'localStorage'
  tokenLeewaySeconds, // Optional, defaults to 60
  authenticationMaxAgeSeconds, // Optional
  responseMode, // Optional
  debug // Optional, defaults to false
})
```

Sign in the user by redirecting to issuer:

```js
oAuthClient.signIn()
```

Process the response from the issuer. This is done on the redirect uri you have specified as `redirectUri`:

```js
await oAuthClient.handleCallback()
```

Get the access token of the signed in user:

```js
await oAuthClient.getAccessToken()
```

Remove the access token (effectively a client side sign out):

```js
await oAuthClient.removeAccessToken()
```

Subscribe to an event to trigger a function in response:

```js
/** Supported event types: "tokenUpdated", "refreshNeeded" */
oAuthClient.subscribe('refreshNeeded', () => console.log('Refresh is needed'))
```

Unsubscribe from an event, must provide the same function that was passed to `oAuthClient.subscribe`:

```js
/** Supported event types: "tokenUpdated", "refreshNeeded" */
oAuthClient.unsubscribe('refreshNeeded', () => console.log('Refresh is needed'))
```

#### OpenID Connect Client

Initialize your client with settings for your Open ID Connect issuer.

```js
import { createOidcClient } from 'lionel-oauth-client'

const oidcClient = createOidcClient({
  issuer, // Required, e.g. issuer: 'https://sso.example.com'
  clientId, // Required, e.g. clientId: 'example_app'
  redirectUri, // Required, e.g. clientId: 'http://localhost:3001/oauth-callback.html'
  scopes, // Optional, defaults to ['openid']. 'openid' will always be added if not included
  tokenStorage, // Optional, defaults to 'localStorage'
  tokenLeewaySeconds, // Optional, defaults to 60
  authenticationMaxAgeSeconds, // Optional
  responseMode, // Optional
  medaData, // Optional, if left out meta data will be collected through OpenID Discovery
  useNonce, // Optional, defaults to true
  debug // Optional, defaults to false
})
```

Sign in the user by redirecting to issuer:

```js
oidcClient.signIn()
```

Optionally you can pass options to the signin request

```js
oidcClient.signIn({
  idTokenHint, // Optional
  display, // Optional, can be page, popup, touch or wap
  prompt, // Optional, none, login, consent or select_account
  nonce // Optional, if not provided the library will create a nonce for you (if not useNonce is set to false in config)
})
```

Process the response from the issuer. This is done on the redirect uri you have specified as `redirectUri`:

```js
await oidcClient.handleCallback()
```

Get the tokens of the signed in user:

```js
oidcClient.getAccessToken()
oidcClient.getIdToken()
```

Get the decoded user claims from id_token or from the latest UserInfo response if a UserInfo request has been made:

```js
oidcClient.getUser()
```

Get a fresh user from the UserInfo endpoint at the issuer:

```js
await oidcClient.reloadUser()
```

Remove the tokens (effectively a client side sign out):

```js
oidcClient.removeTokens()
```
