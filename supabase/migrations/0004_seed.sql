-- ============================================================
-- SEED — popula tudo pra ter um portal funcional realista
-- ============================================================

-- Atualiza profiles com cor/avatar (já criados via Auth Admin API)
update public.profiles set
  full_name = 'Angelo Garcia',
  role = 'admin',
  avatar_url = null
where email = 'admin@foodmetrics.com.br';

update public.profiles set role = 'manager' where email in ('leticia@foodmetrics.com.br', 'rafael@foodmetrics.com.br');
update public.profiles set role = 'support' where email in ('camila@foodmetrics.com.br', 'joao@foodmetrics.com.br');

-- ============================================================
-- CLIENTES (restaurantes)
-- ============================================================
-- BK SP já existe — atualiza com manager_id da Letícia
update public.clients set
  manager_id = (select id from public.profiles where email='leticia@foodmetrics.com.br'),
  city = 'São Paulo', state = 'SP', mrr = 4500, health_score = 92
where name = 'Burger King (Franquia SP)';

-- Outros 7 clientes
insert into public.clients (name, type, email, city, state, avatar, color, status, plan, mrr, health_score, joined_at, manager_id)
select * from (values
  ('Outback Steakhouse',  'Casual Dining',   'marketing@outback.com',     'Rio de Janeiro', 'RJ', 'OB', '#e01c1c', 'active'::client_status,  'Premium',  7500.0,  88, '2024-06-03'::date, (select id from public.profiles where email='leticia@foodmetrics.com.br')),
  ('Madero Prime',        'Premium Burger',  'gerencia@madero.com',       'Curitiba',       'PR', 'MD', '#0F172A', 'active'::client_status,  'Standard', 6000.0,  76, '2025-01-22'::date, (select id from public.profiles where email='rafael@foodmetrics.com.br')),
  ('Pizza Hut (Moema)',   'Pizzaria',        'moema@pizzahut.com.br',     'São Paulo',      'SP', 'PH', '#c8102e', 'pending'::client_status, 'Standard', 3200.0,  45, '2025-04-10'::date, (select id from public.profiles where email='leticia@foodmetrics.com.br')),
  ('Coco Bambu',          'Seafood',         'eventos@cocobambu.com',     'Brasília',       'DF', 'CB', '#bfa15f', 'active'::client_status,  'Enterprise', 12000.0, 94, '2024-03-15'::date, (select id from public.profiles where email='rafael@foodmetrics.com.br')),
  ('Paris 6',             'Bistrô',          'admin@paris6.com.br',       'São Paulo',      'SP', 'P6', '#54301a', 'pending'::client_status, 'Standard', 4800.0,  58, '2025-02-08'::date, (select id from public.profiles where email='camila@foodmetrics.com.br')),
  ('Fogo de Chão',        'Churrascaria',    'marketing@fogodechao.com',  'São Paulo',      'SP', 'FC', '#8b1a1a', 'active'::client_status,  'Premium',  9500.0,  96, '2024-01-05'::date, (select id from public.profiles where email='rafael@foodmetrics.com.br')),
  ('Spoleto',             'Italiana',        'ops@spoleto.com.br',        'São Paulo',      'SP', 'SP', '#1f7a3a', 'active'::client_status,  'Standard', 3500.0,  71, '2024-11-20'::date, (select id from public.profiles where email='camila@foodmetrics.com.br'))
) as v(name, type, email, city, state, avatar, color, status, plan, mrr, health_score, joined_at, manager_id)
where not exists (select 1 from public.clients c where c.name = v.name);

