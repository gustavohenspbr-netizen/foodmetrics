import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.VITE_SUPABASE_URL || "";
const key = process.env.VITE_SUPABASE_ANON_KEY || "";

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

  // Link to the user if needed, but we don't have the user's ID.
  // Instead, let's just make sure there is at least one client.
  
  // Now let's try to insert the integration just in case
  const { error: err3 } = await supabase.from("integrations").upsert({
    client_id: clientId,
    provider: "cardapio_web",
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
