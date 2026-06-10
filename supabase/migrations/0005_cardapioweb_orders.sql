-- Adiciona a coluna source para diferenciar as origens dos pedidos
ALTER TABLE public.ifood_orders ADD COLUMN source text NOT NULL DEFAULT 'ifood';
