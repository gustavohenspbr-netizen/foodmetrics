// ============ USUÁRIO LOGADO (cliente) ============
export const MOCK_CLIENT_USER = {
  restaurant: "Burger King (Franquia SP)",
  type: "Fast Food Premium",
  avatar: "BK",
  color: "#ff8732",
  city: "São Paulo",
  state: "SP",
  ownerName: "Carlos Mendes",
  plan: "Premium",
  joinedAt: "2024-09-12",
};

export const MOCK_ADMIN_USER = {
  name: "Angelo Garcia",
  role: "Founder / CEO",
  avatar: "AG",
  email: "angelo@foodmetrics.com.br",
};

// ============ CLIENTES (admin) ============
export const MOCK_CLIENTS = [
  { id: "1", restaurant: "Burger King (SP)", email: "contato@bksp.com.br", type: "Fast Food", googleSpend: 15400, metaSpend: 8200, ifoodRating: 4.8, status: "active", avatar: "BK", color: "#ff8732", mrr: 4500, health: 92, manager: "Letícia Souza", city: "São Paulo", joinedAt: "2024-09-12" },
  { id: "2", restaurant: "Outback Steakhouse", email: "marketing@outback.com", type: "Casual Dining", googleSpend: 22000, metaSpend: 14500, ifoodRating: 4.9, status: "active", avatar: "OB", color: "#e01c1c", mrr: 7500, health: 88, manager: "Letícia Souza", city: "Rio de Janeiro", joinedAt: "2024-06-03" },
  { id: "3", restaurant: "Madero Prime", email: "gerencia@madero.com", type: "Premium Burger", googleSpend: 18500, metaSpend: 12000, ifoodRating: 4.7, status: "active", avatar: "MD", color: "#0F172A", mrr: 6000, health: 76, manager: "Rafael Lima", city: "Curitiba", joinedAt: "2025-01-22" },
  { id: "4", restaurant: "Pizza Hut (Moema)", email: "moema@pizzahut.com.br", type: "Pizzaria", googleSpend: 9200, metaSpend: 5100, ifoodRating: 4.6, status: "pending", avatar: "PH", color: "#c8102e", mrr: 3200, health: 45, manager: "Letícia Souza", city: "São Paulo", joinedAt: "2025-04-10" },
  { id: "5", restaurant: "Coco Bambu", email: "eventos@cocobambu.com", type: "Seafood", googleSpend: 31000, metaSpend: 25000, ifoodRating: 4.8, status: "active", avatar: "CB", color: "#bfa15f", mrr: 12000, health: 94, manager: "Rafael Lima", city: "Brasília", joinedAt: "2024-03-15" },
  { id: "6", restaurant: "Paris 6", email: "admin@paris6.com.br", type: "Bistrô", googleSpend: 12000, metaSpend: 18000, ifoodRating: 4.5, status: "pending", avatar: "P6", color: "#54301a", mrr: 4800, health: 58, manager: "Camila Rocha", city: "São Paulo", joinedAt: "2025-02-08" },
  { id: "7", restaurant: "Fogo de Chão", email: "marketing@fogodechao.com", type: "Churrascaria", googleSpend: 28000, metaSpend: 19000, ifoodRating: 4.9, status: "active", avatar: "FC", color: "#8b1a1a", mrr: 9500, health: 96, manager: "Rafael Lima", city: "São Paulo", joinedAt: "2024-01-05" },
  { id: "8", restaurant: "Spoleto", email: "ops@spoleto.com.br", type: "Italiana", googleSpend: 8500, metaSpend: 6800, ifoodRating: 4.4, status: "active", avatar: "SP", color: "#1f7a3a", mrr: 3500, health: 71, manager: "Camila Rocha", city: "São Paulo", joinedAt: "2024-11-20" },
];

// ============ RELATÓRIOS ============
export const MOCK_REPORTS = [
  { id: "r1", title: "Fechamento Mensal - Abril 2025", period: "01/04 a 30/04", status: "read", date: "02/05/2025", pages: 24, author: "Letícia Souza" },
  { id: "r2", title: "Fechamento Mensal - Março 2025", period: "01/03 a 31/03", status: "read", date: "03/04/2025", pages: 22, author: "Letícia Souza" },
  { id: "r3", title: "Relatório de Performance - Dia das Mães", period: "Especial", status: "sent", date: "15/05/2025", pages: 16, author: "Rafael Lima" },
  { id: "r4", title: "Auditoria Trimestral Q1 2025", period: "01/01 a 31/03", status: "read", date: "10/04/2025", pages: 48, author: "Angelo Garcia" },
];

