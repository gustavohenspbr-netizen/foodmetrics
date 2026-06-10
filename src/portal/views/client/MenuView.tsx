import React, { useEffect, useState } from "react";
import { BookOpen, MessageSquare, Smartphone, Layout, Pizza, Utensils, ChevronRight, X } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ConnectAccount, type TutorialStep, type QuickAction } from "../../components/ConnectAccount";
import { MenuDashboard } from "../../components/MenuDashboard";
import { useMyClient, useIntegration } from "../../lib/api";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";

// ============================================================
// Providers — todas as opções de cardápios digitais brasileiros
// ============================================================
type Field = { key: "customer_id" | "account_id" | "pixel_id" | "access_token" | "account_name"; label: string; hint?: string; type?: "text" | "password"; required?: boolean; };
type ProviderConfig = {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  brandColor: string;
  brandIcon: React.ReactNode;
  popular?: boolean;
  fields: Field[];
  tutorial: TutorialStep[];
  quickActions: QuickAction[];
  oauthNote?: string;
};

const PROVIDERS: ProviderConfig[] = [
  {
    id: "anota_ai",
    name: "Anota AI",
    shortDesc: "Atendimento + cardápio via WhatsApp com IA",
    longDesc: "Anota AI usa chatbot WhatsApp pra receber pedidos. Conecta cardápio, processa pedidos e sincroniza com PDV. Mais de 40k restaurantes.",
    brandColor: "#7c3aed",
    brandIcon: <MessageSquare size={22} />,
    popular: true,
    fields: [
      { key: "account_id", label: "Restaurant ID", hint: "ID do estabelecimento (no painel Anota)", required: true },
      { key: "account_name", label: "Nome do estabelecimento" },
      { key: "access_token", label: "API Key (Integração PDV)", type: "password", required: true },
    ],
    quickActions: [
      { url: "https://app.anota.ai", label: "Abrir Anota AI", description: "Painel do Gestor" },
      { url: "https://anota.ai/home/funcionalidade/cardapio-digital/", label: "Documentação", description: "Como integrar" },
    ],
    tutorial: [
      {
        title: "Acessar o Gestor Anota AI",
        description: <>Entre no <strong>app.anota.ai</strong> com seu login. No menu superior, vá em <strong>"Configurações"</strong>.</>,
        link: { url: "https://app.anota.ai", label: "Abrir Anota AI" },
      },
      {
        title: "Habilitar Integração PDV",
        description: <>Clique em <strong>"Ações"</strong> → <strong>"Integração PDV"</strong>. Se for a primeira vez, você verá um botão pra <strong>gerar credenciais</strong> (API Key + Restaurant ID).</>,
      },
      {
        title: "Copiar Restaurant ID",
        description: <>O <strong>Restaurant ID</strong> (ou "ID Externo") aparece no topo da página de Integração PDV. Copie esse valor.</>,
      },
      {
        title: "Copiar API Key",
        description: <>A <strong>API Key</strong> aparece logo abaixo. Atenção: ela só é exibida uma vez por segurança — se perder, precisa gerar nova.</>,
      },
    ],
    oauthNote: "A integração com Anota AI requer plano Pro ou superior. No plano básico, o cardápio funciona mas a API não.",
  },
  {
    id: "goomer",
    name: "Goomer",
    shortDesc: "QR Code + delivery + balcão + totem",
    longDesc: "Goomer oferece cardápio digital com QR Code em mesas, totem de autoatendimento e delivery próprio. API OAuth 2.0 padrão OpenDelivery.",
    brandColor: "#f97316",
    brandIcon: <Layout size={22} />,
    popular: true,
    fields: [
      { key: "account_id", label: "Client ID", hint: "Fornecido pela Goomer após solicitar API", required: true },
      { key: "account_name", label: "Nome da loja" },
      { key: "access_token", label: "Client Secret", type: "password", required: true },
    ],
    quickActions: [
      { url: "https://app.goomer.com.br", label: "Painel Goomer", description: "Solicitar credenciais OAuth" },
      { url: "https://partner-api.goomer.app/opendelivery/overview.html", label: "Docs Goomer API", description: "Padrão OpenDelivery" },
    ],
    tutorial: [
      {
        title: "Solicitar credenciais OAuth",
        description: <>A API da Goomer usa <strong>OAuth 2.0 (client_credentials)</strong>. Solicite as credenciais via suporte Goomer (chat no painel) ou pelo email <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">integracoes@goomer.com.br</code>.</>,
        link: { url: "https://app.goomer.com.br", label: "Painel Goomer" },
      },
      {
        title: "Receber Client ID + Client Secret",
        description: <>Goomer envia por email o <strong>client_id</strong> e <strong>client_secret</strong>. Guarde com cuidado — o Secret só é gerado uma vez.</>,
      },
      {
        title: "Validar token",
        description: <>A FoodMetrics gera automaticamente o <strong>access_token</strong> via <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">POST /opendelivery/oauth/token</code>. Os tokens renovam automaticamente.</>,
        link: { url: "https://partner-api.goomer.app/opendelivery/overview.html", label: "Docs OpenDelivery" },
      },
      {
        title: "Sincronizar cardápio",
        description: <>Depois de conectado, a Goomer expõe seu cardápio completo (categorias, produtos, preços, disponibilidade, fotos). Sync rodará a cada 6 horas.</>,
      },
    ],
    oauthNote: "Goomer segue o padrão OpenDelivery (oficial Abrasel) — interoperável com outros sistemas como iFood Direct.",
  },
  {
    id: "saipos",
    name: "Saipos",
    shortDesc: "PDV + delivery + cardápio integrado",
    longDesc: "Saipos é um ERP/PDV completo. A integração com o cardápio digital é nativa via API REST e cobre 100+ parceiros.",
    brandColor: "#3b82f6",
    brandIcon: <Pizza size={22} />,
    fields: [
      { key: "account_id", label: "ID da loja Saipos", required: true },
      { key: "account_name", label: "Nome do estabelecimento" },
      { key: "access_token", label: "API Token", type: "password", required: true },
    ],
    quickActions: [
      { url: "https://app.saipos.com", label: "Painel Saipos", description: "Login do operador" },
      { url: "https://saipos.com/integracoes", label: "Catálogo de integrações", description: "100+ parceiros suportados" },
    ],
    tutorial: [
      {
        title: "Falar com o Suporte Saipos",
        description: <>A integração via API requer ativação pelo suporte. Entre em contato pelo chat dentro do <strong>app.saipos.com</strong> ou pelo telefone do plano contratado e peça <strong>"liberação de API REST com FoodMetrics"</strong>.</>,
        link: { url: "https://app.saipos.com", label: "Abrir Saipos" },
      },
      {
        title: "Ativar Integração no painel",
        description: <>Quando liberado, vá em <strong>Configurações → Integrações → API REST</strong>. Você verá o <strong>ID da loja</strong> e poderá <strong>gerar o API Token</strong>.</>,
      },
      {
        title: "Custo: zero",
        description: <>Clientes Saipos não pagam nada extra pela integração. É plug-and-play depois da liberação do suporte.</>,
      },
    ],
  },
  {
    id: "cardapio_web",
    name: "Cardápio Web",
    shortDesc: "Cardápio digital completo + delivery",
    longDesc: "Cardápio Web oferece cardápio digital, app próprio e integração com WhatsApp/iFood. Bastante usado em pizzarias e fast food.",
    brandColor: "#10b981",
    brandIcon: <Smartphone size={22} />,
    fields: [
      { key: "account_id", label: "Store ID", required: true },
      { key: "account_name", label: "Nome da loja" },
      { key: "access_token", label: "API Key", type: "password", required: true },
    ],
    quickActions: [
      { url: "https://painel.cardapioweb.com", label: "Painel Cardápio Web", description: "Login do gestor" },
      { url: "https://cardapioweb.com", label: "Site oficial", description: "Saiba mais" },
    ],
    tutorial: [
      {
        title: "Solicitar API ao suporte",
        description: <>No <strong>painel.cardapioweb.com</strong>, abra o chat de suporte (canto inferior direito) e peça <strong>"acesso à API REST pra integração com FoodMetrics"</strong>.</>,
        link: { url: "https://painel.cardapioweb.com", label: "Abrir painel" },
      },
      {
        title: "Pegar o Store ID",
        description: <>No painel, em <strong>Configurações → Estabelecimento</strong>, o <strong>ID</strong> aparece no topo da página (número de 4-6 dígitos).</>,
      },
      {
        title: "Gerar API Key",
        description: <>Em <strong>Configurações → Integrações → API REST → Gerar Token</strong>. Copie a chave gerada — ela aparece só uma vez.</>,
      },
    ],
  },
  {
    id: "menu_dino",
    name: "MenuDino",
    shortDesc: "Cardápio QR Code + pedido em mesa",
    longDesc: "MenuDino é uma opção simples e popular pra cardápio digital com QR Code. Foco em restaurantes presenciais.",
    brandColor: "#06b6d4",
    brandIcon: <Utensils size={22} />,
    fields: [
      { key: "account_id", label: "ID do estabelecimento", required: true },
      { key: "account_name", label: "Nome do restaurante" },
      { key: "access_token", label: "API Key", type: "password" },
    ],
    quickActions: [
      { url: "https://menudino.com/admin", label: "Painel MenuDino" },
    ],
    tutorial: [
      {
        title: "Acessar painel MenuDino",
        description: <>Entre em <strong>menudino.com/admin</strong>. Em <strong>Configurações → Integrações</strong>, gere uma API Key. Cole aqui junto com o ID do estabelecimento (visível no topo do painel).</>,
        link: { url: "https://menudino.com/admin", label: "Abrir MenuDino" },
      },
    ],
  },
  {
    id: "custom_web",
    name: "Cardápio próprio / Site",
    shortDesc: "Tem cardápio próprio? Integre via webhook",
    longDesc: "Se você tem cardápio digital próprio (site, app), pode configurar via webhook URL pra sincronizar pedidos e cardápio.",
    brandColor: "#0F172A",
    brandIcon: <BookOpen size={22} />,
    fields: [
      { key: "account_id", label: "URL do cardápio", hint: "Ex: https://meurestaurante.com.br/cardapio", required: true },
      { key: "account_name", label: "Nome do cardápio" },
      { key: "access_token", label: "Webhook Secret", type: "password", hint: "Para autenticar callbacks (opcional)" },
    ],
    quickActions: [],
    tutorial: [
      {
        title: "URL do seu cardápio",
        description: <>Cole a URL pública do seu cardápio digital próprio. Se tiver endpoint REST, use a URL base da API (ex: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">https://api.meurestaurante.com.br</code>).</>,
      },
      {
        title: "Webhook Secret (opcional)",
        description: <>Se você quer receber pedidos via webhook no nosso sistema, gere um secret aleatório e cole aqui. Vamos usar ele pra validar requests.</>,
      },
      {
        title: "Conectar com seu dev",
        description: <>Pra fazer a integração custom rodar, fale com seu dev: ele precisa expor endpoints REST padrão pra cardápio e pedidos. Documentação do schema disponível em <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono">/docs/custom-menu</code> (em breve).</>,
      },
    ],
    oauthNote: "Integração custom requer trabalho do seu desenvolvedor. Se preferir uma solução pronta, escolha um dos cardápios da lista acima.",
  },
];

// ============================================================
// View principal
// ============================================================
export function MenuView() {
  const { data: client } = useMyClient();
  const cid = client?.id;
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeProviders, setActiveProviders] = useState<string[]>([]);

  // Detecta quais providers já estão conectados
  useEffect(() => {
    if (!cid) return;
    (async () => {
      const providerIds = PROVIDERS.map((p) => `menu_${p.id}`);
      const { data } = await supabase
        .from("integrations")
        .select("provider")
        .eq("client_id", cid)
        .in("provider", providerIds);
      const active = (data ?? []).map((d: any) => d.provider.replace("menu_", ""));
      setActiveProviders(active);
      // Auto-seleciona o primeiro conectado (se houver)
      if (active.length > 0 && !selectedProvider) setSelectedProvider(active[0]);
    })();
  }, [cid]);

  const provider = PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Cardápio Digital</h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          Conecte seu cardápio digital pra sincronizar produtos, preços, disponibilidade e pedidos
        </p>
      </div>

      {/* Seletor de Provider */}
      <Card>
        <CardHeader
          title={selectedProvider ? "Trocar provedor" : "Escolha seu cardápio digital"}
          subtitle="Selecione qual plataforma você usa hoje"
          action={
            selectedProvider && (
              <Button size="sm" variant="ghost" icon={X} onClick={() => setSelectedProvider(null)}>
                Limpar seleção
              </Button>
            )
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROVIDERS.map((p) => {
            const isSelected = selectedProvider === p.id;
            const isActive = activeProviders.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={cn(
                  "relative text-left p-4 rounded-xl border transition-all hover:-translate-y-0.5",
                  isSelected
                    ? "border-[#e01c1c] bg-[#e01c1c]/[0.04] shadow-[0_8px_20px_rgba(224,28,28,0.1)]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0F172A]"
                )}
              >
                {p.popular && !isActive && (
                  <Badge tone="orange" size="sm" className="absolute -top-2 -right-2 z-10">Popular</Badge>
                )}
                {isActive && (
                  <Badge tone="success" size="sm" className="absolute -top-2 -right-2 z-10" dot>Conectado</Badge>
                )}
                <div className="flex items-start gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${p.brandColor}15`, color: p.brandColor, border: `1px solid ${p.brandColor}30` }}
                  >
                    {p.brandIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {p.shortDesc}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={cn(
                      "text-slate-300 dark:text-slate-700 flex-shrink-0 transition-transform mt-1",
                      isSelected && "text-[#e01c1c] rotate-90"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Form de conexão do provider selecionado */}
      {provider ? (
        <div>
          <div className="flex items-start gap-3 mb-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200/60 dark:border-slate-800/60">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${provider.brandColor}15`, color: provider.brandColor, border: `1px solid ${provider.brandColor}30` }}
            >
              {provider.brandIcon}
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-900 dark:text-white">{provider.name}</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-snug mt-0.5">
                {provider.longDesc}
              </p>
            </div>
          </div>

          <ConnectAccount
            clientId={cid}
            provider={`menu_${provider.id}`}
            brandColor={provider.brandColor}
            title={provider.name}
            description={provider.longDesc}
            fields={provider.fields}
            tutorial={provider.tutorial}
            quickActions={provider.quickActions}
            oauthNote={provider.oauthNote}
          />
          
          {activeProviders.includes(provider.id) && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-2">Desempenho e Histórico</h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                Acompanhe o volume de vendas e os pedidos mais recentes vindos deste canal.
              </p>
              <MenuDashboard clientId={cid} source={provider.id} />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="Selecione um cardápio digital acima"
          description="Não usa nenhum desses? Escolha 'Cardápio próprio / Site' para integração custom via webhook."
        />
      )}
    </div>
  );
}
