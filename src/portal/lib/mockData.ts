export const MOCK_CLIENT_USER = {
  restaurant: "Burger King (Franquia SP)",
  type: "Fast Food Premium",
  avatar: "BK",
  color: "#ff8732"
};

export const MOCK_CLIENTS = [
  { id: "1", restaurant: "Burger King (SP)", email: "contato@bksp.com.br", type: "Fast Food", googleSpend: 15400, metaSpend: 8200, ifoodRating: 4.8, status: "active", avatar: "BK", color: "#ff8732" },
  { id: "2", restaurant: "Outback Steakhouse", email: "marketing@outback.com", type: "Casual Dining", googleSpend: 22000, metaSpend: 14500, ifoodRating: 4.9, status: "active", avatar: "OB", color: "#e01c1c" },
  { id: "3", restaurant: "Madero Prime", email: "gerencia@madero.com", type: "Premium Burger", googleSpend: 18500, metaSpend: 12000, ifoodRating: 4.7, status: "active", avatar: "MD", color: "#000000" },
  { id: "4", restaurant: "Pizza Hut (Moema)", email: "moema@pizzahut.com.br", type: "Pizzaria", googleSpend: 9200, metaSpend: 5100, ifoodRating: 4.6, status: "pending", avatar: "PH", color: "#c8102e" },
  { id: "5", restaurant: "Coco Bambu", email: "eventos@cocobambu.com", type: "Seafood", googleSpend: 31000, metaSpend: 25000, ifoodRating: 4.8, status: "active", avatar: "CB", color: "#bfa15f" },
  { id: "6", restaurant: "Paris 6", email: "admin@paris6.com.br", type: "Bistrô", googleSpend: 12000, metaSpend: 18000, ifoodRating: 4.5, status: "pending", avatar: "P6", color: "#54301a" },
];

export const MOCK_REPORTS = [
  { id: "r1", title: "Fechamento Mensal - Abril 2025", period: "01/04 a 30/04", status: "read", date: "02/05/2025" },
  { id: "r2", title: "Fechamento Mensal - Março 2025", period: "01/03 a 31/03", status: "read", date: "03/04/2025" },
  { id: "r3", title: "Relatório de Performance - Dia das Mães", period: "Especial", status: "sent", date: "15/05/2025" },
];

export const MOCK_GOOGLE_CAMPAIGNS = [
  { id: "g1", name: "[Pesquisa] Delivery Fundo de Funil", status: "Ativa", spend: 4500, conversions: 1250, cpa: 3.60, roas: 12.5 },
  { id: "g2", name: "[Performance Max] Almoço Executivo", status: "Ativa", spend: 2800, conversions: 840, cpa: 3.33, roas: 15.2 },
  { id: "g3", name: "[YouTube] Brand Awareness", status: "Pausada", spend: 1200, conversions: 45, cpa: 26.66, roas: 2.1 },
];

export const MOCK_META_CAMPAIGNS = [
  { id: "m1", name: "[Feed/Stories] Oferta de Domingo", status: "Ativa", spend: 2100, reach: 145000, clicks: 8400, ctr: 5.7 },
  { id: "m2", name: "[Reels] Vídeo Bastidores Cozinha", status: "Ativa", spend: 1500, reach: 220000, clicks: 12000, ctr: 5.4 },
  { id: "m3", name: "[Carrossel] Cardápio de Inverno", status: "Ativa", spend: 3200, reach: 98000, clicks: 5100, ctr: 5.2 },
];

export const MOCK_IFOOD_DATA = {
  rating: 4.8,
  orders: { today: 142, week: 984, month: 4120 },
  revenue: { today: 8520, week: 62400, month: 245000 },
  cancellations: 1.2,
};

export const MOCK_MONTHLY_SPEND = [
  { month: "Jan", google: 12000, meta: 8000 },
  { month: "Fev", google: 13500, meta: 9200 },
  { month: "Mar", google: 11000, meta: 8500 },
  { month: "Abr", google: 15400, meta: 11200 },
  { month: "Mai", google: 18200, meta: 14500 },
];

export const MOCK_CRM_LEADS = [
  { id: "l1", name: "La Guapa (Vila Madalena)", value: 5000, status: "lead", date: "10/05/2025" },
  { id: "l2", name: "Patties Burger", value: 8500, status: "contacted", date: "09/05/2025" },
  { id: "l3", name: "Bacio di Latte", value: 12000, status: "proposal", date: "08/05/2025" },
  { id: "l4", name: "Cabana Burger", value: 10000, status: "negotiation", date: "07/05/2025" },
  { id: "l5", name: "Fogo de Chão", value: 20000, status: "won", date: "05/05/2025" },
];

export const MOCK_FINANCE_INVOICES = [
  { id: "inv1", client: "Burger King (SP)", description: "Mensalidade Gestão Tráfego", amount: 4500, status: "paid", dueDate: "05/05/2025" },
  { id: "inv2", client: "Outback Steakhouse", description: "Mensalidade Gestão Tráfego + CRM", amount: 7500, status: "pending", dueDate: "15/05/2025" },
  { id: "inv3", client: "Madero Prime", description: "Setup de Infraestrutura de Dados", amount: 3000, status: "overdue", dueDate: "01/05/2025" },
  { id: "inv4", client: "Coco Bambu", description: "Consultoria Trimestral", amount: 15000, status: "paid", dueDate: "05/05/2025" },
];

export const MOCK_SCHEDULE_EVENTS = [
  { id: "e1", title: "Reunião de Onboarding - La Guapa", time: "10:00 - 11:00", type: "onboarding", date: "12/05/2025" },
  { id: "e2", title: "Apresentação Relatório Abril - Outback", time: "14:00 - 15:00", type: "report", date: "12/05/2025" },
  { id: "e3", title: "Call Estratégica - Bacio di Latte", time: "16:30 - 17:30", type: "strategy", date: "13/05/2025" },
];