-- ============================================================
-- CAMPAIGNS + METRICS_DAILY (30 dias) para Burger King SP
-- ============================================================
do $$
declare
  bk_id uuid;
  c_id uuid;
  campaign_data record;
  day_offset int;
  d date;
  spend_base numeric;
  conv_base int;
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  if bk_id is null then return; end if;

  -- Limpa antes (idempotente)
  delete from public.metrics_daily where client_id = bk_id;
  delete from public.campaigns where client_id = bk_id;

  -- Cria campanhas
  for campaign_data in select * from (values
    ('google'::campaign_channel, '[Pesquisa] Delivery Fundo de Funil',  'active', 150.0, 'sales',       4500.0, 1250),
    ('google'::campaign_channel, '[Performance Max] Almoço Executivo',  'active', 100.0, 'conversions', 2800.0, 840),
    ('google'::campaign_channel, '[YouTube] Brand Awareness',           'paused', 50.0,  'awareness',   1200.0, 45),
    ('google'::campaign_channel, '[Display] Retargeting Carrinho',      'active', 60.0,  'retargeting', 1800.0, 320),
    ('meta'::campaign_channel,   '[Feed/Stories] Oferta de Domingo',    'active', 80.0,  'conversions', 2100.0, 620),
    ('meta'::campaign_channel,   '[Reels] Vídeo Bastidores Cozinha',    'active', 50.0,  'reach',       1500.0, 890),
    ('meta'::campaign_channel,   '[Carrossel] Cardápio de Inverno',     'active', 110.0, 'conversions', 3200.0, 410),
    ('meta'::campaign_channel,   '[Stories] Cupom Primeira Compra',     'active', 35.0,  'conversions', 950.0,  530)
  ) as v(channel, name, status, budget, objective, total_spend, total_conv) loop
    insert into public.campaigns (client_id, channel, name, status, budget_daily, objective)
    values (bk_id, campaign_data.channel, campaign_data.name, campaign_data.status, campaign_data.budget, campaign_data.objective)
    returning id into c_id;

    -- Gera métricas para os últimos 30 dias
    for day_offset in 0..29 loop
      d := current_date - day_offset;
      spend_base := (campaign_data.total_spend / 30.0) * (0.7 + random() * 0.6);
      conv_base := round((campaign_data.total_conv / 30.0) * (0.7 + random() * 0.6))::int;
      insert into public.metrics_daily (
        client_id, campaign_id, channel, date,
        impressions, clicks, spend, conversions, revenue, reach, ctr, cpa, roas
      ) values (
        bk_id, c_id, campaign_data.channel, d,
        round(spend_base * 50)::bigint,
        round(spend_base * 8)::bigint,
        round(spend_base::numeric, 2),
        conv_base,
        round((conv_base * 45)::numeric, 2),
        round(spend_base * 80)::bigint,
        round((random() * 3 + 4)::numeric, 4),
        case when conv_base > 0 then round((spend_base / conv_base)::numeric, 2) else 0 end,
        case when spend_base > 0 then round(((conv_base * 45) / spend_base)::numeric, 2) else 0 end
      );
    end loop;
  end loop;
end $$;

-- ============================================================
-- iFOOD ORDERS — 30 dias com bairros + items
-- ============================================================
do $$
declare
  bk_id uuid;
  d timestamptz;
  i int;
  neighborhood text;
  total_val numeric;
  items_data jsonb;
  hour_of_day int;
  neighborhoods text[] := array[
    'Vila Madalena', 'Pinheiros', 'Itaim Bibi', 'Moema',
    'Jardins', 'Vila Olímpia', 'Brooklin', 'Perdizes', 'Higienópolis'
  ];
  menu_items jsonb[] := array[
    '{"name": "Whopper Duplo",       "price": 38.90, "qty": 1}'::jsonb,
    '{"name": "Combo BK Stacker",    "price": 42.50, "qty": 1}'::jsonb,
    '{"name": "Chicken Crispy",      "price": 28.50, "qty": 1}'::jsonb,
    '{"name": "Onion Rings G",       "price": 18.90, "qty": 1}'::jsonb,
    '{"name": "Milkshake Ovomaltine","price": 19.90, "qty": 1}'::jsonb,
    '{"name": "Big King",            "price": 32.90, "qty": 1}'::jsonb,
    '{"name": "Batata Frita Média",  "price": 12.90, "qty": 1}'::jsonb
  ];
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  if bk_id is null then return; end if;

  delete from public.ifood_orders where client_id = bk_id;

  for i in 1..650 loop
    -- Distribuição com mais pedidos em horário de almoço/jantar
    hour_of_day := case
      when random() < 0.35 then 11 + (random() * 4)::int   -- almoço (11-15)
      when random() < 0.7 then 18 + (random() * 5)::int    -- jantar (18-23)
      else (random() * 24)::int
    end;
    d := (current_date - (random() * 30)::int)::timestamptz +
         (hour_of_day || ' hours')::interval +
         ((random() * 60)::int || ' minutes')::interval;
    neighborhood := neighborhoods[1 + (random() * (array_length(neighborhoods, 1) - 1))::int];

    -- 1 ou 2 items por pedido
    items_data := jsonb_build_array(
      menu_items[1 + (random() * 6)::int],
      menu_items[1 + (random() * 6)::int]
    );
    total_val := round((30 + random() * 90)::numeric, 2);

    insert into public.ifood_orders (
      client_id, external_id, ordered_at, total, status,
      items, delivery_neighborhood, rating, cancelled
    ) values (
      bk_id, 'ifd-' || gen_random_uuid()::text, d, total_val, 'delivered',
      items_data, neighborhood,
      case when random() < 0.6 then 5 when random() < 0.85 then 4 else 3 end,
      random() < 0.02
    );
  end loop;
