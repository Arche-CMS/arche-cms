# CLI Usage

## Commands

| Command                 | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `cms dev`               | Start CMS in development mode with file watching |
| `cms build`             | Build CMS for production                         |
| `cms generate`          | Run code generation pipeline                     |
| `cms migrate`           | Generate and run database migrations             |
| `cms typegen`           | Generate TypeScript types from schemas           |
| `cms lint`              | Validate schema definitions                      |
| `cms doctor`            | Check project health                             |
| `cms collection create` | Scaffold a new collection                        |
| `cms plugin create`     | Scaffold a new plugin                            |

## Quick Start

```bash
# Start development
cms dev

# Check your setup
cms doctor

# Scaffold a collection
cms collection create posts

# Generate types and APIs
cms generate

# Run migrations
cms migrate

# Build for production
cms build
```
