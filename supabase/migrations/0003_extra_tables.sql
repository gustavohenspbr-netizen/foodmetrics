-- ============================================================
-- TABELAS EXTRAS — cobrir todas as views do painel
-- ============================================================

-- ===== Google Meu Negócio — métricas diárias =====
create table if not exists public.gmb_stats (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  date date not null,
  views integer default 0,
  searches integer default 0,
  calls integer default 0,
  directions integer default 0,
  photo_views integer default 0,
  rating numeric(3, 2),
  created_at timestamptz not null default now(),
  unique(client_id, date)
);
create index if not exists idx_gmb_stats_client_date on public.gmb_stats(client_id, date desc);

-- ===== Site Analytics (GA4) — diário =====
create table if not exists public.site_analytics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  date date not null,
  users integer default 0,
  sessions integer default 0,
  page_views integer default 0,
  bounce_rate numeric(5, 2) default 0,
  avg_session_seconds integer default 0,
  source_breakdown jsonb default '{}'::jsonb,
  top_pages jsonb default '[]'::jsonb,
  conversions integer default 0,
  created_at timestamptz not null default now(),
  unique(client_id, date)
);
create index if not exists idx_site_analytics_client_date on public.site_analytics(client_id, date desc);

-- ===== CRM próprio do restaurante (clientes finais do delivery) =====
create table if not exists public.customer_records (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  birthday date,
  segment text default 'new',
  total_orders integer default 0,
  total_spent numeric(12, 2) default 0,
  last_order_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_customer_records_client on public.customer_records(client_id);
create index if not exists idx_customer_records_segment on public.customer_records(client_id, segment);

-- ===== Recommendations (sugestões da equipe pro cliente) =====
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  text text not null,
  priority text default 'medium',
  category text,
  resolved boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_recommendations_client on public.recommendations(client_id, resolved);

-- ===== Triggers updated_at =====
do $$
declare t text;
begin
  for t in
    select table_name from information_schema.columns
    where table_schema='public' and column_name='updated_at'
      and table_name in ('customer_records')
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ===== RLS =====
alter table public.gmb_stats         enable row level security;
alter table public.site_analytics    enable row level security;
alter table public.customer_records  enable row level security;
alter table public.recommendations   enable row level security;

drop policy if exists "gmb_read" on public.gmb_stats;
create policy "gmb_read" on public.gmb_stats for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "gmb_staff_write" on public.gmb_stats;
create policy "gmb_staff_write" on public.gmb_stats for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "site_read" on public.site_analytics;
create policy "site_read" on public.site_analytics for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "site_staff_write" on public.site_analytics;
create policy "site_staff_write" on public.site_analytics for all
  using (public.is_staff()) with check (public.is_staff());

drop policy if exists "customers_read" on public.customer_records;
create policy "customers_read" on public.customer_records for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "customers_write" on public.customer_records;
create policy "customers_write" on public.customer_records for all
  using (public.is_staff() or client_id in (select public.my_client_ids()))
  with check (public.is_staff() or client_id in (select public.my_client_ids()));

drop policy if exists "rec_read" on public.recommendations;
create policy "rec_read" on public.recommendations for select
  using (public.is_staff() or client_id in (select public.my_client_ids()));
drop policy if exists "rec_staff_write" on public.recommendations;
create policy "rec_staff_write" on public.recommendations for all
  using (public.is_staff()) with check (public.is_staff());

-- ===== Views úteis pra agregações =====

-- iFood: heatmap por bairro (últimos 30 dias)
create or replace view public.v_ifood_by_neighborhood as
select
  client_id,
  delivery_neighborhood as neighborhood,
  count(*)::int as orders,
  coalesce(sum(total), 0)::numeric(12,2) as revenue
from public.ifood_orders
where ordered_at >= now() - interval '30 days'
  and delivery_neighborhood is not null
group by client_id, delivery_neighborhood;

-- iFood: top items (últimos 30 dias) — agrega items jsonb
create or replace view public.v_ifood_top_items as
select
  o.client_id,
  item->>'name' as name,
  count(*)::int as orders,
  coalesce(sum((item->>'price')::numeric * coalesce((item->>'qty')::int, 1)), 0)::numeric(12,2) as revenue
from public.ifood_orders o,
     jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) item
where o.ordered_at >= now() - interval '30 days'
  and item->>'name' is not null
group by o.client_id, item->>'name';

-- iFood: pedidos por hora
create or replace view public.v_ifood_hourly as
select
  client_id,
  extract(hour from ordered_at)::int as hour,
  count(*)::int as orders
from public.ifood_orders
where ordered_at >= now() - interval '7 days'
group by client_id, extract(hour from ordered_at);
