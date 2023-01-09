# Contributing

How can you contribute to this project? Guidelines for PRs, suggestions, etc.

## Setup development environment

The repository lionel-oauth-client is a monorepo with the client package, framework wrappers and docs as packages.

Use the Node version defined in the `.nvmrc` file in the project root. If you use NVM you can do:

```bash
nvm use
```

Install dependencies of all packages:

```bash
npm install && npm run husky
```

Build code of each package into `./dist` directory:

```bash
npm run build
```

Build code with watch and serve the main client package:

```bash
npm run dev:client
```

Browse the main client implementation at `http://localhost:3001/`

Watch and serve the docs:

```bash
npm run dev:docs
```

Browse the docs at `http://localhost:3000/`

## Naming branches

A branch should be called what it does or what it is, e.g. _you created a random number function so the branch could be called `add-random-number-function`_. Keep it simple, understandable, and somewhat short.

## Testing

_Everything should be tested_. The recommended approach is to think what you want to do and author [unit tests](https://en.wikipedia.org/wiki/Unit_testing) using [jest](https://jestjs.io/) that will confirm that you have successfully done it. In addition to unit testing you should also ensure that all of the _end-to-end (e2e) tests_ powered by [playwright](https://playwright.dev/) are still _green_, and in the instance where you have made modifications to the _flow_ add or update the tests accordingly.

Run both **unit** and **e2e** tests _once_ in all packages:

```bash
npm test
```

### Unit tests

Any and all unit tests should be created in `/test/unit` of each package and be named according to what you are testing, e.g. the `createStorageModule.test.ts` in `packages/client/test/unit` is a test for `createStorageModule.ts` in the client package.

Run **unit** tests in all packages:

```bash
# Once
npm run test:unit
```

### e2e tests

e2e tests should be created in `/test/e2e` and be named to indicate what it is supposed to test, e.g. `oauthPkceFlowIdentityServer.spec.ts`.

Run **e2e** tests in all packages that have them:

```bash
npm run test:e2e
```

## Release

The public packages in the repository are published to npm and the documentation is published to GitHub pages when a new release tag is created.

To create a new release, create a new branch and set it's upstream origin. Then run:

```bash
npm version patch|minor|major # This bumps the version in the versioned files, e.g. yarn version minor will bump version to the next minor version number
git push
git push --tags
```

Create a pull request for the new branch into main.

After the pull request is merged, create a new release tag (with automated changlog in the description).
