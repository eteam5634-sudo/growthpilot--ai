-- GrowthPilot AI initial schema
-- Tables: public.users, public.audits, public.reports

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  website_url text not null,
  business_name text not null,
  industry text not null,
  overall_score integer,
  status text not null default 'pending'
    check (status in ('pending', 'analyzing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint audits_overall_score_range check (
    overall_score is null or (overall_score >= 0 and overall_score <= 100)
  )
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null unique references public.audits (id) on delete cascade,
  seo_score integer not null check (seo_score >= 0 and seo_score <= 100),
  conversion_score integer not null check (conversion_score >= 0 and conversion_score <= 100),
  ux_score integer not null check (ux_score >= 0 and ux_score <= 100),
  trust_score integer not null check (trust_score >= 0 and trust_score <= 100),
  brand_score integer not null check (brand_score >= 0 and brand_score <= 100),
  category_details jsonb not null default '{}'::jsonb,
  executive_summary jsonb not null default '{}'::jsonb,
  strengths jsonb not null default '[]'::jsonb,
  weaknesses jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  growth_plan jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audits_user_id_created_at_idx
  on public.audits (user_id, created_at desc);

create index if not exists audits_status_idx
  on public.audits (status);

create index if not exists reports_audit_id_idx
  on public.reports (audit_id);

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists audits_set_updated_at on public.audits;
create trigger audits_set_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.users.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;
alter table public.audits enable row level security;
alter table public.reports enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own"
  on public.users for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "audits_select_own" on public.audits;
create policy "audits_select_own"
  on public.audits for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "audits_insert_own" on public.audits;
create policy "audits_insert_own"
  on public.audits for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "audits_update_own" on public.audits;
create policy "audits_update_own"
  on public.audits for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "audits_delete_own" on public.audits;
create policy "audits_delete_own"
  on public.audits for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
  on public.reports for select
  to authenticated
  using (
    exists (
      select 1
      from public.audits
      where audits.id = reports.audit_id
        and audits.user_id = auth.uid()
    )
  );

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.audits
      where audits.id = reports.audit_id
        and audits.user_id = auth.uid()
    )
  );

drop policy if exists "reports_update_own" on public.reports;
create policy "reports_update_own"
  on public.reports for update
  to authenticated
  using (
    exists (
      select 1
      from public.audits
      where audits.id = reports.audit_id
        and audits.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.audits
      where audits.id = reports.audit_id
        and audits.user_id = auth.uid()
    )
  );

drop policy if exists "reports_delete_own" on public.reports;
create policy "reports_delete_own"
  on public.reports for delete
  to authenticated
  using (
    exists (
      select 1
      from public.audits
      where audits.id = reports.audit_id
        and audits.user_id = auth.uid()
    )
  );

grant usage on schema public to anon, authenticated;
grant select, insert, update on table public.users to authenticated;
grant select, insert, update, delete on table public.audits to authenticated;
grant select, insert, update, delete on table public.reports to authenticated;
