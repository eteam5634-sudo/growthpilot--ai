-- GrowthPilot AI SaaS platform
-- Admin roles, analytics, billing, competitors, contact, chat compatibility view

alter table public.users
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin'));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  event text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.competitors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  audit_id uuid not null references public.audits (id) on delete cascade,
  website_url text not null,
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  status text not null default 'active'
    check (status in ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  stripe_payment_id text,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.usage_limits (
  user_id uuid primary key references public.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  audits_used integer not null default 0,
  period_start date not null default date_trunc('month', now())::date,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  message text not null,
  created_at timestamptz not null default now()
);

create or replace view public.chat_messages as
  select
    id,
    user_id,
    audit_id,
    role,
    content as message,
    created_at
  from public.report_messages;

create index if not exists analytics_events_user_id_idx
  on public.analytics_events (user_id, created_at desc);
create index if not exists analytics_events_event_idx
  on public.analytics_events (event, created_at desc);
create index if not exists competitors_audit_id_idx
  on public.competitors (audit_id, created_at desc);
create index if not exists payments_user_id_idx
  on public.payments (user_id, created_at desc);
create index if not exists users_role_idx on public.users (role);
create index if not exists users_email_idx on public.users (email);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
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

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  insert into public.usage_limits (user_id, plan, audits_used, period_start)
  values (new.id, 'free', 0, date_trunc('month', now())::date)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

alter table public.analytics_events enable row level security;
alter table public.competitors enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.usage_limits enable row level security;
alter table public.contact_inquiries enable row level security;

drop policy if exists "analytics_insert_own" on public.analytics_events;
create policy "analytics_insert_own" on public.analytics_events
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "analytics_select_own" on public.analytics_events;
create policy "analytics_select_own" on public.analytics_events
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "competitors_all_own" on public.competitors;
create policy "competitors_all_own" on public.competitors
  for all to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own" on public.subscriptions
  for update to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own" on public.subscriptions
  for insert to authenticated
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select to authenticated
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments
  for insert to authenticated
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "usage_all_own" on public.usage_limits;
create policy "usage_all_own" on public.usage_limits
  for all to authenticated
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "contact_insert_public" on public.contact_inquiries;
create policy "contact_insert_public" on public.contact_inquiries
  for insert to anon, authenticated
  with check (true);

drop policy if exists "contact_select_admin" on public.contact_inquiries;
create policy "contact_select_admin" on public.contact_inquiries
  for select to authenticated
  using (public.is_admin());

drop policy if exists "users_select_admin" on public.users;
create policy "users_select_admin" on public.users
  for select to authenticated
  using (public.is_admin());

drop policy if exists "users_update_admin" on public.users;
create policy "users_update_admin" on public.users
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "audits_select_admin" on public.audits;
create policy "audits_select_admin" on public.audits
  for select to authenticated
  using (public.is_admin());

drop policy if exists "reports_select_admin" on public.reports;
create policy "reports_select_admin" on public.reports
  for select to authenticated
  using (public.is_admin());

drop policy if exists "report_messages_select_admin" on public.report_messages;
create policy "report_messages_select_admin" on public.report_messages
  for select to authenticated
  using (public.is_admin());

grant select, insert on table public.analytics_events to authenticated;
grant select, insert, update, delete on table public.competitors to authenticated;
grant select, insert, update on table public.subscriptions to authenticated;
grant select, insert on table public.payments to authenticated;
grant select, insert, update on table public.usage_limits to authenticated;
grant insert on table public.contact_inquiries to anon, authenticated;
grant select on table public.contact_inquiries to authenticated;
grant select on public.chat_messages to authenticated;
