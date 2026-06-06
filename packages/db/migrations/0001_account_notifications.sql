create extension if not exists pgcrypto;

alter table users add column if not exists name text;
alter table users add column if not exists email_verified timestamptz;
alter table users add column if not exists image text;
alter table users add column if not exists role text not null default 'user';
alter table users add column if not exists notification_in_app boolean not null default true;
alter table users add column if not exists notification_email boolean not null default false;
alter table users add column if not exists updated_at timestamptz not null default now();

create table if not exists accounts (
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  provider text not null,
  provider_account_id text not null,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  primary key (provider, provider_account_id)
);

create table if not exists sessions (
  session_token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires timestamptz not null
);

create table if not exists verification_tokens (
  identifier text not null,
  token text not null,
  expires timestamptz not null,
  primary key (identifier, token)
);

create table if not exists authenticators (
  credential_id text not null unique,
  user_id uuid not null references users(id) on delete cascade,
  provider_account_id text not null,
  credential_public_key text not null,
  counter integer not null,
  credential_device_type text not null,
  credential_backed_up boolean not null,
  transports text,
  primary key (user_id, credential_id)
);

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  address text not null,
  chain text not null default 'genlayer',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists wallets_address_chain_idx on wallets(address, chain);
create index if not exists wallets_user_id_idx on wallets(user_id);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  href text,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on notifications(user_id);
create index if not exists notifications_read_idx on notifications(user_id, read_at);
create index if not exists notifications_created_at_idx on notifications(created_at);
