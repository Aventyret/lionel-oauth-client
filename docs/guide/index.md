# Getting Started

Lionel oAuth Client is a work in progress – not ready for production.

## Overview

Write a description as to why this is good.

## Browser Support

The library works with modern browsers. Also works with IE11, but it users `Promise` and `TextEncoder`, so you will need to implement solutions for those if you want Internet Explorer support.

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

Initialize your client with settings for your oAuth issuer. See full list of config attributes in the [Configuration section](/config/).

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

#### OpenID Connect Client

To support OpenID Connect you can use `createOidcClient`. The same arguments are supported, but defaults and requirements differ slightly. For instance `openid` will be added to scopes automatically.

```js
import { createOidcClient } from 'lionel-oauth-client'

const oauthClient = createOidcClient({
  issuer, // Required, e.g. issuer: 'https://sso.example.com'
  clientId, // Required, e.g. clientId: 'example_app'
  redirectUri, // Required, e.g. clientId: 'http://localhost:3001/oauth-callback.html'
  scopes, // Optional, defaults to ['openid']. 'openid' will always be added if not included
  tokenStorage, // Optional, defaults to 'localStorage'
  tokenLeewaySeconds, // Optional, defaults to 60
  authenticationMaxAgeSeconds, // Optional
  responseMode, // Optional
  metaData, // Optional, but required if useMetaDataDiscovery is false
  useNonce, // Optional, defaults to true
  useMetaDataDiscovery, // Optional, defaults to true
  useUserInfoEndpoint, // Optional, defaults to true
  display, // Optional
  prompt, // Optional
  uiLocales, // Optional
  acrValues, // Optional
  postLogoutRedirectUri, // Optional
  debug // Optional, defaults to false
})
```

### Client methods

Sign in the user by redirecting to issuer:

```js
oAuthClient.signIn()
```

Optionally you can pass options to the signin request

```js
oAuthClient.signIn({
  idTokenHint, // Optional
  display, // Optional, can be page, popup, touch or wap
  prompt, // Optional, none, login, consent or select_account
  nonce // Optional, if not provided the library will create a nonce for you (if not useNonce is set to false in config)
})
```

Process the response from the issuer. This is done on the redirect uri you have specified as `redirectUri`:

```js
await oAuthClient.handleCallback()
```

There is also a method to sign in a user silently. This will perform an authentication in a hidden iframe, and if a user is signed in at the issuer the user will be signed in in the client:

```js
await oAuthClient.signInSilently()
```

Get the access token of the signed in user:

```js
await oAuthClient.getAccessToken()
```

Remove the access token (effectively a client side sign out when not using openid scope):

```js
await oAuthClient.removeAccessToken()
```

Get the decoded user claims from id_token and from the latest UserInfo response if a UserInfo request has been made:

```js
oauthClient.getUser()
```

Get fresh user claims from UserInfo endpoint at the issuer:

```js
await oauthClient.getUserInfo()
```

Remove the tokens (effectively a client side sign out):

```js
oauthClient.removeUser()
```

Sign out user both in client and in provider. This requires end_session_endpoint in meta data (or in the issuers discovery meta data)

```js
oauthClient.signOut()
```

### Event subscription

Subscribe to an event to trigger a function in response:

```js
/** Supported event types: "tokenLoaded", "tokenUnloaded", "userLoaded", "userUnloaded", "refreshNeeded" */
oAuthClient.subscribe('refreshNeeded', () => console.log('Refresh is needed'))
```

Unsubscribe from an event, must provide the same function that was passed to `oAuthClient.subscribe`:

```js
/** Supported event types: "tokenLoaded", "tokenUnloaded", "userLoaded", "userUnloaded", "refreshNeeded" */
oAuthClient.unsubscribe('refreshNeeded', () => console.log('Refresh is needed'))
```
