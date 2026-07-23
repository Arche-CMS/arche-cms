# @arche-cms/cms-firebase

Firebase backend for Arche CMS. Provides Firestore-backed content, auth, media, globals, activity, users, and roles via the `AdminProvider` interface.

## Installation

```bash
pnpm add @arche-cms/cms-firebase
```

## Environment Variables

```env
VITE_BACKEND_MODE=firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## Usage

```ts
import { createFirebaseProvider } from "@arche-cms/cms-firebase";

const provider = createFirebaseProvider({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});
```

## Capabilities (MVP)

| Feature                        | Status |
| ------------------------------ | ------ |
| Auth (email/password)          | Done   |
| Collections (CRUD + bulk)      | Done   |
| Globals (read/write)           | Done   |
| Media (upload/list/delete)     | Done   |
| Media folders                  | Done   |
| Draft / publish workflow       | Done   |
| Soft delete                    | Done   |
| Version history                | Done   |
| Activity log                   | Done   |
| Users CRUD                     | Done   |
| Roles CRUD                     | Done   |
| RBAC (admin/editor/viewer)     | Done   |
| Query filters (eq/ne/gt/lt/in) | Done   |
| Search (prefix matching)       | Done   |
| Localization                   | Done   |
| Content relations              | Todo   |
| Deep population                | Todo   |
| Component schemas              | Todo   |
| Dynamic zones                  | Todo   |
| Plugin hooks                   | Todo   |
| Webhook triggers               | Todo   |
| Scheduled publishing           | Todo   |
| Full-text search               | Todo   |

## Firestore Indexes

Composite indexes are defined in `firestore.indexes.json`. Deploy with:

```bash
firebase deploy --only firestore:indexes
```

## Security Rules

RBAC security rules are in `firestore.rules` and `storage.rules`. Deploy with:

```bash
firebase deploy --only firestore:rules,storage
```

Role claims must be set on Firebase Auth users:

| Role   | Permissions                                   |
| ------ | --------------------------------------------- |
| admin  | Full access (`*:*`)                           |
| editor | Create, read, update (`create/read/update:*`) |
| viewer | Read only (`read:*`)                          |

## Architecture

```
src/
├── config.ts         # Firebase config (import.meta.env)
├── firebase.ts       # Firebase app + Firestore init
├── auth.ts           # Auth provider (login, register, claims)
├── content.ts        # Collections + globals provider
├── media.ts          # Media + folders provider
├── users.ts          # Users provider
├── roles.ts          # Roles provider
├── activity.ts       # Activity log provider
├── provider.ts       # AdminProvider composition + activity hooks
├── query-builder.ts  # Firestore query filters
└── index.ts          # Barrel exports
```

## Testing

Tests require the Firebase emulator suite. Start emulators:

```bash
firebase emulators:start
```

Then run:

```bash
pnpm test
```

## Security

- All writes require authenticated Firebase Auth
- Role checks enforced via custom claims in Firestore rules
- Storage uploads gated by auth (10MB limit)
- Admin-only for deletes and user/role management
