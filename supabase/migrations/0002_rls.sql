-- ============================================================
-- ROW LEVEL SECURITY
-- Política: admin/manager/support vê tudo; client vê só os seus
-- ============================================================

-- Função helper: retorna o role do usuário atual
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- Função helper: retorna true se for da equipe (admin/manager/support)
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role::text in ('admin', 'manager', 'support') from public.profiles where id = auth.uid()),
    false
  )
$$;

-- Função helper: retorna ids dos clients que o usuário atual tem acesso
create or replace function public.my_client_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id from public.client_users where user_id = auth.uid()
$$;

-- ============================================================
-- HABILITAR RLS
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.clients       enable row level security;
alter table public.client_users  enable row level security;
alter table public.integrations  enable row level security;
alter table public.campaigns     enable row level security;
alter table public.metrics_daily enable row level security;
alter table public.ifood_orders  enable row level security;
alter table public.reviews       enable row level security;
alter table public.leads         enable row level security;
alter table public.contracts     enable row level security;
alter table public.invoices      enable row level security;
alter table public.tasks         enable row level security;
alter table public.events        enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;
alter table public.materials     enable row level security;
alter table public.reports       enable row level security;
alter table public.goals         enable row level security;
alter table public.initiatives   enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log     enable row level security;

-- ============================================================
-- PROFILES — usuário lê o próprio; staff lê todos
-- ============================================================
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update
  using (auth.uid() = id or public.is_staff());

drop policy if exists "profiles_staff_insert" on public.profiles;
create policy "profiles_staff_insert"
  on public.profiles for insert
  with check (public.is_staff() or auth.uid() = id);

-- ============================================================
-- CLIENTS — staff vê todos; client vê os vinculados
-- ============================================================
drop policy if exists "clients_read" on public.clients;
create policy "clients_read"
  on public.clients for select
  using (public.is_staff() or id in (select public.my_client_ids()));

drop policy if exists "clients_staff_write" on public.clients;
create policy "clients_staff_write"
  on public.clients for all
  using (public.is_staff())
  with check (public.is_staff());

-- ============================================================
-- CLIENT_USERS
-- ============================================================
drop policy if exists "client_users_read" on public.client_users;
create policy "client_users_read"
  on public.client_users for select
  using (public.is_staff() or user_id = auth.uid());

drop policy if exists "client_users_staff_write" on public.client_users;
create policy "client_users_staff_write"
  on public.client_users for all
  using (public.is_staff())
  with check (public.is_staff());

-- ============================================================
-- Macro: política padrão "staff vê tudo, client vê só os seus" via client_id
-- ============================================================
-- Aplicado individualmente nas tabelas com client_id:

-- INTEGRATIONS
drop policy if exists "integrations_read" on public.integrations;
create policy "integrations_read"
  on public.integrations for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "integrations_staff_write" on public.integrations;
create policy "integrations_write"
  on public.integrations for all 
  using (public.is_staff() or client_id in (select public.my_client_ids())) 
  with check (public.is_staff() or client_id in (select public.my_client_ids()));

-- CAMPAIGNS
drop policy if exists "campaigns_read" on public.campaigns;
create policy "campaigns_read"
  on public.campaigns for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "campaigns_staff_write" on public.campaigns;
create policy "campaigns_staff_write"
  on public.campaigns for all using (public.is_staff()) with check (public.is_staff());

-- METRICS_DAILY
drop policy if exists "metrics_read" on public.metrics_daily;
create policy "metrics_read"
  on public.metrics_daily for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "metrics_staff_write" on public.metrics_daily;
create policy "metrics_staff_write"
  on public.metrics_daily for all using (public.is_staff()) with check (public.is_staff());

-- iFood
drop policy if exists "ifood_orders_read" on public.ifood_orders;
create policy "ifood_orders_read"
  on public.ifood_orders for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "ifood_orders_staff_write" on public.ifood_orders;
create policy "ifood_orders_staff_write"
  on public.ifood_orders for all using (public.is_staff()) with check (public.is_staff());

-- REVIEWS
drop policy if exists "reviews_read" on public.reviews;
create policy "reviews_read"
  on public.reviews for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "reviews_write" on public.reviews;
create policy "reviews_write"
  on public.reviews for all
  using (public.is_staff() or client_id in (select public.my_client_ids()))
  with check (public.is_staff() or client_id in (select public.my_client_ids()));

