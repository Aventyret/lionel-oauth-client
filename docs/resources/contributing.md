# Contributing

How can you contribute to this project? Guidelines for PRs, suggestions, etc.

## Setup development environment

Use the Node version defined in the `.nvmrc` file in the project root. If you use NVM you can do:

```bash
nvm use
```

Install dependencies:

```bash
pnpm && pnpm husky
```

Build code into `./dist` directory:

```bash
pnpm build
```

Build code with watch:

```bash
pnpm dev
```

## Naming branches

A branch should be called what it does or what it is, e.g. _you created a random number function so the branch could be called `add-random-number-function`_. Keep it simple, understandable, and somewhat short.

## Testing

_Everything should be tested_. The recommended approach is to think what you want to do and author [unit tests](https://en.wikipedia.org/wiki/Unit_testing) using [jest](https://jestjs.io/) that will confirm that you have successfully done it. In addition to unit testing you should also ensure that all of the _end-to-end (e2e) tests_ powered by [playwright](https://playwright.dev/) are still _green_, and in the instance where you have made modifications to the _flow_ add or update the tests accordingly.

Run both **unit** and **e2e** tests _once_:

```bash
pnpm test
```

### Unit tests

Any and all unit tests should be created in `/test/unit` and be named according to what you are testing, e.g. the `createStorageModule.test.ts` is a test for `createStorageModule.ts`.

Run **unit** tests:

```bash
# Once
pnpm test:unit

# Watch for changes
pnpm test:unit --watch
```

### e2e tests

e2e tests should be created in `/test/e2e` and be named to indicate what it is supposed to test, e.g. `oauthPkceFlowIdentityServer.spec.ts`.

Run **e2e** tests:

```bash
pnpm test:e2e
```

Sadly [playwright](https://playwright.dev/) does not currently support a watch mode like [jest](https://jestjs.io/) does so when you want to check if you have broken something or made something work for the very first time you need to rerun `pnpm test:e2e`.

## Release

The library is published to npm and the documentation is published to GitHub pages when a new release tag is created.

To create a new release, create a new branch and set it's upstream origin. Then run:

```bash
pnpm version patch|minor|major # This bumps the version in the versioned files, e.g. pnpm version minor will bump version to the next minor version number
pnpm tag # This will commit the version bump and create a tag in git with the new version. The commit and the tag will be pushed to the origin remote.
```

Create a pull request for the new branch into main.

After the pull request is merged, create a new release tag (with automated changlog in the description).