// ============ CAMPANHAS GOOGLE ============
export const MOCK_GOOGLE_CAMPAIGNS = [
  { id: "g1", name: "[Pesquisa] Delivery Fundo de Funil", status: "Ativa", spend: 4500, conversions: 1250, cpa: 3.60, roas: 12.5, impressions: 245000, clicks: 18500, ctr: 7.5 },
  { id: "g2", name: "[Performance Max] Almoço Executivo", status: "Ativa", spend: 2800, conversions: 840, cpa: 3.33, roas: 15.2, impressions: 198000, clicks: 12400, ctr: 6.3 },
  { id: "g3", name: "[YouTube] Brand Awareness", status: "Pausada", spend: 1200, conversions: 45, cpa: 26.66, roas: 2.1, impressions: 412000, clicks: 3200, ctr: 0.8 },
  { id: "g4", name: "[Display] Retargeting Carrinho Abandonado", status: "Ativa", spend: 1800, conversions: 320, cpa: 5.63, roas: 8.9, impressions: 156000, clicks: 4800, ctr: 3.1 },
];

// ============ CAMPANHAS META ============
export const MOCK_META_CAMPAIGNS = [
  { id: "m1", name: "[Feed/Stories] Oferta de Domingo", status: "Ativa", spend: 2100, reach: 145000, clicks: 8400, ctr: 5.7, conversions: 620, cpa: 3.39 },
  { id: "m2", name: "[Reels] Vídeo Bastidores Cozinha", status: "Ativa", spend: 1500, reach: 220000, clicks: 12000, ctr: 5.4, conversions: 890, cpa: 1.68 },
  { id: "m3", name: "[Carrossel] Cardápio de Inverno", status: "Ativa", spend: 3200, reach: 98000, clicks: 5100, ctr: 5.2, conversions: 410, cpa: 7.80 },
  { id: "m4", name: "[Stories] Cupom Primeira Compra", status: "Ativa", spend: 950, reach: 67000, clicks: 4200, ctr: 6.2, conversions: 530, cpa: 1.79 },
];

// ============ iFOOD ============
export const MOCK_IFOOD_DATA = {
  rating: 4.8,
  orders: { today: 142, week: 984, month: 4120 },
  revenue: { today: 8520, week: 62400, month: 245000 },
  cancellations: 1.2,
  avgTicket: 59.50,
  topItems: [
    { name: "Whopper Duplo", orders: 412, revenue: 18540 },
    { name: "Combo BK Stacker", orders: 386, revenue: 17370 },
    { name: "Chicken Crispy", orders: 298, revenue: 11920 },
    { name: "Onion Rings G", orders: 274, revenue: 5480 },
    { name: "Milkshake Ovomaltine", orders: 256, revenue: 5120 },
  ],
  recentReviews: [
    { id: "rv1", customer: "Joana M.", rating: 5, comment: "Chegou rápido e quentinho, batata crocante!", date: "Há 2 horas", answered: true },
    { id: "rv2", customer: "Pedro L.", rating: 3, comment: "Faltou o brinde do combo infantil :(", date: "Há 4 horas", answered: false },
    { id: "rv3", customer: "Ana C.", rating: 5, comment: "Sempre meu pedido favorito de sexta!", date: "Há 6 horas", answered: false },
  ],
  hourly: [
    { hour: "10h", orders: 8 }, { hour: "11h", orders: 22 }, { hour: "12h", orders: 48 }, { hour: "13h", orders: 41 },
    { hour: "14h", orders: 18 }, { hour: "15h", orders: 12 }, { hour: "16h", orders: 9 }, { hour: "17h", orders: 14 },
    { hour: "18h", orders: 28 }, { hour: "19h", orders: 52 }, { hour: "20h", orders: 61 }, { hour: "21h", orders: 45 },
    { hour: "22h", orders: 28 }, { hour: "23h", orders: 14 },
  ],
};

