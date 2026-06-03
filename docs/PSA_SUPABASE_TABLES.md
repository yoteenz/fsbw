# PSA — Supabase tables (current + roadmap)

Run migrations in **Supabase → SQL Editor** (in order when setting up fresh).

## Required now

| Migration | Table | Purpose |
|-----------|--------|---------|
| `20260603180000_priority_messages.sql` | **`priority_messages`** | Concierge + PSA `send_priority_message` inbox |
| `20260604120000_security_profiles_orders_guard.sql` | *(trigger + RLS)* | Block client self-upgrade; orders write via webhook only |
| `20260605120000_psa_message_usage.sql` | **`psa_message_usage`** | Tier-based PSA chat limits (daily + monthly counters) |

### `priority_messages` columns

- `user_id`, `client_email`, `client_name`, `message`
- `is_order_related`, `is_urgent`, `related_order_id`
- `status` (`new` \| `read` \| `archived`)
- `source` (`concierge` \| `psa`)

**API:**

- Member: `POST /api/client/priority-messages`
- Admin: `GET` / `PATCH /api/admin/priority-messages`

### PSA engagement limits (server)

| Tier | Monthly | Daily burst |
|------|---------|-------------|
| 3 month premium | 45 | 10 |
| 6 month premium | 90 | 18 |
| 12 month / BLACK | 180 | 30 |

Enforced in `POST /api/psa/chat` via `psa_try_consume_message` RPC. Remaining allowance: `GET /api/psa/usage`.

## Already in project (non-PSA but PSA reads)

| Table | PSA use |
|-------|---------|
| `profiles` | Premium gate, member name |
| `orders` | `get_member_orders`, `get_order_status` tools |
| `cart` | `get_member_cart`, `add_to_cart` tools |
| `meetings` / consult quotes | Booking handoff (via existing booking APIs) |

## Recommended next (PSA v3)

| Table | Purpose |
|-------|---------|
| **`psa_threads`** | One row per member chat thread (`user_id`, `title`, `created_at`, `updated_at`) |
| **`psa_messages`** | Messages (`thread_id`, `role` user/assistant, `content`, `openai_response_id`, `created_at`) |
| **`psa_member_context`** | Optional snapshot JSON (tier, active orders, cart summary) refreshed each session |

Example skeleton (not shipped yet):

```sql
create table public.psa_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.psa_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.psa_threads (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  openai_response_id text,
  created_at timestamptz not null default now()
);
```

Enable RLS: members `select/insert` own threads; messages via thread ownership.

## Verify migrations

```sql
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('priority_messages', 'profiles', 'orders', 'cart');
```

After `priority_messages`:

```sql
select count(*) from public.priority_messages;
```
