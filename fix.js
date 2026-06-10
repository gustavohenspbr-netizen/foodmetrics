import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1].trim() : '';
const key = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(url, key);

async function run() {
  console.log("Checking for CABRONES LOJA 01...");
  let { data: clients, error: err1 } = await supabase
    .from("clients")
    .select("id")
    .ilike("name", "%CABRONES%");
    
  let clientId = clients?.[0]?.id;

  if (!clientId) {
    console.log("Not found. Creating client...");
    const { data: newClient, error: err2 } = await supabase
      .from("clients")
      .insert([{ name: "CABRONES LOJA 01", status: "active", plan: "pro", mrr: 0, health_score: 100 }])
      .select("id")
      .single();
    if (err2) {
      console.error("Error creating client:", err2);
      return;
    }
    clientId = newClient.id;
  }
  
  console.log("Client ID:", clientId);

  const { error: err3 } = await supabase.from("integrations").upsert({
    client_id: clientId,
    provider: "menu_cardapio_web",
    account_id: "12372",
    access_token: "9joPQPTMT7vyKNAR1m6DuCUKEqdnzsKuJgLYxZG6",
    status: "connected",
    connected_at: new Date().toISOString()
  }, { onConflict: "client_id,provider" });
  
  if (err3) {
    console.error("Error inserting integration:", err3);
  } else {
    console.log("Integration inserted successfully!");
  }
}

run();
