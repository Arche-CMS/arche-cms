# REST API

The CMS auto-generates REST API endpoints for every collection. Each collection gets 5 CRUD routes plus a bulk-delete route.

## Endpoints

| Method | Path                            | Description         |
| ------ | ------------------------------- | ------------------- |
| GET    | `/api/{collection}`             | List entries        |
| GET    | `/api/{collection}/:id`         | Get single entry    |
| POST   | `/api/{collection}`             | Create entry        |
| PATCH  | `/api/{collection}/:id`         | Update entry        |
| DELETE | `/api/{collection}/:id`         | Delete entry        |
| POST   | `/api/{collection}/bulk-delete` | Bulk delete entries |

## Query Parameters

| Parameter      | Type   | Description                          |
| -------------- | ------ | ------------------------------------ |
| `limit`        | number | Page size (default: 10, max: 100)    |
| `offset`       | number | Pagination offset                    |
| `sort`         | string | Sort by field (e.g., `title:desc`)   |
| `select`       | string | Field selection (e.g., `title,body`) |
| `populate`     | string | Relation population (e.g., `author`) |
| `where[field]` | any    | Filter by field value                |

## Example Requests

```bash
# List posts
curl http://localhost:3001/api/posts?limit=10&offset=0

# Get single post with author populated
curl http://localhost:3001/api/posts/1?populate=author

# Create post
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello World", "status": "published"}'

# Filter posts
curl "http://localhost:3001/api/posts?where[status]=published&sort=createdAt:desc"
```

## OpenAPI / Swagger

The REST API is self-documenting via OpenAPI 3.1. Visit `/docs` on your API server to access the Swagger UI.

## Error Responses

| Status | Code                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| 400    | `VALIDATION_ERROR`  | Invalid request body or query params |
| 401    | `UNAUTHORIZED`      | Missing or invalid JWT token         |
| 403    | `FORBIDDEN`         | Insufficient permissions             |
| 404    | `NOT_FOUND`         | Resource not found                   |
| 409    | `CONFLICT`          | Unique constraint violation          |
| 413    | `PAYLOAD_TOO_LARGE` | Request body exceeds limit           |
| 500    | `INTERNAL_ERROR`    | Server error                         |
