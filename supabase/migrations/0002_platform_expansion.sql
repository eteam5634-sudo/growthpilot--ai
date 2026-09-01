-- GrowthPilot AI platform expansion
-- Adds audit description, agency clients, competitor analyses, report chat, and settings

alter table public.audits
  add column if not exists business_description text,
  add column if not exists client_id uuid;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  website_url text,
  industry text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'audits_client_id_fkey'
  ) then
    alter table public.audits
      add constraint audits_client_id_fkey
      foreign key (client_id) references public.clients (id) on delete set null;
  end if;
end $$;

create table if not exists public.competitor_analyses (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.report_messages (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.users (id) on delete cascade,
  company_name text,
  workspace_type text not null default 'solo'
    check (workspace_type in ('solo', 'agency')),
  default_industry text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_id_idx on public.clients (user_id, created_at desc);
create index if not exists client_notes_client_id_idx on public.client_notes (client_id, created_at desc);
create index if not exists competitor_analyses_audit_id_idx on public.competitor_analyses (audit_id, created_at desc);
create index if not exists report_messages_audit_id_idx on public.report_messages (audit_id, created_at);
create index if not exists audits_client_id_idx on public.audits (client_id);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.client_notes enable row level security;
alter table public.competitor_analyses enable row level security;
alter table public.report_messages enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "clients_all_own" on public.clients;
create policy "clients_all_own" on public.clients
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "client_notes_all_own" on public.client_notes;
create policy "client_notes_all_own" on public.client_notes
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "competitor_analyses_all_own" on public.competitor_analyses;
create policy "competitor_analyses_all_own" on public.competitor_analyses
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "report_messages_all_own" on public.report_messages;
create policy "report_messages_all_own" on public.report_messages
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_settings_all_own" on public.user_settings;
create policy "user_settings_all_own" on public.user_settings
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.clients to authenticated;
grant select, insert, update, delete on table public.client_notes to authenticated;
grant select, insert, update, delete on table public.competitor_analyses to authenticated;
grant select, insert, update, delete on table public.report_messages to authenticated;
grant select, insert, update, delete on table public.user_settings to authenticated;
