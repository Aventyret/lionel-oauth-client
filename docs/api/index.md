---
title: API Documentation
---

# API Documentation

## Configuration

Configuration of the client is handled by the config options you send into the factory functions `createOauthClient` and `createOidcClient`.

```ts
function createOauthClient(configArg: OauthClientConfig): OauthClient
```

```ts
function createOidcClient(configArg: OauthClientConfig): OauthClient
```

They both take an `OauthClientConfig` object as arguments, but they set default options on that object differently.

### OauthClientConfig.issuer

Required `string`. The url of the oAuth/OIDC provider.

### OauthClientConfig.clientId

Required `string`. The client_id of the provider client that you want to use.

### OauthClientConfig.redirectUri

Required `string`. Absolute uri where you handle the callback from your provider. This is where the provider will send users after authorization.

### OauthClientConfig.scopes

Optional `array` of `string`.

## Client Methods

## Events
