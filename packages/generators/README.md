# @arche-cms/generators

Code generation pipeline. Orchestrates all code generators (types, routes, validation, migrations, GraphQL, OpenAPI, SDK, admin forms).

## Installation

```bash
yarn add @arche-cms/generators
```

## Usage

```ts
import { GenerationPipeline } from "@arche-cms/generators";

const pipeline = new GenerationPipeline({
  collections,
  globals,
  outputDir: "./generated",
});

await pipeline.generate({
  types: true,
  apiRoutes: true,
  validation: true,
  migrations: true,
  graphql: true,
  openapi: true,
  sdk: true,
  adminForms: true,
});
```

## Individual Generators

Each generator can be used independently:

```ts
import { TypeGenerator } from "@arche-cms/generators";
import { ApiRouteGenerator } from "@arche-cms/generators";
import { ValidationGenerator } from "@arche-cms/generators";
import { MigrationGenerator } from "@arche-cms/generators";
import { GraphQLGenerator } from "@arche-cms/generators";
import { OpenApiGenerator } from "@arche-cms/generators";
import { SdkGenerator } from "@arche-cms/generators";
import { AdminFormGenerator } from "@arche-cms/generators";
```

## Generator Interface

```ts
interface Generator {
  name: string;
  generate(schemas: {
    collections: CollectionDefinition[];
    globals?: GlobalDefinition[];
  }): Promise<void>;
}
```
