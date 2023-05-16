# Schema Store Catalog for Visual Studio Code

[![github actions](https://github.com/remcohaszing/vscode-schemastore/actions/workflows/ci.yaml/badge.svg)](https://github.com/remcohaszing/vscode-schemastore/actions/workflows/ci.yaml)
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/remcohaszing.schemastore)](https://marketplace.visualstudio.com/items?itemName=remcohaszing.schemastore)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/remcohaszing.schemastore)](https://marketplace.visualstudio.com/items?itemName=remcohaszing.schemastore)
[![Open VSX Version](https://img.shields.io/open-vsx/v/remcohaszing/schemastore)](https://open-vsx.org/extension/remcohaszing/schemastore)
[![Open VSX Downloads](https://img.shields.io/open-vsx/dt/remcohaszing/schemastore)](https://open-vsx.org/extension/remcohaszing/schemastore)

This extension provides all JSON schemas from the [JSON Schema Store](https://www.schemastore.org)
catalog.

## Table of Contents

- [What is this?](#what-is-this)
- [Installation](#installation)
- [Contributing](#contributing)
- [Security](#security)
- [See also](#see-also)
- [License](#license)

## What is this?

[JSON Schema Store](https://www.schemastore.org) keeps a catalog of JSON schemas of well known JSON
files. Visual Studio Code supports JSON schema validation by default and allows extensions to
register them, but it doesn’t use the JSON Schema Store catalog. This extension is updated daily to
provide JSON schema for all schemas in the catalog.

## Installation

In Visual Studio Code open the command palette using <kbd>Ctrl</kbd> + <kbd>P</kbd>, paste the
following command, and press <kbd>Enter</kbd>.

```
ext install remcohaszing.schemastore
```

## Contributing

See the [contributing](CONTRIBUTING.md) document.

## Security

By installing this extension you trust the contents provided by JSON Schema Store.

## See also

- [Even Better TOML](https://github.com/tamasfe/taplo/tree/HEAD/editors/vscode) provides support for
  JSON schema and the JSON schema store catalog for TOML files.
- [YAML](https://github.com/redhat-developer/vscode-yaml) provides support for JSON schema and the
  JSON schema store catalog for YAML files.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