end $$;

-- ============================================================
-- REVIEWS (iFood + GMB)
-- ============================================================
do $$
declare bk_id uuid;
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  if bk_id is null then return; end if;

  delete from public.reviews where client_id = bk_id;

  insert into public.reviews (client_id, source, customer_name, rating, comment, posted_at, replied_at, reply) values
    (bk_id, 'ifood', 'Joana M.',        5, 'Chegou rápido e quentinho, batata crocante!',                            now() - interval '2 hours', now() - interval '1 hour', 'Obrigado Joana! Volte sempre 🍔'),
    (bk_id, 'ifood', 'Pedro L.',        3, 'Faltou o brinde do combo infantil :(',                                   now() - interval '4 hours', null, null),
    (bk_id, 'ifood', 'Ana C.',          5, 'Sempre meu pedido favorito de sexta!',                                   now() - interval '6 hours', null, null),
    (bk_id, 'gmb',   'Maria Cristina',  5, 'Atendimento impecável, comida divina. Voltarei sempre!',                 now() - interval '3 hours', null, null),
    (bk_id, 'gmb',   'Ricardo Mendes',  4, 'Boa comida, só achei o tempo de espera um pouco longo no pico.',         now() - interval '6 hours', null, null),
    (bk_id, 'gmb',   'Ana Beatriz',     5, 'Melhor burger de SP, sem dúvida. O atendimento da Júlia foi 10!',        now() - interval '1 day',   now() - interval '20 hours', 'Que felicidade ler isso Ana! ❤️'),
    (bk_id, 'gmb',   'Pedro Lemos',     3, 'Esperei muito o pedido e veio frio.',                                    now() - interval '2 days',  now() - interval '1 day', 'Pedimos desculpas Pedro. Pode nos chamar no WhatsApp?');
end $$;

-- ============================================================
-- GMB STATS (30 dias)
-- ============================================================
do $$
declare bk_id uuid; d date;
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  if bk_id is null then return; end if;
  delete from public.gmb_stats where client_id = bk_id;
  for i in 0..29 loop
    d := current_date - i;
    insert into public.gmb_stats (client_id, date, views, searches, calls, directions, photo_views, rating)
    values (bk_id, d,
      (700 + random() * 400)::int,
      (450 + random() * 300)::int,
      (3 + random() * 8)::int,
      (8 + random() * 15)::int,
      (200 + random() * 150)::int,
      4.7);
  end loop;
end $$;

-- ============================================================
-- SITE ANALYTICS (30 dias)
-- ============================================================
do $$
declare bk_id uuid; d date;
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  if bk_id is null then return; end if;
  delete from public.site_analytics where client_id = bk_id;
  for i in 0..29 loop
    d := current_date - i;
    insert into public.site_analytics (client_id, date, users, sessions, page_views, bounce_rate, avg_session_seconds, source_breakdown, top_pages, conversions)
    values (bk_id, d,
      (300 + random() * 400)::int,
      (450 + random() * 500)::int,
      (1200 + random() * 800)::int,
      round((28 + random() * 12)::numeric, 2),
      (110 + random() * 80)::int,
      '{"organico": 42, "pago": 28, "social": 18, "direto": 12}'::jsonb,
      '[{"url":"/cardapio","views":4200,"conv":12.4},{"url":"/","views":3850,"conv":8.2},{"url":"/delivery","views":2410,"conv":18.6},{"url":"/contato","views":1280,"conv":4.1}]'::jsonb,
      (15 + random() * 40)::int);
  end loop;
end $$;

