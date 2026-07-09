# GraphQL API

The CMS auto-generates a GraphQL API with queries, mutations, and subscriptions for every collection. Accessible via `/graphql` with an interactive GraphiQL playground at `/graphiql`.

## Schema

Each collection generates corresponding GraphQL types:

```graphql
type Post {
  id: ID!
  title: String!
  slug: String
  content: JSON
  author: User
  status: PostStatus
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum PostStatus {
  draft
  published
}

input PostCreateInput {
  title: String!
  slug: String
  content: JSON
  author: ID
  status: PostStatus
}

input PostUpdateInput {
  title: String
  slug: String
  content: JSON
  author: ID
  status: PostStatus
}

input PostFilter {
  title: StringFilter
  status: PostStatusFilter
  # ... field filters
}

enum PostSort {
  title_asc
  title_desc
  createdAt_asc
  createdAt_desc
}
```

## Queries

```graphql
type Query {
  posts(limit: Int, offset: Int, sort: PostSort, filter: PostFilter): [Post!]!
  post(id: ID!): Post
}
```

## Mutations

```graphql
type Mutation {
  createPost(input: PostCreateInput!): Post!
  updatePost(id: ID!, input: PostUpdateInput!): Post!
  deletePost(id: ID!): Post!
}
```

## Example Queries

```graphql
# List posts with author
query {
  posts(limit: 10, sort: createdAt_desc) {
    id
    title
    author {
      id
      name
    }
  }
}

# Get single post
query {
  post(id: "1") {
    title
    content
    status
  }
}

# Create post
mutation {
  createPost(input: { title: "Hello World", status: published }) {
    id
    title
  }
}
```
