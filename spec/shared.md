# Shared

`shared/` is the only project-level place where grouping **by kind of code** is correct: there are no features here, only horizontal capabilities.

## Groups

```text
shared/
├── ui/       # portable primitives — no product knowledge
├── lib/      # pure helpers and infra wrappers
├── api/      # transport: base client, interceptors
├── model/    # infra state: store/query client, env, flags
└── domain/   # optional global business types
```

| Group | MUST put | MUST NOT put |
| --- | --- | --- |
| `ui/` | Buttons, inputs, layout primitives, icons | Components that know orders/users/carts |
| `lib/` | Dates, formatting, i18n helpers, storage | One-off helpers used by a single module |
| `api/` | Base HTTP/WS client, auth plumbing, transport errors | Feature-specific endpoints (those live in the module `api/`) |
| `model/` | Query client, route constants, env/config | Feature business state |
| `domain/` | Shared business types (`User`, `Money`, branded IDs) | Types owned by one module |

## Recommended internal matrix

```text
domain → (nothing)
lib    → domain
api    → lib, domain
model  → api, lib, domain
ui     → lib, domain          (✗ api, ✗ model)
```

Groups have different stability and rights: `domain` changes rarely and depends on nothing; `ui` MUST stay portable (no network, no global product state).

## Public surface

Everything in `shared/` is public by default — the layer exists to be consumed. The `public/` folder pattern is **not** required here. Privacy appears at stage 4 when a group becomes a package with `exports`.

## Growth rules

- Start nearly empty. Bootstrap infra (base API client, config, first UI primitives) MAY exist from day one when the whole app clearly consumes them.
- Product helpers/components/types enter `shared/` only via the **second-use** rule — “might need later” is an anti-pattern.
- Inside a group, evolve like modules: `ui/button.tsx` → `ui/button/` as files grow.
- `ui` and `api` are the least stable residents; they are first candidates for stage-4 packages.

## Relation to modules

If a helper in `shared/` has only one consumer, SHOULD move it back into that module (colocation). Doctor signal: see [evolution.md](./evolution.md).
