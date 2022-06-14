---
title: API Documentation
---

# API Documentation

## Initialize the client

The library exposes two factory functions – createOauthClient for basic oAuth with Authorization Code Grant and the PKCE extension and createOidcClient if you want to leverage OIDC (also with code flow + PCKE).

#### createOauthClient

```ts
function createOauthClient(configArg: OauthClientConfig): OauthClient
```

Basic example:

```js
import { createOauthClient } from 'lionel-oauth-client'

const oAuthClient = createOauthClient({
  issuer: 'https://sso.example.com',
  clientId: 'my_client_id',
  redirectUri: 'https://example.com/oauth-callback.html',
  scopes: ['api']
})
```

#### createOidcClient

```ts
function createOidcClient(configArg: OauthClientConfig): OauthClient
```

Basic example:

```js
import { createOidcClient } from 'lionel-oauth-client'

const oAuthClient = createOidcClient({
  issuer: 'https://sso.example.com',
  clientId: 'my_client_id',
  redirectUri: 'https://example.com/oauth-callback.html',
  scopes: ['api', 'profile'] // Note: 'openid' scope will be added automatically
})
```

Both factory functions take an `OauthClientConfig` object as arguments, but they set default options on that object differently. When you create a client you should be consistent in what config options you use so they are always the same for the same client. See the Configuration section below for a complete list of options.

The factory functions also return the same type of object, of the type `OauthClient`:

```ts
interface OauthClient {
  signIn: (options: SignInOptions) => Promise<void>
  signInSilently: (
    options: SignInOptions
  ) => Promise<HandleCallbackResponse | null>
  handleCallback: () => Promise<HandleCallbackResponse | null>
  getAccessToken: () => string | null
  removeAccessToken: () => void
  getConfig: () => OauthClientConfig
  subscribe: EventSubscribeFn
  unsubscribe: EventSubscribeFn
  getUser: () => Promise<User | null>
  getUserInfo: () => Promise<User | null>
  removeUser: () => void
  signOut: (options: SignOutOptions) => Promise<void>
}
```

See the Client Methods section below for a specification of the methods of the `OauthClient`.

## Configuration

Configuration of the client is handled by the config options you send as a `OauthClientConfig` object into the factory functions `createOauthClient` and `createOidcClient`.

```ts
interface OauthClientConfig {
  issuer: string
  clientId: string
  redirectUri: string
  scopes?: string[]
  authorizationEndpoint?: string
  tokenEndpoint?: string
  tokenStorage?: StorageModuleType
  tokenLeewaySeconds?: number
  authenticationMaxAgeSeconds?: number
  signInSilentlyTimeoutSeconds?: number
  responseMode?: ResponseMode
  metaData?: MetaData
  useNonce?: boolean
  useMetaDataDiscovery?: boolean
  useUserInfoEndpoint?: boolean
  display?: Display
  uiLocales?: string[]
  acrValues?: string[]
  debug?: boolean
}
```

Below is a complete list and definitions of these options:

#### OauthClientConfig.issuer

Required `string`. The url of the oAuth/OIDC issuer (provider).

#### OauthClientConfig.clientId

Required `string`. The client_id of the issuer client that you want to use.

#### OauthClientConfig.redirectUri

Required `string`. Absolute uri where you handle the callback from your issuer. This is where the issuer will send users after authorization.

#### OauthClientConfig.scopes

Optional `array` of `string`. The scope that you want to request from the issuer. When you use `createOidcClient` to create your client `openid` will always be added to `scopes`.

#### OauthClientConfig.authorizationEndpoint

Optional `string`. The endpoint at the issuer for the authorization request endpoint. Defaults to `/authorize`, but this property is not used if you use [Open ID Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html), which is enabled by default if you use `createOidcClient` to create your client.

#### OauthClientConfig.tokenEndpoint

Optional `string`. The endpoint at the issuer for the token request endpoint. Defaults to `/token`, but this property is not used if you use [Open ID Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html), which is enabled by default if you use `createOidcClient` to create your client.

#### OauthClientConfig.tokenStorage

Optional `string` (of type `StorageModuleType`). Can be `local` or `session`, defaults to `session`. Sets if tokens and other client data is stored in the browser's `sessionStorage` or `localStorage`.

#### OauthClientConfig.tokenLeewaySeconds

Optional `number`. Defaults to 60. The number of seconds to allow the current time to deviate when validating `expires_in` in the token response and `nbf` and `exp` attributes of jwt tokens.

#### OauthClientConfig.authenticationMaxAgeSeconds

Optional `number`. The maximum allowable elapsed time in seconds since the last time the end-user was actively authenticated at the issuer.

#### OauthClientConfig.signInSilentlyTimeoutSeconds

Optional `number`. Defaults to 10. Number of seconds to wait for the silent sign in to return before assuming it has failed or timed out.

#### OauthClientConfig.responseMode

Optional `string` (of type `ResponseMode`). Can be `fragment` or `query`. This specifies if parameters from the issuer will be send back as a url hash or query variables to the callback page. If not specified, the issuer's default will be used.