// ============ MENSAL SPEND (gráfico) ============
export const MOCK_MONTHLY_SPEND = [
  { month: "Jan", google: 12000, meta: 8000, revenue: 142000 },
  { month: "Fev", google: 13500, meta: 9200, revenue: 158000 },
  { month: "Mar", google: 11000, meta: 8500, revenue: 145000 },
  { month: "Abr", google: 15400, meta: 11200, revenue: 198000 },
  { month: "Mai", google: 18200, meta: 14500, revenue: 245000 },
];

// ============ CRM ============
export const MOCK_CRM_LEADS = [
  { id: "l1", name: "La Guapa (Vila Madalena)", value: 5000, status: "lead", date: "10/05/2025", source: "Instagram", owner: "Camila Rocha", contact: "+55 11 98765-4321" },
  { id: "l2", name: "Patties Burger", value: 8500, status: "contacted", date: "09/05/2025", source: "Indicação", owner: "Rafael Lima", contact: "+55 11 98123-4567" },
  { id: "l3", name: "Bacio di Latte", value: 12000, status: "proposal", date: "08/05/2025", source: "Site", owner: "Camila Rocha", contact: "+55 11 97654-1234" },
  { id: "l4", name: "Cabana Burger", value: 10000, status: "negotiation", date: "07/05/2025", source: "LinkedIn", owner: "Rafael Lima", contact: "+55 11 96123-4567" },
  { id: "l5", name: "Fogo de Chão", value: 20000, status: "won", date: "05/05/2025", source: "Indicação", owner: "Angelo Garcia", contact: "+55 11 91234-5678" },
  { id: "l6", name: "Hamburgueria Estação", value: 4500, status: "lead", date: "12/05/2025", source: "Site", owner: "Camila Rocha", contact: "+55 11 90987-6543" },
  { id: "l7", name: "Cantina San Marco", value: 6800, status: "contacted", date: "11/05/2025", source: "Instagram", owner: "Rafael Lima", contact: "+55 11 91098-7654" },
];

// ============ FINANCEIRO ============
export const MOCK_FINANCE_INVOICES = [
  { id: "inv1", client: "Burger King (SP)", description: "Mensalidade Gestão Tráfego", amount: 4500, status: "paid", dueDate: "05/05/2025", method: "PIX" },
  { id: "inv2", client: "Outback Steakhouse", description: "Mensalidade Gestão Tráfego + CRM", amount: 7500, status: "pending", dueDate: "15/05/2025", method: "Boleto" },
  { id: "inv3", client: "Madero Prime", description: "Setup de Infraestrutura de Dados", amount: 3000, status: "overdue", dueDate: "01/05/2025", method: "Boleto" },
  { id: "inv4", client: "Coco Bambu", description: "Consultoria Trimestral", amount: 15000, status: "paid", dueDate: "05/05/2025", method: "Transferência" },
  { id: "inv5", client: "Fogo de Chão", description: "Mensalidade Premium", amount: 9500, status: "paid", dueDate: "08/05/2025", method: "PIX" },
  { id: "inv6", client: "Spoleto", description: "Mensalidade Standard", amount: 3500, status: "pending", dueDate: "20/05/2025", method: "Cartão" },
];

// ============ AGENDA ============
export const MOCK_SCHEDULE_EVENTS = [
  { id: "e1", title: "Reunião de Onboarding - La Guapa", time: "10:00 - 11:00", type: "onboarding", date: "12/05/2025", client: "La Guapa", attendees: ["Camila Rocha"] },
  { id: "e2", title: "Apresentação Relatório Abril - Outback", time: "14:00 - 15:00", type: "report", date: "12/05/2025", client: "Outback", attendees: ["Letícia Souza", "Angelo Garcia"] },
  { id: "e3", title: "Call Estratégica - Bacio di Latte", time: "16:30 - 17:30", type: "strategy", date: "13/05/2025", client: "Bacio di Latte", attendees: ["Camila Rocha"] },
  { id: "e4", title: "Daily da Equipe", time: "09:30 - 09:45", type: "internal", date: "13/05/2025", client: "FoodMetrics", attendees: ["Toda equipe"] },
  { id: "e5", title: "Revisão de Criativos - Pizza Hut", time: "11:00 - 12:00", type: "review", date: "14/05/2025", client: "Pizza Hut", attendees: ["Letícia Souza"] },
];

