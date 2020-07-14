# DXOS SDK

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

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

### Publishing to npm

To publish new versions of all public packages to the beta channel:

```bash
yarn build
yarn test
yarn lerna publish prerelease --dist-tag="beta" --force-publish
```

## Contributing

PRs accepted.

## License

GPL-3.0 © DXOS