#### OauthClientConfig.metaData

Optional `object` (of type `MetaData`). If you do not use [Open ID Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html) you can specify the OIDC meta data here. If you use discovery you can also use this option to override specific attributes in the discovery meta data.

Type definition:

```ts
interface MetaData {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint?: string
  jwks_uri: string
  registration_endpoint?: string
  scopes_supported?: string[]
  response_types_supported: string[]
  response_modes_supported?: string[]
  grant_types_supported?: string[]
  acr_values_supported?: string[]
  subject_types_supported: string[]
  id_token_signing_alg_values_supported: string[]
  id_token_encryption_alg_values_supported?: string[]
  id_token_encryption_enc_values_supported?: string[]
  userinfo_signing_alg_values_supported?: string[]
  userinfo_encryption_alg_values_supported?: string[]
  userinfo_encryption_enc_values_supported?: string[]
  request_object_signing_alg_values_supported?: string[]
  request_object_encryption_alg_values_supported?: string[]
  request_object_encryption_enc_values_supported?: string[]
  token_endpoint_auth_methods_supported?: string[]
  token_endpoint_auth_signing_alg_values_supported?: string[]
  display_values_supported?: string[]
  claim_types_supported?: string[]
  claims_supported?: string[]
  service_documentation?: string
  claims_locales_supported?: string[]
  ui_locales_supported?: string[]
  claims_parameter_supported?: boolean
  request_parameter_supported?: boolean
  request_uri_parameter_supported?: boolean
  require_request_uri_registration?: boolean
  op_policy_uri?: string
  op_tos_uri?: string
  check_session_iframe?: string
  end_session_endpoint?: string
  [key: string]: any
}
```

#### OauthClientConfig.useNonce

Optional `boolean`. Defaults to `false` if you use `createOauthClient` and `true` if you use `createOidcClient` to create your client. Specifies if a nonce should be included in the authorization request to the issuer. If `useNonce` is true the client will require the id token to include the nonce and validate it when the callback is handled.

#### OauthClientConfig.useMetaDataDiscovery