// ============ NOTIFICAÇÕES ============
export const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "alert", title: "iFood: avaliação caiu pra 4.5", description: "Burger King (SP) — última hora", time: "Há 12 min", read: false, icon: "alert" },
  { id: "n2", type: "success", title: "Pagamento recebido", description: "Coco Bambu — R$ 15.000,00", time: "Há 1 hora", read: false, icon: "check" },
  { id: "n3", type: "info", title: "Novo relatório disponível", description: "Fechamento Abril 2025", time: "Há 2 horas", read: false, icon: "file" },
  { id: "n4", type: "message", title: "Nova mensagem de Outback", description: "Marina S.: Recebi o relatório, vou revisar...", time: "Há 4 horas", read: true, icon: "message" },
  { id: "n5", type: "alert", title: "Campanha Google pausou sozinha", description: "Madero Prime — orçamento esgotou", time: "Ontem", read: true, icon: "alert" },
];

// ============ MENSAGENS / CHAT ============
export const MOCK_MESSAGES = [
  { id: "msg1", from: "client", text: "Bom dia! Como ficou a campanha do Dia das Mães?", time: "09:14", read: true },
  { id: "msg2", from: "agency", text: "Bom dia Carlos! Já tá no ar desde ontem 🚀 Os primeiros números estão muito acima da meta — vou te mandar um print agora.", time: "09:16", read: true, sender: "Letícia Souza" },
  { id: "msg3", from: "agency", text: "CTR de 6.2% (meta era 4%) e CPA já está em R$ 3,40 (meta R$ 5,00)", time: "09:17", read: true, sender: "Letícia Souza" },
  { id: "msg4", from: "client", text: "Maravilha! Vamos aumentar o budget então?", time: "09:20", read: true },
  { id: "msg5", from: "agency", text: "Já subi de R$ 200/dia pra R$ 350/dia. Posso ir pra R$ 500 se mantiver a performance até quarta. OK pra você?", time: "09:22", read: false, sender: "Letícia Souza" },
];

// ============ ESTRATÉGIA (plano do mês) ============
export const MOCK_STRATEGY = {
  month: "Maio 2025",
  goals: [
    { id: "goal1", label: "Faturamento iFood", target: 260000, current: 245000, format: "currency" },
    { id: "goal2", label: "ROAS Médio", target: 12, current: 11.4, format: "number" },
    { id: "goal3", label: "Novos Clientes", target: 800, current: 620, format: "number" },
    { id: "goal4", label: "Avaliação Média", target: 4.9, current: 4.8, format: "number" },
  ],
  initiatives: [
    { id: "i1", title: "Campanha Dia dos Namorados", status: "in_progress", owner: "Letícia", deadline: "10/06" },
    { id: "i2", title: "Nova sessão de fotos do cardápio", status: "scheduled", owner: "Camila", deadline: "18/05" },
    { id: "i3", title: "Implementar programa de fidelidade", status: "pending", owner: "Rafael", deadline: "30/06" },
    { id: "i4", title: "Otimizar fluxo de delivery próprio", status: "in_progress", owner: "Letícia", deadline: "25/05" },
  ],
  recommendations: [
    "Aumentar investimento em Reels — performance 30% acima da meta",
    "Pausar campanha [YouTube] Brand Awareness — ROAS abaixo de 3",
    "Responder reviews 1-3 estrelas em até 6h pra melhorar média do iFood",
  ],
};

// ============ EQUIPE ============
export const MOCK_TEAM = [
  { id: "t1", name: "Angelo Garcia", role: "Founder / CEO", avatar: "AG", color: "#0F172A", clients: 3, tasksOpen: 8, online: true },
  { id: "t2", name: "Letícia Souza", role: "Gestora de Tráfego Sr.", avatar: "LS", color: "#e01c1c", clients: 6, tasksOpen: 14, online: true },
  { id: "t3", name: "Rafael Lima", role: "Gestor de Tráfego", avatar: "RL", color: "#ff8732", clients: 5, tasksOpen: 11, online: true },
  { id: "t4", name: "Camila Rocha", role: "Atendimento / SDR", avatar: "CR", color: "#10b981", clients: 4, tasksOpen: 6, online: false },
  { id: "t5", name: "João Pedro", role: "Designer", avatar: "JP", color: "#a855f7", clients: 8, tasksOpen: 19, online: false },
];

