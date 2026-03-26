-- Run in Supabase SQL editor. Use the service role key only on the server.

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  time text not null,
  created_at timestamptz default now()
);

-- Optional: index for recent lookups
create index if not exists appointments_created_at_idx on appointments (created_at desc);
