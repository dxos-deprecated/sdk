# DXOS SDK

![Github Actions](https://github.com/dxos/arena/workflows/CI/badge.svg)
<!-- (Not available for private repos) ![Coverage](https://img.shields.io/nycrc/dxos/sdk?preferredThreshold=lines)  -->
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

| Module   | Status | Public URL |
| -------- | ------ | ---------- |
| DXOS SDK | [![Netlify Status](https://api.netlify.com/api/v1/badges/3caf9dc7-15b9-42e6-b016-3fda6a3e8612/deploy-status)](https://app.netlify.com/sites/dxos-docs-sdk/deploys) | https://dxos-docs.netlify.app/sdk |

## Usage

NOTE: Requires Node version 12.

```bash
yarn
yarn build
yarn test
```

### Publishing a release

We use release-please and a CI job to perform version bumps and NPM releases.

TODO: link a page with more detailed explanation.

To publish new versions merge the `main` branch into `beta` branch:

```bash
git checkout beta
git reset —hard
git merge -X theirs main
git push
```

The CI will do the rest of the work.

## Contributing

PRs accepted.

## License


AGPL-3.0 © DXOS