-- ============================================================
-- GOALS + INITIATIVES + RECOMMENDATIONS (BK SP)
-- ============================================================
do $$
declare bk_id uuid; leticia uuid; rafael uuid; camila uuid;
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  select id into leticia from public.profiles where email = 'leticia@foodmetrics.com.br';
  select id into rafael from public.profiles where email = 'rafael@foodmetrics.com.br';
  select id into camila from public.profiles where email = 'camila@foodmetrics.com.br';
  if bk_id is null then return; end if;

  delete from public.goals where client_id = bk_id;
  delete from public.initiatives where client_id = bk_id;
  delete from public.recommendations where client_id = bk_id;

  insert into public.goals (client_id, label, target, current, format, period_month) values
    (bk_id, 'Faturamento iFood',   260000, 245000, 'currency', date_trunc('month', current_date)::date),
    (bk_id, 'ROAS Médio',          12,     11.4,   'number',   date_trunc('month', current_date)::date),
    (bk_id, 'Novos Clientes',      800,    620,    'number',   date_trunc('month', current_date)::date),
    (bk_id, 'Avaliação Média',     4.9,    4.8,    'number',   date_trunc('month', current_date)::date);

  insert into public.initiatives (client_id, title, status, owner_id, deadline) values
    (bk_id, 'Campanha Dia dos Namorados',        'in_progress', leticia, '2026-06-10'),
    (bk_id, 'Nova sessão de fotos do cardápio',  'scheduled',   camila,  '2026-05-30'),
    (bk_id, 'Implementar programa de fidelidade','pending',     rafael,  '2026-06-30'),
    (bk_id, 'Otimizar fluxo de delivery próprio','in_progress', leticia, '2026-06-05');

  insert into public.recommendations (client_id, text, priority, category, created_by) values
    (bk_id, 'Aumentar investimento em Reels — performance 30% acima da meta', 'high',   'marketing', leticia),
    (bk_id, 'Pausar campanha [YouTube] Brand Awareness — ROAS abaixo de 3',   'medium', 'marketing', rafael),
    (bk_id, 'Responder reviews 1-3 estrelas em até 6h pra melhorar média',    'high',   'reputacao', camila);
end $$;

-- ============================================================
-- MATERIALS (BK SP)
-- ============================================================
do $$
declare bk_id uuid; joao uuid;
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  select id into joao from public.profiles where email = 'joao@foodmetrics.com.br';
  if bk_id is null then return; end if;
  delete from public.materials where client_id = bk_id;
  insert into public.materials (client_id, type, title, size, status, thumbnail_url, uploaded_by, created_at) values
    (bk_id, 'image', 'Foto Whopper Duplo (Pack 1)',   '12 imagens', 'approved', null, joao, now() - interval '21 days'),
    (bk_id, 'video', 'Reels Bastidores Cozinha',       '45s',        'approved', null, joao, now() - interval '23 days'),
    (bk_id, 'image', 'Cardápio de Inverno (Carrossel)','8 imagens',  'pending',  null, joao, now() - interval '13 days'),
    (bk_id, 'video', 'Vídeo Brand Awareness 30s',      '30s',        'pending',  null, joao, now() - interval '15 days'),
    (bk_id, 'image', 'Banners Dia dos Namorados',      '6 imagens',  'draft',    null, joao, now() - interval '12 days');
end $$;

-- ============================================================
-- CONVERSAS + MENSAGENS (BK SP)
-- ============================================================
do $$
declare bk_id uuid; conv_id uuid; leticia uuid; bk_user uuid;
begin
  select id into bk_id from public.clients where name = 'Burger King (Franquia SP)';
  select id into leticia from public.profiles where email='leticia@foodmetrics.com.br';
  select id into bk_user from public.profiles where email='cliente@burgerking.com.br';
  if bk_id is null then return; end if;

  delete from public.messages where conversation_id in (select id from public.conversations where client_id = bk_id);
  delete from public.conversations where client_id = bk_id;

  insert into public.conversations (client_id, subject, last_message_at)
  values (bk_id, 'Atendimento — Letícia Souza', now() - interval '1 hour')
  returning id into conv_id;

  insert into public.messages (conversation_id, sender_id, sender_type, content, read_at, created_at) values
    (conv_id, bk_user, 'client', 'Bom dia! Como ficou a campanha do Dia das Mães?', now() - interval '2 hours', now() - interval '2 hours 30 minutes'),
    (conv_id, leticia, 'agency', 'Bom dia Carlos! Já tá no ar desde ontem 🚀 Os primeiros números estão muito acima da meta — vou te mandar um print agora.', now() - interval '2 hours', now() - interval '2 hours 28 minutes'),
    (conv_id, leticia, 'agency', 'CTR de 6.2% (meta era 4%) e CPA já está em R$ 3,40 (meta R$ 5,00)', now() - interval '2 hours', now() - interval '2 hours 27 minutes'),
    (conv_id, bk_user, 'client', 'Maravilha! Vamos aumentar o budget então?', now() - interval '1 hour', now() - interval '2 hours 24 minutes'),
    (conv_id, leticia, 'agency', 'Já subi de R$ 200/dia pra R$ 350/dia. Posso ir pra R$ 500 se mantiver a performance até quarta. OK pra você?', null, now() - interval '1 hour');
