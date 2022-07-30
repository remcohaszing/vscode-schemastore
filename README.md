# Schema Store Catalog for Visual Studio Code

This extension provides all JSON schemas from the [JSON Schema Store](https://www.schemastore.org)
catalog.

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

- [Even Better TOML](https://github.com/tamasfe/taplo/tree/HEAD/editors/vscode) provides JSON schema
  support for TOML files.
- [YAML](https://github.com/redhat-developer/vscode-yaml) provides JSON schema support for YAML
  files.

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
