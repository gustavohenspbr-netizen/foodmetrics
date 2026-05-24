-- ============================================================
-- FoodMetrics — Schema inicial
-- Multi-tenant: 1 agência (FoodMetrics) + N restaurantes (clients)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- TIPOS ENUM
-- ============================================================
do $$ begin
  create type user_role as enum ('admin', 'manager', 'support', 'client', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_status as enum ('active', 'pending', 'paused', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_status as enum ('lead', 'contacted', 'proposal', 'negotiation', 'won', 'lost');
exception when duplicate_object then null; end $$;

do $$ begin
  create type invoice_status as enum ('paid', 'pending', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type task_status as enum ('todo', 'in_progress', 'review', 'done');
exception when duplicate_object then null; end $$;

do $$ begin
  create type campaign_channel as enum ('google', 'meta', 'tiktok', 'youtube');
exception when duplicate_object then null; end $$;

-- ============================================================
-- USERS (perfis estendidos do auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'client',
  phone text,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger: cria perfil automaticamente ao criar user no auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- CLIENTS (restaurantes)
-- ============================================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,
  email text,
  phone text,
  city text,
  state text,
  avatar text,
  color text default '#e01c1c',
  manager_id uuid references public.profiles(id) on delete set null,
  status client_status not null default 'pending',
  plan text default 'standard',
  mrr numeric(10, 2) default 0,
  health_score integer default 50 check (health_score >= 0 and health_score <= 100),
  joined_at date default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- N:N entre profiles e clients (1 user pode ter acesso a vários clients)
create table if not exists public.client_users (
  client_id uuid references public.clients(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'owner',
  created_at timestamptz not null default now(),
  primary key (client_id, user_id)
);

-- ============================================================
-- INTEGRATIONS (tokens de Google/Meta/iFood por cliente)
-- ============================================================
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  account_id text,
  account_name text,
  scopes text[],
  expires_at timestamptz,
  connected_at timestamptz default now(),
  last_sync_at timestamptz,
  status text default 'connected',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_id, provider)
);

-- ============================================================
-- CAMPAIGNS (snapshot diário de campanhas)
-- ============================================================
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  channel campaign_channel not null,
  external_id text,
  name text not null,
  status text default 'active',
  budget_daily numeric(10, 2),
  objective text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Métricas diárias por campanha
create table if not exists public.metrics_daily (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  channel campaign_channel,
  date date not null,
  impressions bigint default 0,
  clicks bigint default 0,
  spend numeric(12, 2) default 0,
  conversions integer default 0,
  revenue numeric(12, 2) default 0,
  reach bigint default 0,
  ctr numeric(6, 4),
  cpa numeric(10, 2),
  roas numeric(8, 2),
  created_at timestamptz not null default now(),
  unique(campaign_id, date)
);

create index if not exists idx_metrics_daily_client_date on public.metrics_daily(client_id, date desc);
create index if not exists idx_metrics_daily_campaign_date on public.metrics_daily(campaign_id, date desc);

-- ============================================================
-- iFOOD
-- ============================================================
create table if not exists public.ifood_orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  external_id text,
  ordered_at timestamptz not null,
  total numeric(10, 2) not null,
  status text,
  items jsonb,
  customer_id text,
  delivery_neighborhood text,
  rating integer,
  cancelled boolean default false,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  unique(client_id, external_id)
);

create index if not exists idx_ifood_orders_client_date on public.ifood_orders(client_id, ordered_at desc);
create index if not exists idx_ifood_orders_neighborhood on public.ifood_orders(client_id, delivery_neighborhood);

-- ============================================================
-- REVIEWS (iFood + Google Meu Negócio)
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  source text not null,
  external_id text,
  customer_name text,
  rating integer check (rating between 1 and 5),
  comment text,
  reply text,
  replied_at timestamptz,
  replied_by uuid references public.profiles(id) on delete set null,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_client_posted on public.reviews(client_id, posted_at desc);

-- ============================================================
-- CRM
-- ============================================================
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text,
  source text,
  value numeric(10, 2) default 0,
  status lead_status not null default 'lead',
  owner_id uuid references public.profiles(id) on delete set null,
  notes text,
  converted_client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_status on public.leads(status);

-- ============================================================
-- CONTRACTS & INVOICES
-- ============================================================
create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  scope text,
  monthly_value numeric(10, 2) not null,
  start_date date not null,
  end_date date,
  signed boolean default false,
  signed_at timestamptz,
  document_url text,
  status text default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  description text,
  amount numeric(10, 2) not null,
  status invoice_status not null default 'pending',
  payment_method text,
  due_date date not null,
  paid_at timestamptz,
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invoices_client_due on public.invoices(client_id, due_date desc);
create index if not exists idx_invoices_status on public.invoices(status);

-- ============================================================
-- TASKS & EVENTS
-- ============================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  title text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete set null,
  status task_status not null default 'todo',
  priority text default 'medium',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_owner_status on public.tasks(owner_id, status);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  description text,
  type text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  attendees uuid[],
  created_by uuid references public.profiles(id) on delete set null,
  external_calendar_id text,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_starts_at on public.events(starts_at);

-- ============================================================
-- MESSAGES / CHAT
-- ============================================================
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  subject text,
  last_message_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_type text not null default 'agency',
  content text not null,
  attachments jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conv_created on public.messages(conversation_id, created_at desc);

-- ============================================================
-- MATERIALS
-- ============================================================
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  file_url text,
  thumbnail_url text,
  size text,
  status text default 'draft',
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- REPORTS
-- ============================================================
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  period_start date not null,
  period_end date not null,
  document_url text,
  status text default 'draft',
  author_id uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- STRATEGY (metas, iniciativas)
-- ============================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  label text not null,
  target numeric(14, 2) not null,
  current numeric(14, 2) default 0,
  format text default 'number',
  period_month date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.initiatives (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  status text default 'pending',
  owner_id uuid references public.profiles(id) on delete set null,
  deadline date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  link text,
  metadata jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_recipient on public.notifications(recipient_id, created_at desc);

-- ============================================================
-- AUDIT LOG
-- ============================================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  changes jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_log_entity on public.audit_log(entity_type, entity_id);

-- ============================================================
-- TRIGGER: updated_at automático
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Aplica em todas as tabelas com updated_at
do $$
declare
  t text;
begin
  for t in
    select table_name
    from information_schema.columns
    where table_schema = 'public'
      and column_name = 'updated_at'
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;
