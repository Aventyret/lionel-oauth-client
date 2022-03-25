# Contributing

How can you contribute to this project? Guidelines for PRs, suggestions, etc.

## Setup development environment

Use the Node version defined in the `.nvmrc` file in the project root. If you use NVM you can do:

```bash
nvm use
```

Install dependencies:

```bash
yarn
```

Build code into `./dist` directory:

```bash
yarn build
```

Build code with watch:

```bash
yarn dev
```

## Naming branches

A branch should be called what it does or what it is, e.g. _you created a random number function so the branch could be called `add-random-number-function`_. Keep it simple, understandable, and somewhat short.

## Testing

_Everything should be tested_. The recommended approach is to think what you want to do and author [unit tests](https://en.wikipedia.org/wiki/Unit_testing) using [jest](https://jestjs.io/) that will confirm that you have successfully done it. In addition to unit testing you should also ensure that all of the _end-to-end (e2e) tests_ powered by [playwright](https://playwright.dev/) are still _green_, and in the instance where you have made modifications to the _flow_ add or update the tests accordingly.

Run both **unit** and **e2e** tests _once_:

```bash
yarn test
```

### Unit tests

Any and all unit tests should be created in `/test/unit` and be named according to what you are testing, e.g. the `createStorageModule.test.ts` is a test for `createStorageModule.ts`.

Run **unit** tests:

```bash
# Once
yarn test:unit

# Watch for changes
yarn test:unit --watch
```

### e2e tests

e2e tests should be created in `/test/e2e` and be named to indicate what it is supposed to test, e.g. `oauthPkceFlowIdentityServer.spec.ts`.

Run **e2e** tests:

```bash
yarn test:e2e
```

Sadly [playwright](https://playwright.dev/) does not currently support a watch mode like [jest](https://jestjs.io/) does so when you want to check if you have broken something or made something work for the very first time you need to rerun `yarn test:e2e`.