end $$;

-- ============================================================
-- LEADS (CRM da agência) — global, não vinculado a cliente
-- ============================================================
do $$
declare leticia uuid; rafael uuid; camila uuid; angelo uuid;
begin
  select id into angelo from public.profiles where email='admin@foodmetrics.com.br';
  select id into leticia from public.profiles where email='leticia@foodmetrics.com.br';
  select id into rafael from public.profiles where email='rafael@foodmetrics.com.br';
  select id into camila from public.profiles where email='camila@foodmetrics.com.br';

  delete from public.leads;

  insert into public.leads (name, value, status, source, owner_id, phone, created_at) values
    ('La Guapa (Vila Madalena)',  5000,  'lead',         'Instagram',  camila,  '+55 11 98765-4321', now() - interval '4 days'),
    ('Patties Burger',            8500,  'contacted',    'Indicação',  rafael,  '+55 11 98123-4567', now() - interval '5 days'),
    ('Bacio di Latte',           12000,  'proposal',     'Site',       camila,  '+55 11 97654-1234', now() - interval '6 days'),
    ('Cabana Burger',            10000,  'negotiation',  'LinkedIn',   rafael,  '+55 11 96123-4567', now() - interval '7 days'),
    ('Fogo de Chão',             20000,  'won',          'Indicação',  angelo,  '+55 11 91234-5678', now() - interval '9 days'),
    ('Hamburgueria Estação',      4500,  'lead',         'Site',       camila,  '+55 11 90987-6543', now() - interval '2 days'),
    ('Cantina San Marco',         6800,  'contacted',    'Instagram',  rafael,  '+55 11 91098-7654', now() - interval '3 days');
end $$;

-- ============================================================
-- CONTRACTS + INVOICES por cliente
-- ============================================================
do $$
declare c record;
begin
  delete from public.invoices;
  delete from public.contracts;

  for c in select id, name, mrr, joined_at from public.clients loop
    insert into public.contracts (client_id, scope, monthly_value, start_date, end_date, signed, signed_at, status)
    values (
      c.id,
      case
        when c.mrr >= 9000 then 'Premium (Tráfego + CRM + Design)'
        when c.mrr >= 5000 then 'Gestão de Tráfego + CRM'
        else 'Gestão de Tráfego'
      end,
      c.mrr,
      c.joined_at,
      c.joined_at + interval '1 year',
      true,
      c.joined_at::timestamptz,
      'active'
    );

    -- Última fatura paga
    insert into public.invoices (client_id, description, amount, status, payment_method, due_date, paid_at)
    values (c.id, 'Mensalidade ' || to_char(current_date - interval '1 month', 'Mon/YYYY'), c.mrr, 'paid', 'PIX', date_trunc('month', current_date - interval '1 month')::date + 5, current_date - interval '20 days');

    -- Fatura do mês atual (mistura status)
    insert into public.invoices (client_id, description, amount, status, payment_method, due_date)
    values (c.id, 'Mensalidade ' || to_char(current_date, 'Mon/YYYY'), c.mrr,
      (case when random() < 0.6 then 'paid' else case when random() < 0.5 then 'pending' else 'overdue' end end)::invoice_status,
      case (random()*4)::int when 0 then 'PIX' when 1 then 'Boleto' when 2 then 'Cartão' else 'Transferência' end,
      date_trunc('month', current_date)::date + 5);
  end loop;
end $$;

-- ============================================================
-- TASKS + EVENTS (operação interna)
-- ============================================================
do $$
declare bk_id uuid; outback uuid; pizzaria uuid; coco uuid; madero uuid; laguapa_value int;
        leticia uuid; rafael uuid; camila uuid; joao uuid;