// ============ TAREFAS ============
export const MOCK_TASKS = [
  { id: "tk1", title: "Criar criativos Dia dos Namorados", client: "Burger King", owner: "João Pedro", status: "in_progress", dueDate: "20/05", priority: "high" },
  { id: "tk2", title: "Relatório de Performance - Abril", client: "Outback", owner: "Letícia Souza", status: "review", dueDate: "15/05", priority: "high" },
  { id: "tk3", title: "Setup pixel de conversão", client: "Pizza Hut", owner: "Rafael Lima", status: "todo", dueDate: "18/05", priority: "medium" },
  { id: "tk4", title: "Call de onboarding", client: "La Guapa", owner: "Camila Rocha", status: "todo", dueDate: "12/05", priority: "high" },
  { id: "tk5", title: "Otimizar campanhas Performance Max", client: "Coco Bambu", owner: "Rafael Lima", status: "in_progress", dueDate: "16/05", priority: "medium" },
  { id: "tk6", title: "Resposta de reviews iFood", client: "Madero", owner: "Letícia Souza", status: "done", dueDate: "10/05", priority: "low" },
];

// ============ MATERIAIS / CRIATIVOS ============
export const MOCK_MATERIALS = [
  { id: "ma1", type: "image", title: "Foto Whopper Duplo (Pack 1)", size: "12 imagens", date: "02/05/2025", status: "approved", thumbnail: "🍔" },
  { id: "ma2", type: "video", title: "Reels Bastidores Cozinha", size: "45s", date: "30/04/2025", status: "approved", thumbnail: "🎬" },
  { id: "ma3", type: "image", title: "Cardápio de Inverno (Carrossel)", size: "8 imagens", date: "10/05/2025", status: "pending", thumbnail: "📸" },
  { id: "ma4", type: "video", title: "Vídeo Brand Awareness 30s", size: "30s", date: "08/05/2025", status: "pending", thumbnail: "🎥" },
  { id: "ma5", type: "image", title: "Banners Dia dos Namorados", size: "6 imagens", date: "11/05/2025", status: "draft", thumbnail: "💕" },
];

// ============ HEATMAP DE PEDIDOS POR BAIRRO ============
export const MOCK_DELIVERY_HEATMAP = [
  { neighborhood: "Vila Madalena", orders: 312, revenue: 18540 },
  { neighborhood: "Pinheiros", orders: 287, revenue: 17080 },
  { neighborhood: "Itaim Bibi", orders: 245, revenue: 14580 },
  { neighborhood: "Moema", orders: 198, revenue: 11780 },
  { neighborhood: "Jardins", orders: 176, revenue: 10470 },
  { neighborhood: "Vila Olímpia", orders: 154, revenue: 9170 },
  { neighborhood: "Brooklin", orders: 142, revenue: 8450 },
];

// ============ DASHBOARD ADMIN — METRICS ============
export const MOCK_ADMIN_OVERVIEW = {
  mrr: 156800,
  mrrGrowth: 12.4,
  activeClients: 24,
  pendingClients: 3,
  churnRate: 2.1,
  totalManaged: 425000,
  totalRevenueGenerated: 4250000,
  mrrHistory: [128, 134, 139, 142, 148, 151, 156.8],
  clientsHistory: [18, 19, 20, 21, 22, 23, 24],
  spendHistory: [320, 345, 360, 380, 405, 418, 425],
};

// ============ CLIENTES POR REGIÃO (mapa) ============
export const MOCK_CLIENTS_BY_STATE = [
  { state: "SP", count: 14, revenue: 92000 },
  { state: "RJ", count: 5, revenue: 38000 },
  { state: "MG", count: 2, revenue: 12000 },
  { state: "PR", count: 1, revenue: 6000 },
  { state: "DF", count: 1, revenue: 12000 },
  { state: "RS", count: 1, revenue: 4800 },
];
