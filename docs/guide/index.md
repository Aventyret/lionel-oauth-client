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
  redirectUri, // Required, e.g. clientId: 'http://localhost:3000/oauth-callback.html'
  scope, // Optional
  authorizationEndpoint, // Optional, defaults to '/authorize'
  tokenEndpoint, // Optional, defaults to '/token'
  tokenStorage, // Optional, defaults to 'localStorage'
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

#### OpenID Client

Docs coming soon...

```js
import { createOpenIdClient } from 'lionel-oauth-client'

const openIdClient = createOpenIdClient({
  issuer,
  clientId,
  redirectUri,
  scope, //
  discoveryEndpoint // Optional, defaults to '/.well-known/openid-configuration'
})
```
