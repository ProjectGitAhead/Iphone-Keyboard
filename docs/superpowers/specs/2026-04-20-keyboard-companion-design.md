# Keyboard Companion MVP Design

## Context

The repository currently has no application source code. This design defines the first runnable product slice: a web-based keyboard companion app focused on managing keyboard content for iOS custom keyboard workflows.

## Goal

Ship a hybrid MVP that is frontend-first and backend-ready:

- Build a complete UI and local persistence now.
- Keep clear boundaries so a real backend can be added with minimal rewrite.

## Product Scope (MVP)

### In Scope

1. View all keyboard content entries in a searchable list.
2. Create a content entry with:
   - `label`: display name
   - `shortcut`: trigger string
   - `content`: expanded text
   - `category` (optional)
3. Edit and delete entries.
4. Filter entries by category.
5. Import/export all entries as JSON for manual backup and restore.

### Out of Scope

- User authentication
- Cloud sync
- Multi-device conflict resolution
- Keyboard usage analytics
- Native iOS app integration APIs

## Architecture

### Tech Stack

- React + TypeScript + Vite
- React Query for async data state patterns
- Local storage for persisted MVP data
- Vitest + React Testing Library for tests

### Project Structure

```
src/
  app/
  domain/
  data/
  features/keyboard-content/
  components/
  test/
```

### Layering

1. `domain/`: core types and validation rules.
2. `data/`: repository contract and adapters.
3. `features/keyboard-content/`: feature hooks and UI composition.
4. `components/`: shared UI primitives.

### Repository Boundary

Define a `KeyboardContentRepository` interface:

- `listEntries()`
- `createEntry(input)`
- `updateEntry(id, input)`
- `deleteEntry(id)`
- `replaceAll(entries)` (import)

Implementations:

- `LocalStorageKeyboardContentRepository` (active in MVP)
- `ApiKeyboardContentRepository` (scaffolded placeholder for future backend)

The UI and feature hooks depend only on the interface, not adapter details.

### Data Model

`KeyboardEntry`:

- `id: string`
- `label: string`
- `shortcut: string`
- `content: string`
- `category?: string`
- `createdAt: string`
- `updatedAt: string`

Persisted payload includes:

- `schemaVersion: number`
- `entries: KeyboardEntry[]`

### Validation and Rules

- `label` required
- `shortcut` required
- `shortcut` must be unique (case-insensitive)
- `content` required
- `category` optional and free-form

Import validation:

- Valid JSON
- Correct payload shape
- Compatible `schemaVersion`
- Entry-level validation for each item

## UX and Components

### Layout

- Header: app title, import/export actions
- Sidebar: category filters with counts
- Main: search input + entry list
- Modal/Drawer: create/edit form

### Key Components

- `AppShell`
- `CategoryFilter`
- `ContentList`
- `ContentForm`
- `ImportExportPanel`
- `ConfirmDeleteDialog`

### Data Flow

1. UI events call feature hooks (`useKeyboardContent`).
2. Hooks call `KeyboardContentRepository`.
3. Repository returns typed domain entities or throws typed errors.
4. React Query handles loading, mutation state, and cache invalidation.

### Error Handling

- Inline form errors for field validation.
- Toast/banner for repository operation failures.
- Explicit import failure reasons:
  - invalid JSON
  - schema mismatch
  - duplicate/invalid shortcuts

## Testing Strategy

### Unit Tests

- Domain validation rules.
- Local storage repository behavior.

### Component/Integration Tests

- Create/edit/delete flow.
- Search and category filtering.
- Import/export success and failure behavior.

### Manual Smoke Verification

1. Start app locally.
2. Add entries and categories.
3. Refresh page and verify persistence.
4. Export data, clear state, import backup, verify equality.

## Migration Readiness

- Keep `ApiKeyboardContentRepository` scaffold and data source switch point.
- Use async interface even for local adapter to preserve API parity.
- Keep domain validation reusable by future backend adapter responses.

## Success Criteria

1. A new developer can run the app with standard frontend commands.
2. Users can fully manage keyboard content locally.
3. Data persists across reloads.
4. Import/export provides manual backup safety.
5. Replacing local adapter with API adapter does not require UI rewrite.