-- LEADS — só staff
drop policy if exists "leads_staff" on public.leads;
create policy "leads_staff"
  on public.leads for all using (public.is_staff()) with check (public.is_staff());

-- CONTRACTS
drop policy if exists "contracts_read" on public.contracts;
create policy "contracts_read"
  on public.contracts for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "contracts_staff_write" on public.contracts;
create policy "contracts_staff_write"
  on public.contracts for all using (public.is_staff()) with check (public.is_staff());

-- INVOICES
drop policy if exists "invoices_read" on public.invoices;
create policy "invoices_read"
  on public.invoices for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "invoices_staff_write" on public.invoices;
create policy "invoices_staff_write"
  on public.invoices for all using (public.is_staff()) with check (public.is_staff());

-- TASKS — staff
drop policy if exists "tasks_staff" on public.tasks;
create policy "tasks_staff"
  on public.tasks for all using (public.is_staff()) with check (public.is_staff());

-- EVENTS
drop policy if exists "events_read" on public.events;
create policy "events_read"
  on public.events for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "events_staff_write" on public.events;
create policy "events_staff_write"
  on public.events for all using (public.is_staff()) with check (public.is_staff());

-- CONVERSATIONS
drop policy if exists "conversations_read" on public.conversations;
create policy "conversations_read"
  on public.conversations for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "conversations_write" on public.conversations;
create policy "conversations_write"
  on public.conversations for all
  using (public.is_staff() or client_id in (select public.my_client_ids()))
  with check (public.is_staff() or client_id in (select public.my_client_ids()));

-- MESSAGES — quem tem acesso à conversation
drop policy if exists "messages_read" on public.messages;
create policy "messages_read"
  on public.messages for select
  using (
    public.is_staff()
    or conversation_id in (
      select c.id from public.conversations c
      where c.client_id in (select public.my_client_ids())
    )
  );
drop policy if exists "messages_write" on public.messages;
create policy "messages_write"
  on public.messages for insert
  with check (
    public.is_staff()
    or conversation_id in (
      select c.id from public.conversations c
      where c.client_id in (select public.my_client_ids())
    )
  );

-- MATERIALS
drop policy if exists "materials_read" on public.materials;
create policy "materials_read"
  on public.materials for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "materials_write" on public.materials;
create policy "materials_write"
  on public.materials for all
  using (public.is_staff() or client_id in (select public.my_client_ids()))
  with check (public.is_staff() or client_id in (select public.my_client_ids()));

-- REPORTS
drop policy if exists "reports_read" on public.reports;
create policy "reports_read"
  on public.reports for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "reports_staff_write" on public.reports;
create policy "reports_staff_write"
  on public.reports for all using (public.is_staff()) with check (public.is_staff());

-- GOALS
drop policy if exists "goals_read" on public.goals;
create policy "goals_read"
  on public.goals for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "goals_staff_write" on public.goals;
create policy "goals_staff_write"
  on public.goals for all using (public.is_staff()) with check (public.is_staff());

-- INITIATIVES
drop policy if exists "initiatives_read" on public.initiatives;
create policy "initiatives_read"
  on public.initiatives for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "initiatives_staff_write" on public.initiatives;
create policy "initiatives_staff_write"
  on public.initiatives for all using (public.is_staff()) with check (public.is_staff());

-- NOTIFICATIONS — só pra quem é destinatário
drop policy if exists "notifications_own_read" on public.notifications;
create policy "notifications_own_read"
  on public.notifications for select
  using (recipient_id = auth.uid() or public.is_staff());

drop policy if exists "notifications_own_update" on public.notifications;
create policy "notifications_own_update"
  on public.notifications for update
  using (recipient_id = auth.uid());

drop policy if exists "notifications_staff_insert" on public.notifications;
create policy "notifications_staff_insert"
  on public.notifications for insert
  with check (public.is_staff());

-- AUDIT_LOG — só staff
drop policy if exists "audit_staff_read" on public.audit_log;
create policy "audit_staff_read"
  on public.audit_log for select using (public.is_staff());
drop policy if exists "audit_insert" on public.audit_log;
create policy "audit_insert"
  on public.audit_log for insert with check (auth.uid() is not null);
