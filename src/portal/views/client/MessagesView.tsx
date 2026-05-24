import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Search } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { MOCK_MESSAGES } from "../../lib/mockData";
import { cn } from "../../lib/cn";

export function MessagesView() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  function send() {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg${Date.now()}`,
        from: "client",
        text: draft,
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        read: false,
      },
    ]);
    setDraft("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* SIDEBAR CONVERSAS */}
      <Card padded={false} className="lg:col-span-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar conversas..."
              className="w-full h-10 pl-10 pr-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[
            { name: "Letícia Souza", role: "Gestora de conta", last: "OK pra você?", time: "09:22", unread: 1, color: "#e01c1c", online: true, active: true },
            { name: "Rafael Lima", role: "Suporte técnico", last: "Já implementei o pixel...", time: "Ontem", unread: 0, color: "#ff8732", online: true },
            { name: "Camila Rocha", role: "Atendimento", last: "Vou agendar a call de...", time: "10/05", unread: 0, color: "#10b981", online: false },
          ].map((c, i) => (
            <button
              key={i}
              className={cn(
                "w-full flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left border-l-2",
                c.active
                  ? "bg-slate-50 dark:bg-slate-800/40 border-l-[#e01c1c]"
                  : "border-l-transparent"
              )}
            >
              <Avatar name={c.name} color={c.color} status={c.online ? "online" : "offline"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                  <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">{c.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{c.role}</p>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <p className="text-[12px] text-slate-600 dark:text-slate-300 truncate font-medium">{c.last}</p>
                  {c.unread > 0 && (
                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[#e01c1c] text-white flex-shrink-0">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* CHAT */}
      <Card padded={false} className="lg:col-span-3 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name="Letícia Souza" color="#e01c1c" status="online" />
            <div>
              <p className="text-[14px] font-bold text-slate-900 dark:text-white">Letícia Souza</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Sua gestora de conta · online agora
              </p>
            </div>
          </div>
          <Badge tone="success" dot>SLA OK</Badge>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-[#0B1120]/30">
          {messages.map((m, i) => {
            const isMe = m.from === "client";
            const showAvatar = !isMe && (i === 0 || messages[i - 1].from !== m.from);
            return (
              <div key={m.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                {!isMe && (
                  <div className="w-8">{showAvatar && <Avatar name="Letícia" color="#e01c1c" size="sm" />}</div>
                )}
                <div
                  className={cn(
                    "max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm",
                    isMe
                      ? "bg-gradient-to-br from-[#e01c1c] to-[#c81717] text-white rounded-br-sm"
                      : "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 rounded-bl-sm"
                  )}
                >
                  <p className="text-[13px] font-medium leading-relaxed">{m.text}</p>
                  <p className={cn("text-[10px] mt-1 font-bold", isMe ? "text-white/70" : "text-slate-400")}>
                    {m.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-end gap-2">
            <button className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Paperclip size={18} />
            </button>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Escreva uma mensagem..."
              rows={1}
              className="flex-1 resize-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/30 focus:border-[#e01c1c]/40"
            />
            <button className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Smile size={18} />
            </button>
            <Button onClick={send} variant="primary" icon={Send}>
              Enviar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
