# Contributing

## How does it work?

Once a day a scheduled GitHub action downloads <https://schemastore.org/api/json/catalog.json>. This
is then processed by a build script to generate the `#/contributes/jsonValitation` section in the
`package.json` file of this extension. If there are any changes, a new patch release is made
automatically.

## How to register a JSON schema?

JSON schemas can be submitted to [JSON Schema Store](https://github.com/SchemaStore/schemastore).
Please read
[their contributing guidelines](https://github.com/SchemaStore/schemastore/blob/HEAD/CONTRIBUTING.md)
to get started.