Optional `boolean`. Defaults to `false` if you use `createOauthClient` and `true` if you use `createOidcClient` to create your client. Specifies if the client should look up issuer meta data through [Open ID Discovery](https://openid.net/specs/openid-connect-discovery-1_0.html).

#### OauthClientConfig.useUserInfoEndpoint

Optional `boolean`. Defaults to `false` if you use `createOauthClient` and `true` if you use `createOidcClient` to create your client. Specifies if the client should request user info from the issuer's [user info endpoint](https://openid.net/specs/openid-connect-core-1_0.html#UserInfo).

#### OauthClientConfig.display

Optional `string` (of type `Display`). Can be `page`, `popup`, `touch` or `wap`, defaults to `page`. Specifies how the issuer should display the authentication and consent user interface pages to the end-user.

#### OauthClientConfig.uiLocales

Optional `array` of `string`. End-user's preferred languages for the user interface at the issuer (e.g. `['sv-SE', 'en']`). Ordered by preference. The issuer should not throw an error if it does not support these, this is only a declaration of preference.

#### OauthClientConfig.acrValues

Optional `array` of `string`. Specifies the acr_values that the issuer is being requested to use for processing this authentication request, with the values appearing in order of preference.

#### OauthClientConfig.debug

Optional `boolean`. Defaults to false. If `debug` is true the client will output verbose logging in the browser console.

## Client Methods

When you have created a client, these are the methods on it that you can call:

### handleCallback

```ts
async function handleCallback() => Promise<HandleCallbackResponse | null>
```

Process the response from the issuer. This is done on the redirect uri you have specified as `redirectUri`.

Basic example:

```js
try {
  await handleCallback()
  location.assign('/') // Set where you want to redirect the user after successful signin
} catch (error) {
  console.error(error)
}
```

If the signin in the client fails the promise that the method returns will be rejected. If the user is successfully signed in the promise will resolve with an object of the type `HandleCallbackResponse`:

```ts
interface TokenResponse {
  accessToken: string
  idToken?: string
  expires: number
}

interface HandleCallbackResponse {
  tokenResponse: TokenResponse
  callbackType: CallbackType
  user: User | null
}
```

### signIn

```ts
async function signIn(options: SignInOptions = {}): Promise<void>
```

This performs redirect of the current window to the authorization endpoint of the issuer. The method returns a Promise in order to enable error handling of the generating of the redirect.

Basic example:

```js
oAuthClient.signIn()
```

The `signIn` methods take an optional argument of an object of the type `SignInOptions`:

```ts
interface SignInOptions {
  idTokenHint?: string
  loginHint?: string
  display?: string
  prompts?: Prompt[]
  nonce?: string
}
```

Below is a complete list and definitions of these options:

#### SignInOptions.idTokenHint

Optional `string`. Id token previously issued by the issuer being passed as a hint about the end-user's current or past authenticated session with the client.

#### SignInOptions.loginHint

Optional `string`. This is a hint to the issuer about what identifier the end-user might use to log in (if necessary). For instance if you first ask the end-user for their e-mail address (or other identifier) and then want to pass that value as a hint to the issuer.

#### SignInOptions.display

Optional `string` (of type `Display`). Can be `page`, `popup`, `touch` or `wap`, defaults to the `display` option of the client. Specifies how the issuer should display the authentication and consent user interface pages to the end-user.

#### SignInOptions.prompts

Optional array of `string` (of type `Prompt`). Can include `none`, `login`, `consent` or `select_account`. Specifies whether the issuer prompts the end-user for reauthentication and consent.

#### SignInOptions.nonce

Optional `string`. Here you can provide your own nonce to send to the issuer. If you leave this empty the client will generate a nonce for you (if `useNonce` is `true`).

### signInSilently

```ts
async function signInSilently(
  options: SignInOptions = {}
): Promise<HandleCallbackResponse | null>
```

This method sign a user in silently, that is without the end user being redirected to the issuer. This will perform an authentication in a hidden iframe, and if a user is signed in at the issuer the user will be signed in in the client.

Basic example:

```js
try {
  const signInResponse = await oAuthClient.signInSilently()
  if (!response.user) {
    alert('Not signed in')
    return
  }
  location.reload()
} catch (error) {
  alert(error)
}
```

The method's argument is the same as for `signIn`, but the `prompts` option will always be `['none']`.

If the method returns a Promise that resolves with a `HandleCallbackResponse` with a `user` attribute (or a `tokenResponse.accessToken` attribute if you do not use OIDC) the user was signed in at the issuer and is now signed in at the provider.

### getAccessToken

```ts
function getAccessToken(): string | null
```

Get the access token of user that is authenticated in the client. If there is no token the method will return null (and not throw an error).

Basic example:

```js
const accessToken = oAuthClient.getAccessToken()
```

### removeAccessToken

```ts
function removeAccessToken(): void
```

Removes the access token (effectively a client side sign out when not using openid scope). This will not sign the user out at the issuer.

Basic example:

```js
await oAuthClient.removeAccessToken()
```

### getUser

```ts
async function getUser(): Promise<User | null>
```

Get the decoded user claims from id_token and from the latest UserInfo response if a UserInfo request has been made. If there is no user the Promise that the method returns will resolve with `null`.

Basic example:

```js
let user
try {
  user = await oAuthClient.getUser()
} catch (error) {
  console.error(error)
}
```

What the user object looks like will depend on what claims the issuer returns. The type definition look like this:

### removeUser

```ts
function removeUser(): void
```

Removes the access token and id token (effectively a client side sign out). This will not sign the user out at the issuer.

Basic example:

```js
oAuthClient.removeUser()
```

### signOut

```ts
async function signOut(options: SignOutOptions): Promise<void>
```

Signs out user both in client and in issuer (and will redirect the user to the issuer). This requires end_session_endpoint in meta data (or in the issuer's discovery meta data).

Basic example:

```js
oAuthClient.signOut()
```

The `signOut` methods take an optional argument of an object of the type `SignOutOptions`:

```ts
interface SignOutOptions {
  postLogoutRedirectUri?: string
  useIdTokenHint?: boolean
}
```

Below is a complete list and definitions of these options:

#### SignOutOptions.postLogoutRedirectUri

Optional `string`. Absolute uri where the issuer should redirect the end-user after signing them out. This requires an id token hint to be sent, so it is only possible if you use OIDC.

#### SignOutOptions.useIdTokenHint

Optional `boolean`. Defaults to `false` but if you provide a `postLogoutRedirectUri` this will be true, since the open id specification requires this. This option specifies if the current id token in the client should be passed as a hint about the end-user's current or past authenticated session with the client.

## Events

The client publishes events when things that has to do with authentication happens that you can subscribe to.

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

The events that you can subscribe on are:

### tokenLoaded

This event is published when an access token is loaded in the client, it can be either when it is retreived from the callback response or when it is loaded from the token storage in the browser.

The payload of the event is the access token:

```ts
function exampleTokenLoadedListener(accessToken: string): void
```

### tokenUnloaded

This event is published when an access token is unloaded in the client, it can be either after it has been expired or when it is removed with any of the methods `removeAccessToken`, `removeUser` or `signOut`.

The event has no payload:

```ts
function exampleTokenUnloadedListener(): void
```

### userLoaded

This event is published when a user is loaded in the client, it can be either when it is retreived from the callback response or when it is loaded from the token storage in the browser.

The payload of the event is the user:

```ts
function exampleUserLoadedListener(user: User): void
```

### userUnloaded

This event is published when a user is unloaded in the client, it can be either after the access token has been expired or when the user is removed with any of the methods `removeUser` or `signOut`.

The event has no payload:

```ts
function exampleUserUnloadedListener(): void
```

### tokenWillExpire (coming soon)

This event is published before the access token in the client will expire.

The event has no payload:

```ts
function exampleTokenWillExpireListener(): void
```

### tokenDidExpire (coming soon)

This event is published after the access token in the client has expired.

The event has no payload:

```ts
function exampleTokenDidExpireListener(): void
```
