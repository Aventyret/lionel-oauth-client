# Getting Started

## Overview

This library is an independent successor of the widly used [oidc-client](https://github.com/IdentityModel/oidc-client-js) library, that was archived in 2021.

You can use it for browser based oAuth, with or without OIDC. There is no support for the oAuth implicit flow: you need to use code flow with PKCE, which is now considered best practise for browser based oAuth.

Things that this library provides:

- An easy to use oAuth/OIDC implementation
- Stability and consistency on the oAuth client side
- Light footprint: makes use of the browser's crypto api

While we hope to lower the threshold of working with oAuth, we still recommend users to have an understaning of the concepts of oAuth. Checkout out [resources](/resources/) section for some recommended reading.

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

The library exposes two factory functions – `createOauthClient` for basic oAuth with Authorization Code Grant and the PKCE extension and `createOidcClient` if you want to leverage OIDC.

Choose the one best suitable for your needs. They both return an `OauthClient`, but they have differernt default config options.

#### createOauthClient

Create your client with settings for your oAuth issuer. See full list of config attributes in the [API section](/api/#configuration).

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
  debug // Optional, defaults to false
})
```

#### createOidcClient

An alternative way to create your client, when you use OpenID Connect. The same arguments are supported as for `createOauthClient`, but defaults and requirements differ slightly. For instance `openid` will be added to scopes automatically.

```js
import { createOidcClient } from 'lionel-oauth-client'

const oauthClient = createOidcClient({
  issuer, // Required, e.g. issuer: 'https://sso.example.com'
  clientId, // Required, e.g. clientId: 'example_app'
  redirectUri, // Required, e.g. clientId: 'http://localhost:3001/oauth-callback.html'
  scopes, // Optional, defaults to ['openid']. 'openid' will always be added if not included
  tokenStorage, // Optional, defaults to 'localStorage'
  tokenLeewaySeconds, // Optional, defaults to 60
  postLogoutRedirectUri, // Optional
  debug // Optional, defaults to false
})
```

### Setup callback

For the authentication to work you need to set up a page where you handle the redirect response from your issuer. On that page you should call `oauthClient.handleCallback()` – make sure that the client was created with the same config options as the client that initiated the authentication.

The absolute uri of the page where you hande the callback is what you should set as `redirectUri` when you create your client.

The same callback page will be used in all authorizations: sign in with redirect, sign in silently, auto renewal of tokens and authentication checks after session monitoring has indicatied a session change at the issuer.

### Client methods

A complete list of client methods and their arguments can be found in the [API section](/api/#client-methods).

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

Remove the tokens (effectively a client side sign out):

```js
oauthClient.removeUser()
```

Sign out user both in client and in provider. This requires end_session_endpoint in meta data (or in the issuers discovery meta data)

```js
oauthClient.signOut()
```

### Event subscription

A complete list of events can be found in the [API section](/api/#events).

Subscribe to an event to trigger a function in response:

```js
/** Supported event types: "tokenLoaded", "tokenUnloaded", "userLoaded", "userUnloaded", "tokenWillExpire", "tokenDidExpire" */
oAuthClient.subscribe('tokenLoaded', () =>
  console.log('An access token was loaded')
)
```

Unsubscribe from an event, must provide the same function that was passed to `oAuthClient.subscribe`:

```js
/** Supported event types: "tokenLoaded", "tokenUnloaded", "userLoaded", "userUnloaded", "tokenWillExpire", "tokenDidExpire" */
oAuthClient.unsubscribe('tokenLoaded', () =>
  console.log('An access token was loaded')
)
```
