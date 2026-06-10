import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Puxar as variaveis do arquivo .env.local localmente
const envFile = readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const [key, ...value] = line.split("=");
  if (key && value.length) {
    env[key.trim()] = value.join("=").trim();
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CARDAPIO_WEB_API_KEY = "9joPQPTMT7vyKNAR1m6DuCUKEqdnzsKuJgLYxZG6";
const INTEGRATION_API_KEY = "5e1125be-f7a7-4fb4-bf96-e5de3cefce8a"; // Pode ser usado como fallback se a de cliente não for o suficiente para o histórico


async function getOrders() {
  console.log("Buscando histórico de pedidos...");
  const { data: clientData, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("name", "Burger King (Franquia SP)")
    .single();

  if (clientError || !clientData) {
    console.error("Cliente não encontrado!");
    process.exit(1);
  }
  const CLIENT_ID = clientData.id;

  // Fetch history pages
  let allHistoryOrders: any[] = [];
  for (let page = 1; page <= 12; page++) {
    console.log(`Buscando página ${page} do histórico...`);
    let retries = 0;
    while(retries < 3) {
      const histResponse = await fetch(`https://integracao.cardapioweb.com/api/partner/v1/orders/history?start_date=2026-05-01&end_date=2026-05-31&page=${page}`, {
        headers: { "X-API-KEY": CARDAPIO_WEB_API_KEY }
      });
      if (histResponse.status === 429) {
        console.log("Rate limited. Waiting 10s...");
        await new Promise(r => setTimeout(r, 10000));
        retries++;
        continue;
      }
      if (!histResponse.ok) {
        console.error(`Erro na pág ${page}`, await histResponse.text());
        break;
      }
      const histData = await histResponse.json();
      console.log(`Pág ${page} keys:`, Object.keys(histData));
      
      const ordersArray = histData.data || histData.orders || [];
      console.log(`Pág ${page}: ${ordersArray.length} pedidos`);
      if (ordersArray.length > 0) {
        allHistoryOrders.push(...ordersArray);
      }
      break;
    }
    // Rate limit for history: 15 seconds to avoid 5/min limit!
    await new Promise(r => setTimeout(r, 15000));
  }

  console.log(`Encontrados ${allHistoryOrders.length} pedidos no histórico. Buscando detalhes e processando totais...`);

  let added = 0;

  for (const order of allHistoryOrders) {
    // Busca detalhes do pedido
    let detailsResponse;
    let detailRetries = 0;
    while(detailRetries < 3) {
      detailsResponse = await fetch(`https://integracao.cardapioweb.com/api/partner/v1/orders/${order.id}`, {
        headers: { "X-API-KEY": CARDAPIO_WEB_API_KEY }
      });
      if (detailsResponse.status === 429) {
        console.log(`Rate limited on details ${order.id}. Waiting 10s...`);
        await new Promise(r => setTimeout(r, 10000));
        detailRetries++;
        continue;
      }
      break;
    }

    if (!detailsResponse || !detailsResponse.ok) {
      console.error(`Erro ao buscar detalhes do pedido ${order.id}`);
      continue;
    }

    const details = await detailsResponse.json();

    // Monta o objeto para salvar no DB
    const totalAmount = details.total || 0;
    
    // Status normalization
    let status = order.status; // closed, canceled, etc
    let cancelled = status === "canceled";
    let cancellation_reason = details.cancellation_reason || null;

    const { error } = await supabase.from("ifood_orders").upsert({
      client_id: CLIENT_ID,
      external_id: order.id.toString(),
      ordered_at: order.created_at,
      total: totalAmount,
      status: status,
      items: details.items || [],
      customer_id: details.customer?.id?.toString() || null,
      delivery_neighborhood: details.delivery_address?.neighborhood || null,
      rating: null,
      cancelled: cancelled,
      cancellation_reason: cancellation_reason
    }, {
      onConflict: "client_id,external_id"
    });

    if (error) {
      console.error(`Erro ao salvar pedido ${order.id}:`, error);
    } else {
      added++;
    }
    
    // Limita o rate limit
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`Sincronização concluída! ${added} pedidos salvos/atualizados.`);
}

getOrders();
