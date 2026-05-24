import React, { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Smile, Search } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import { fmt } from "../../lib/format";
import { useMyClient, useConversation } from "../../lib/api";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";

export function MessagesView() {
  const { data: client } = useMyClient();
  const { messages, loading, sendMessage } = useConversation(client?.id);
  const [draft, setDraft] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!draft.trim()) return;
    await sendMessage(draft);
    setDraft("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
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
          <button className="w-full flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 border-l-2 border-l-[#e01c1c] text-left">
            <Avatar name="Letícia Souza" color="#e01c1c" status="online" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-900 dark:text-white truncate">Letícia Souza</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Gestora de conta</p>
              <p className="text-[12px] text-slate-600 dark:text-slate-300 truncate font-medium mt-1">
                {messages[messages.length - 1]?.content ?? "..."}
              </p>
            </div>
          </button>
        </div>
      </Card>

      <Card padded={false} className="lg:col-span-3 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name="Letícia Souza" color="#e01c1c" status="online" />
            <div>
              <p className="text-[14px] font-bold text-slate-900 dark:text-white">Letícia Souza</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Sua gestora · online agora</p>
            </div>
          </div>
          <Badge tone="success" dot>Realtime ON</Badge>
        </div>

        {loading ? (
          <div className="flex-1 p-6 space-y-3">
            {[1,2,3,4].map(i => <Skeleton key={i} className={i % 2 ? "h-16 w-2/3 ml-auto" : "h-16 w-2/3"} />)}
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-[#0B1120]/30">
            {messages.length === 0 ? (
              <p className="text-center text-slate-400 text-[13px] mt-12 font-medium">Sem mensagens ainda. Mande a primeira!</p>
            ) : messages.map((m: any, i: number) => {
              const isMe = m.sender_id === currentUserId;
              const showAvatar = !isMe && (i === 0 || messages[i - 1].sender_id !== m.sender_id);
              return (
                <div key={m.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                  {!isMe && (
                    <div className="w-8">
                      {showAvatar && <Avatar name={m.sender?.full_name ?? "?"} color="#e01c1c" size="sm" />}
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm",
                    isMe
                      ? "bg-gradient-to-br from-[#e01c1c] to-[#c81717] text-white rounded-br-sm"
                      : "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-800/60 rounded-bl-sm"
                  )}>
                    <p className="text-[13px] font-medium leading-relaxed">{m.content}</p>
                    <p className={cn("text-[10px] mt-1 font-bold", isMe ? "text-white/70" : "text-slate-400")}>
                      {fmt.time(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
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
              placeholder="Escreva uma mensagem..."
              rows={1}
              className="flex-1 resize-none bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#e01c1c]/30 focus:border-[#e01c1c]/40"
            />
            <button className="p-2.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Smile size={18} />
            </button>
            <Button onClick={handleSend} variant="primary" icon={Send}>Enviar</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
