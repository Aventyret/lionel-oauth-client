# Getting Started

## Overview

This library is an independent successor of the widely used [oidc-client](https://github.com/IdentityModel/oidc-client-js) library, that was archived in 2021.

You can use it for browser based oAuth, with or without OIDC. There is no support for the oAuth implicit flow: you need to use code flow with PKCE, which is now considered best practise for browser based oAuth.

Things that this library provides:

- An easy to use oAuth/OIDC implementation
- Stability and consistency on the oAuth client side
- Light footprint: makes use of the browser's crypto api

While we hope to lower the threshold of working with oAuth, we still recommend users to have an understaning of the concepts of oAuth. Checkout out the [resources](/resources/) section for some recommended (if not always easy to comprehend) reading.

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

```bash
pnpm install lionel-oauth-client
```

### Initialize and configure client

The library exposes two factory functions – `createOauthClient` for basic oAuth with Authorization Code Grant and the PKCE extension and `createOidcClient` if you want to leverage OIDC (also with code flow + PCKE).

Choose the one best suitable for your needs. They both return an `OauthClient`, but they have differernt default config options.

#### createOauthClient

Create your client with settings for your oAuth issuer. See full list of config attributes in the [API section](/api/#configuration).

```js
import { createOauthClient } from 'lionel-oauth-client'

const oAuthClient = createOauthClient({
  issuer, // Required, e.g. issuer: 'https://sso.example.com'
  clientId, // Required, e.g. clientId: 'example_app'
  redirectUri, // Required, e.g. clientId: 'http://localhost:3001/oauth-callback.html'
  scopes // Optional, e.g. ['api']
})
```

#### createOidcClient

An alternative way to create your client, when you use OpenID Connect. The same arguments are supported as for `createOauthClient`, but defaults and requirements differ slightly. For instance `openid` will be added to scopes automatically.

```js
import { createOidcClient } from 'lionel-oauth-client'

const oAuthClient = createOidcClient({
  issuer, // Required, e.g. issuer: 'https://sso.example.com'
  clientId, // Required, e.g. clientId: 'example_app'
  redirectUri, // Required, e.g. clientId: 'http://localhost:3001/oidc-callback.html'
  scopes // Optional, e.g. ['api', 'email']. Defaults to ['openid']. 'openid' will always be added if not included
})
```

### Setup callback

For the authentication to work you need to set up a page where you handle the redirect response from your issuer. On that page you should call `oAuthClient.handleCallback()` – make sure that the client was created with the same config options as the client that initiated the authentication.

The absolute uri of the page where you handle the callback is what you should set as `redirectUri` when you create your client.

The same callback page will be used in all authorizations: sign in with redirect, sign in silently, auto renewal of tokens and authentication checks after session monitoring has indicatied a session change at the issuer.

### Client methods

A complete list of client methods and their arguments can be found in the [API section](/api/#client-methods).

### Event subscription

The client publishes events when things that have to do with authentication happens that you can subscribe to.

A complete list of events and details on how you subscribe to them can be found in the [API section](/api/#events).
