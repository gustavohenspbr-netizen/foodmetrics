/**
 * Helpers pra montar links de WhatsApp.
 * Normaliza número brasileiro (remove espaços/traços/parênteses, garante prefixo 55).
 */

export function normalizeWhatsApp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  // Se começa com 0, remove
  if (digits.startsWith("0")) digits = digits.slice(1);
  // Se tem 10-11 dígitos (DDD + número), prepend 55
  if (digits.length === 10 || digits.length === 11) digits = "55" + digits;
  // Se já começa com 55 e tem 12-13 digits, mantém
  return digits;
}

/**
 * Formata um número pra exibição: (11) 98765-4321
 */
export function formatPhoneDisplay(raw: string | null | undefined): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return raw;
}

/**
 * Constrói URL do WhatsApp Web/App com mensagem opcional pre-preenchida.
 */
export function buildWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const number = normalizeWhatsApp(phone);
  if (!number) return null;
  const base = `https://wa.me/${number}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Templates de mensagens prontas pra usar.
 */
export const waTemplates = {
  greeting: (contactName: string | null, agencyName = "FoodMetrics") =>
    `Olá ${contactName ?? ""}! Aqui é da ${agencyName}. Tudo bem?`,

  billing: (opts: {
    contactName: string | null;
    restaurantName: string;
    invoiceDescription?: string;
    amount?: number;
    dueDate?: string;
  }) => {
    const name = opts.contactName ? `Olá ${opts.contactName.split(" ")[0]}!` : "Olá!";
    const valor = opts.amount
      ? ` no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(opts.amount)}`
      : "";
    const desc = opts.invoiceDescription ? ` (${opts.invoiceDescription})` : "";
    const vencido = opts.dueDate
      ? ` com vencimento em ${new Date(opts.dueDate).toLocaleDateString("pt-BR")}`
      : "";
    return `${name} Aqui é da FoodMetrics. Notei que a fatura${desc}${valor}${vencido} ainda está em aberto. Pode me confirmar o pagamento ou se precisa de algum ajuste? Obrigado!`;
  },

  reportReady: (contactName: string | null, period: string) =>
    `Olá ${contactName?.split(" ")[0] ?? ""}! O relatório de ${period} está pronto no seu portal FoodMetrics. Quer agendar uma call pra revisar os números juntos?`,

  followUp: (contactName: string | null) =>
    `Olá ${contactName?.split(" ")[0] ?? ""}! Como está o andamento por aí? Estou disponível pra qualquer dúvida sobre as campanhas.`,
};