begin
  select id into bk_id from public.clients where name='Burger King (Franquia SP)';
  select id into outback from public.clients where name='Outback Steakhouse';
  select id into pizzaria from public.clients where name='Pizza Hut (Moema)';
  select id into coco from public.clients where name='Coco Bambu';
  select id into madero from public.clients where name='Madero Prime';
  select id into leticia from public.profiles where email='leticia@foodmetrics.com.br';
  select id into rafael from public.profiles where email='rafael@foodmetrics.com.br';
  select id into camila from public.profiles where email='camila@foodmetrics.com.br';
  select id into joao from public.profiles where email='joao@foodmetrics.com.br';

  delete from public.tasks;
  delete from public.events;

  insert into public.tasks (client_id, title, owner_id, status, priority, due_date) values
    (bk_id,    'Criar criativos Dia dos Namorados',     joao,     'in_progress', 'high',   current_date + 8),
    (outback,  'Relatório de Performance - Abril',      leticia,  'review',      'high',   current_date + 3),
    (pizzaria, 'Setup pixel de conversão',              rafael,   'todo',        'medium', current_date + 6),
    (null,     'Call de onboarding - La Guapa',         camila,   'todo',        'high',   current_date),
    (coco,     'Otimizar campanhas Performance Max',    rafael,   'in_progress', 'medium', current_date + 4),
    (madero,   'Resposta de reviews iFood',             leticia,  'done',        'low',    current_date - 2);

  insert into public.events (client_id, title, type, starts_at, ends_at, created_by) values
    (null,     'Reunião de Onboarding - La Guapa',         'onboarding', current_date + interval '10 hours',  current_date + interval '11 hours',  camila),
    (outback,  'Apresentação Relatório Abril - Outback',   'report',     current_date + interval '14 hours',  current_date + interval '15 hours',  leticia),
    (null,     'Daily da Equipe',                          'internal',   current_date + interval '1 day 9.5 hours', current_date + interval '1 day 9.75 hours', leticia),
    (pizzaria, 'Revisão de Criativos - Pizza Hut',         'review',     current_date + interval '2 days 11 hours', current_date + interval '2 days 12 hours', leticia);
end $$;

-- ============================================================
-- NOTIFICATIONS — pra cada usuário ativo
-- ============================================================
do $$
declare angelo uuid; bk_user uuid;
begin
  select id into angelo from public.profiles where email='admin@foodmetrics.com.br';
  select id into bk_user from public.profiles where email='cliente@burgerking.com.br';

  delete from public.notifications;

  -- Admin
  insert into public.notifications (recipient_id, type, title, description, created_at) values
    (angelo, 'alert',   'iFood: avaliação caiu pra 4.5',     'Burger King (SP) — última hora',           now() - interval '12 minutes'),
    (angelo, 'success', 'Pagamento recebido',                 'Coco Bambu — R$ 12.000,00',                now() - interval '1 hour'),
    (angelo, 'info',    'Novo relatório disponível',          'Fechamento Abril 2026',                    now() - interval '2 hours'),
    (angelo, 'message', 'Nova mensagem de Outback',           'Marina S.: Recebi o relatório...',         now() - interval '4 hours'),
    (angelo, 'alert',   'Campanha Google pausou sozinha',     'Madero Prime — orçamento esgotou',         now() - interval '1 day');

  -- Cliente
  insert into public.notifications (recipient_id, type, title, description, created_at) values
    (bk_user, 'success', 'Sua campanha está superando metas!', 'CTR 5.4% vs meta 4%',                      now() - interval '30 minutes'),
    (bk_user, 'message', 'Letícia te enviou uma mensagem',     'Já subi de R$ 200/dia pra R$ 350/dia...',  now() - interval '1 hour');
end $$;

-- ============================================================
-- REPORTS
-- ============================================================
do $$
declare bk_id uuid; leticia uuid; angelo uuid;
begin
  select id into bk_id from public.clients where name='Burger King (Franquia SP)';
  select id into leticia from public.profiles where email='leticia@foodmetrics.com.br';
  select id into angelo from public.profiles where email='admin@foodmetrics.com.br';
  if bk_id is null then return; end if;
  delete from public.reports where client_id=bk_id;
  insert into public.reports (client_id, title, period_start, period_end, status, author_id, sent_at, read_at) values
    (bk_id, 'Fechamento Mensal - Abril 2026',          '2026-04-01', '2026-04-30', 'read', leticia, '2026-05-02 09:00', '2026-05-02 14:30'),
    (bk_id, 'Fechamento Mensal - Março 2026',          '2026-03-01', '2026-03-31', 'read', leticia, '2026-04-03 09:00', '2026-04-04 10:00'),
    (bk_id, 'Relatório de Performance - Dia das Mães', '2026-05-08', '2026-05-12', 'sent', leticia, '2026-05-15 16:00', null),
    (bk_id, 'Auditoria Trimestral Q1 2026',            '2026-01-01', '2026-03-31', 'read', angelo,  '2026-04-10 11:00', '2026-04-11 09:30');
end $$;
