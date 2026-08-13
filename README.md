# tracezilla-shopify-typescript

Framework-neutral TypeScript templates for integrating Shopify with the
tracezilla API. The first example implements the read-only, cross-platform
**Compare Catalogs** workflow.

## Hello World: Compare Catalogs

The command paginates both complete catalogs, maps vendor responses to one
shared model, and compares records by SKU code. It reports SKUs present in both
systems and SKUs present only on either side. It never writes to either API.

Differences are a valid result and return exit code `0`. Configuration,
authentication, malformed-response, and API failures return a non-zero code.

## Run with Docker

```bash
cp .env.example .env
```

Fill in `.env`, then build and run the container:

```bash
docker compose build
docker compose run --rm app
```

Pass options after the service name:

```bash
docker compose run --rm app --limit=25
docker compose run --rm app --json
```

Preview or explicitly create missing tracezilla SKUs:

```bash
docker compose run --rm --entrypoint npm app run create-skus -- --limit=10
docker compose run --rm --entrypoint npm app run create-skus -- --execute --confirm --limit=1
```

The complete catalogs are always compared. `--limit` controls only the maximum
number of rows displayed from each result category; it defaults to 10. JSON
output contains the complete result arrays.

List all Shopify locations (read-only):

```bash
docker compose run --rm --entrypoint npm app run locations --
docker compose run --rm --entrypoint npm app run locations -- --json
```

Synchronize inventory with an explicit source and target (dry run by default):

```bash
docker compose run --rm --entrypoint npm app run inventory -- \
  --shopify-location=gid://shopify/Location/123 --tracezilla-warehouse=2 --limit=10
```

Writes additionally require `--execute --confirm`.

## Local development and tests

The application runs entirely in its Docker image, so Node.js is not required
on the host:

```bash
docker compose run --rm --entrypoint npm app test
docker compose run --rm --entrypoint npm app run typecheck
```

Tests use in-memory readers and mappers and never contact either API.

## Design

```text
GraphQL query -> Shopify client -> catalog service -> mapper --+
                                                              +-> CompareCatalogs
tracezilla API -> tracezilla client -> catalog service -> mapper+
```

- Query modules contain Shopify GraphQL documents.
- API clients own authentication and HTTP transport.
- Catalog services own retrieval and pagination.
- Mappers convert vendor payloads to the shared `CatalogItem` model.
- The workflow contains only normalization and comparison rules.
- The CLI assembles dependencies and selects table or JSON output.

This is ordinary TypeScript using the Node.js Fetch API—no web application
framework. Canonical setup and safety guidance lives in the
[Tracezilla Integrations documentation](https://happy-bananas.github.io/tracezilla-integrations-docs/).

## Configuration safety

- Never commit `.env`; Git and Docker both ignore it.
- Start with a development Shopify store and test tracezilla team.
- This workflow needs only Shopify `read_products` access.
- Never print API credentials or access tokens.
