import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obter o JSON do webhook
    const payload = await req.json();

    // No webhook do Cardápio Web, normalmente a loja/token podem vir no cabeçalho ou no payload
    // Supondo que eles enviam o código da loja ou algo identificável
    const storeCode = payload.store_code || req.headers.get('x-store-code') || payload.merchant_id;
    const token = req.headers.get('authorization') || payload.token;

    if (!storeCode && !token) {
       return new Response(JSON.stringify({ error: 'Faltando identificação da loja' }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 400,
       });
    }

    // 1. Procurar qual cliente é o dono desta integração
    const { data: integrations, error: intError } = await supabase
      .from('integrations')
      .select('client_id, account_name')
      .eq('provider', 'menu_cardapio_web')
      // Idealmente validaria o token aqui também .eq('access_token', token)
      .limit(1);

    if (intError || !integrations || integrations.length === 0) {
      return new Response(JSON.stringify({ error: 'Integração não encontrada para esta loja' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const clientId = integrations[0].client_id;

    // 2. Extrair os dados do pedido do Payload do Cardápio Web
    // Exemplo genérico, precisa ser adaptado aos nomes reais dos campos deles.
    const externalId = payload.id || payload.order_id;
    const status = payload.status || 'pending';
    const totalAmount = payload.total || payload.amount || 0;
    const customerInfo = payload.customer || { name: 'Cliente', phone: '' };
    const items = payload.items || [];
    const source = payload.origin || 'cardapioweb'; // ifood, whatsapp, etc

    // 3. Salvar na tabela food_orders
    const { error: insertError } = await supabase
      .from('food_orders')
      .upsert({
         client_id: clientId,
         external_id: externalId,
         source: source,
         status: status,
         total_amount: totalAmount,
         customer_info: customerInfo,
         items: items,
         ordered_at: payload.created_at || new Date().toISOString()
      }, { onConflict: 'client_id, external_id' }); // Precisaríamos de um constraint unique se fôssemos fazer upsert preciso

    if (insertError) {
       throw insertError;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
