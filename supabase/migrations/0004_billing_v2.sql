-- GrowthPilot billing v2: expanded plans, usage limits, indexes, account status

alter table public.users
  add column if not exists account_status text not null default 'active'
    check (account_status in ('active', 'suspended'));

alter table public.usage_limits
  add column if not exists competitor_reports_used integer not null default 0,
  add column if not exists competitor_reports_limit integer,
  add column if not exists audits_limit integer,
  add column if not exists month_year text;

alter table public.subscriptions
  add column if not exists started_at timestamptz,
  add column if not exists expires_at timestamptz;

alter table public.payments
  add column if not exists payment_method text,
  add column if not exists stripe_payment_intent text;

-- Expand plan values (migrate legacy pro -> professional)
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.usage_limits drop constraint if exists usage_limits_plan_check;

update public.subscriptions set plan = 'professional' where plan = 'pro';
update public.usage_limits set plan = 'professional' where plan = 'pro';

alter table public.subscriptions
  add constraint subscriptions_plan_check
  check (plan in ('free', 'starter', 'professional', 'agency'));

alter table public.usage_limits
  add constraint usage_limits_plan_check
  check (plan in ('free', 'starter', 'professional', 'agency'));

update public.subscriptions
set started_at = coalesce(started_at, created_at),
    expires_at = coalesce(expires_at, current_period_end)
where started_at is null or expires_at is null;

update public.usage_limits
set month_year = to_char(period_start, 'YYYY-MM')
where month_year is null;

-- Default limits by plan
update public.usage_limits ul
set
  audits_limit = case ul.plan
    when 'free' then 5
    when 'starter' then 25
    when 'professional' then 100
    else null
  end,
  competitor_reports_limit = case ul.plan
    when 'free' then 2
    when 'starter' then 10
    when 'professional' then 50
    else null
  end
where audits_limit is null;

create index if not exists audits_user_created_idx on public.audits (user_id, created_at desc);
create index if not exists audits_status_idx on public.audits (user_id, status, created_at desc);
create index if not exists reports_created_idx on public.reports (created_at desc);
create index if not exists clients_user_created_idx on public.clients (user_id, created_at desc);
create index if not exists client_notes_created_idx on public.client_notes (created_at desc);
create index if not exists competitor_analyses_user_idx on public.competitor_analyses (user_id, created_at desc);
create index if not exists report_messages_audit_idx on public.report_messages (audit_id, created_at);
create index if not exists payments_user_created_idx on public.payments (user_id, created_at desc);
create index if not exists subscriptions_user_idx on public.subscriptions (user_id);
create index if not exists users_account_status_idx on public.users (account_status);
