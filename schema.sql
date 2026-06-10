-- ==========================================
-- SCHEMA SUPABASE - FOOD MÉTRICAS CRM
-- Cole este script no SQL Editor do Supabase
-- e clique em "Run"
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. AUTH E PERFIS
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'client' CHECK (role IN ('admin', 'manager', 'support', 'client', 'viewer')),
  avatar_url text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. CLIENTES
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  type text,
  email text,
  phone text,
  whatsapp text,
  contact_name text,
  cnpj text,
  address text,
  website text,
  instagram text,
  city text,
  state text,
  avatar text,
  color text DEFAULT '#e01c1c',
  status text DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'paused', 'cancelled')),
  plan text DEFAULT 'standard',
  mrr numeric DEFAULT 0,
  health_score integer DEFAULT 50,
  manager_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Relacionamento N:N Usuários e Clientes
CREATE TABLE IF NOT EXISTS public.client_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- 4. CRM COMERCIAL (LEADS)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  company_name text,
  email text,
  phone text,
  status text DEFAULT 'Pesquisado',
  value numeric DEFAULT 0,
  source text,
  probability integer DEFAULT 10,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  next_action_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status text DEFAULT 'Pesquisado';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS value numeric DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS probability integer DEFAULT 10;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS next_action_date timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 5. GESTÃO DE PROJETOS (CLICKUP STYLE)
CREATE TABLE IF NOT EXISTS public.project_spaces (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  color text DEFAULT '#EF4444',
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_folders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id uuid REFERENCES public.project_spaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE, -- opcional
  color text DEFAULT '#EF4444',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_lists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id uuid REFERENCES public.project_folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id uuid REFERENCES public.project_lists(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE, -- opcional
  name text NOT NULL,
  description text,
  status text DEFAULT 'OPEN',
  priority text DEFAULT 'Normal',
  start_date timestamptz,
  due_date timestamptz,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 6. GESTÃO DE EQUIPE E AGENDA
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text DEFAULT 'internal',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  target numeric,
  current numeric DEFAULT 0,
  deadline timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.initiatives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  status text DEFAULT 'planned',
  deadline timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 7. GESTÃO FINANCEIRA
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  start_date date,
  end_date date,
  value numeric DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  amount numeric DEFAULT 0,
  due_date date,
  status text DEFAULT 'pending',
  url text,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method text;

-- 8. INTEGRAÇÕES E MÉTRICAS
CREATE TABLE IF NOT EXISTS public.integrations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  provider text NOT NULL,
  status text DEFAULT 'disconnected',
  account_name text,
  account_id text,
  customer_id text,
  pixel_id text,
  access_token text,
  last_sync_at timestamptz,
  connected_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, provider)
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  channel text,
  name text,
  status text,
  budget_daily numeric,
  objective text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.metrics_daily (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date date NOT NULL,
  channel text,
  spend numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  clicks integer DEFAULT 0,
  impressions integer DEFAULT 0,
  conversions integer DEFAULT 0,
  reach integer DEFAULT 0,
  UNIQUE(campaign_id, date)
);

CREATE TABLE IF NOT EXISTS public.ifood_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  ordered_at timestamptz NOT NULL,
  total numeric DEFAULT 0,
  rating numeric,
  cancelled boolean DEFAULT false,
  neighborhood text
);

ALTER TABLE public.ifood_orders ADD COLUMN IF NOT EXISTS neighborhood text;

CREATE TABLE IF NOT EXISTS public.food_orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  external_id text,
  source text DEFAULT 'cardapioweb',
  status text DEFAULT 'pending',
  total_amount numeric DEFAULT 0,
  customer_info jsonb DEFAULT '{}',
  items jsonb DEFAULT '[]',
  delivery_fee numeric DEFAULT 0,
  commission numeric DEFAULT 0,
  refund_amount numeric DEFAULT 0,
  payment_method text,
  cancellation_reason text,
  ordered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, external_id)
);

ALTER TABLE public.food_orders 
  ADD COLUMN IF NOT EXISTS delivery_fee numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS cancellation_reason text;

ALTER TABLE public.integrations ADD COLUMN IF NOT EXISTS access_token text;

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  source text,
  author_name text,
  rating integer,
  content text,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gmb_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  date date,
  rating numeric,
  views integer DEFAULT 0,
  calls integer DEFAULT 0,
  directions integer DEFAULT 0,
  UNIQUE(client_id, date)
);

CREATE TABLE IF NOT EXISTS public.site_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  date date,
  users integer DEFAULT 0,
  sessions integer DEFAULT 0,
  bounce_rate numeric DEFAULT 0,
  avg_session_seconds numeric DEFAULT 0,
  conversions integer DEFAULT 0,
  source_breakdown jsonb DEFAULT '{}',
  top_pages jsonb DEFAULT '[]',
  UNIQUE(client_id, date)
);

CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 9. MATERIAIS E RELATÓRIOS
CREATE TABLE IF NOT EXISTS public.materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text,
  status text DEFAULT 'pending',
  approved_at timestamptz,
  approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text,
  url text,
  period_end date,
  created_at timestamptz DEFAULT now()
);

-- 10. CHAT (MESSAGES)
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  subject text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- VIEWS IFOOD
-- ==========================================
DROP VIEW IF EXISTS public.v_ifood_hourly CASCADE;
CREATE OR REPLACE VIEW public.v_ifood_hourly AS
SELECT
    client_id,
    EXTRACT(hour FROM ordered_at)::integer AS hour,
    COUNT(*) AS orders,
    SUM(total) AS revenue
FROM public.ifood_orders
GROUP BY client_id, EXTRACT(hour FROM ordered_at);

DROP VIEW IF EXISTS public.v_ifood_top_items CASCADE;
CREATE OR REPLACE VIEW public.v_ifood_top_items AS
SELECT
    client_id,
    'Item Desconhecido' AS name, -- placeholder pois não há tabela de itens, pode ser adaptado
    COUNT(*) AS orders,
    SUM(total) AS revenue
FROM public.ifood_orders
GROUP BY client_id;

DROP VIEW IF EXISTS public.v_ifood_by_neighborhood CASCADE;
CREATE OR REPLACE VIEW public.v_ifood_by_neighborhood AS
SELECT
    client_id,
    COALESCE(neighborhood, 'Desconhecido') AS neighborhood,
    COUNT(*) AS orders,
    SUM(total) AS revenue
FROM public.ifood_orders
GROUP BY client_id, COALESCE(neighborhood, 'Desconhecido');

-- FIM DO SCRIPT
