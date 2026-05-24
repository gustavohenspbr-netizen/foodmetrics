import React, { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Search, MessageSquare } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { fmt } from "../../lib/format";
import {
  useConversationsList,
  useConversationMessages,
  sendMessage,
} from "../../lib/api";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";

export function MessagesView() {
  const { conversations, loading } = useConversationsList();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { messages, loading: lMsgs } = useConversationMessages(activeId);
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  // Auto-seleciona a primeira conversa quando carrega
  useEffect(() => {
    if (!activeId && conversations.length > 0) setActiveId(conversations[0].id);
  }, [conversations, activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const filtered = conversations.filter((c: any) =>
    !search || c.client?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeConv = conversations.find((c: any) => c.id === activeId);

  async function handleSend() {
    if (!draft.trim() || !activeId) return;
    const text = draft;
    setDraft("");
    const { error } = await sendMessage(activeId, text);
    if (error) {
      setDraft(text);
      console.error(error);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Inbox — lista de conversas */}
      <Card padded={false} className="lg:col-span-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full h-10 pl-10 pr-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-3 space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={MessageSquare} title="Sem conversas" description="Quando um cliente mandar mensagem, aparece aqui." />
          ) : (
            filtered.map((c: any) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left border-l-2",
                    isActive
                      ? "bg-slate-50 dark:bg-slate-800/40 border-l-[#e01c1c]"
                      : "border-l-transparent"
                  )}
                >
                  <Avatar name={c.client?.name ?? "?"} color={c.client?.color ?? "#888"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                        {c.client?.name ?? "Sem cliente"}
                      </p>
                      {c.lastMessage?.created_at && (
                        <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">
                          {fmt.time(c.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className="text-[12px] text-slate-600 dark:text-slate-300 truncate font-medium">
                        {c.lastMessage?.content ?? "Sem mensagens"}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[#e01c1c] text-white flex-shrink-0">
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* Chat */}
      <Card padded={false} className="lg:col-span-3 flex flex-col overflow-hidden">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Selecione uma conversa"
              description="Clique num cliente da lista pra abrir o chat."
            />
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={activeConv?.client?.name ?? "?"} color={activeConv?.client?.color ?? "#888"} />
                <div>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">
                    {activeConv?.client?.name ?? "Cliente"}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    {activeConv?.subject ?? "Atendimento"}
                  </p>
                </div>
              </div>
              <Badge tone="success" dot>Realtime ON</Badge>
            </div>

            {lMsgs ? (
              <div className="flex-1 p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className={i % 2 ? "h-16 w-2/3" : "h-16 w-2/3 ml-auto"} />
                ))}
              </div>
            ) : (
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-[#0B1120]/30">
                {messages.length === 0 ? (
                  <p className="text-center text-slate-400 text-[13px] mt-12 font-medium">
                    Sem mensagens nessa conversa ainda.
                  </p>
                ) : (
                  messages.map((m: any, i: number) => {
                    const isMe = m.sender_id === currentUserId;
                    const showAvatar = !isMe && (i === 0 || messages[i - 1].sender_id !== m.sender_id);
                    return (
                      <div key={m.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                        {!isMe && (
                          <div className="w-8">
                            {showAvatar && (
                              <Avatar
                                name={m.sender?.full_name ?? activeConv?.client?.name ?? "?"}
                                color={m.sender_type === "client" ? activeConv?.client?.color ?? "#888" : "#e01c1c"}
                                size="sm"
                              />
                            )}
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm",
                            isMe
                              ? "bg-gradient-to-br from-[#e01c1c] to-[#c81717] text-white rounded-br-sm"
                              : "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 rounded-bl-sm"
                          )}
                        >
                          <p className="text-[13px] font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          <p className={cn("text-[10px] mt-1 font-bold", isMe ? "text-white/70" : "text-slate-400")}>
                            {fmt.time(m.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

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
                      handleSend();
                    }
                  }}
                  placeholder="Responder..."
                  rows={1}
                  className="flex-1 resize-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/30 focus:border-[#e01c1c]/40"
                />
                <Button onClick={handleSend} variant="primary" icon={Send} disabled={!draft.trim()}>
                  Enviar
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
