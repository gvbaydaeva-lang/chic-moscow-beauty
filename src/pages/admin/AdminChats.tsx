import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ChatSession {
  id: string;
  client_name: string;
  client_phone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  active: "Активный",
  operator_requested: "Ожидает оператора",
  closed: "Закрыт",
};

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  operator_requested: "bg-destructive/10 text-destructive",
  closed: "bg-muted text-muted-foreground",
};

const AdminChats = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["admin-chats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as ChatSession[];
    },
    refetchInterval: 5000,
  });

  // Load messages when session selected
  useEffect(() => {
    if (!selectedSession) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", selectedSession)
        .order("created_at");
      if (data) setMessages(data);
    };
    load();
  }, [selectedSession]);

  // Realtime for messages
  useEffect(() => {
    if (!selectedSession) return;
    const channel = supabase
      .channel(`admin-chat-${selectedSession}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `session_id=eq.${selectedSession}`,
      }, (payload) => {
        const msg = payload.new as ChatMessage;
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedSession]);

  // Realtime for sessions (new tickets)
  useEffect(() => {
    const channel = supabase
      .channel("admin-sessions")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "chat_sessions",
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!reply.trim() || !selectedSession || sending) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      session_id: selectedSession,
      role: "operator",
      content: reply.trim(),
    });
    setReply("");
    setSending(false);
  };

  const closeSession = async (id: string) => {
    await supabase.from("chat_sessions").update({ status: "closed" }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-chats"] });
  };

  const filtered = sessions.filter(s => !statusFilter || s.status === statusFilter);
  const operatorCount = sessions.filter(s => s.status === "operator_requested").length;

  // Session detail view
  if (selectedSession) {
    const session = sessions.find(s => s.id === selectedSession);
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setSelectedSession(null)} className="p-1 hover:bg-muted rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-medium">{session?.client_name}</h3>
            <p className="text-xs text-muted-foreground">📞 {session?.client_phone}</p>
          </div>
          {session?.status !== "closed" && (
            <button
              onClick={() => closeSession(selectedSession)}
              className="ml-auto text-xs bg-muted px-3 py-1 rounded-sm"
            >
              Закрыть чат
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto border border-border rounded-sm p-3 space-y-2 bg-card">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                msg.role === "user"
                  ? "bg-primary/10 text-foreground"
                  : msg.role === "operator"
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                <div className="text-[10px] font-medium mb-0.5 opacity-70">
                  {msg.role === "user" ? "Клиент" : msg.role === "operator" ? "Оператор" : "Бот"}
                </div>
                <div className="prose prose-sm max-w-none [&>p]:m-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {session?.status !== "closed" && (
          <div className="mt-3 flex gap-2">
            <Input
              value={reply}
              onChange={e => setReply(e.target.value)}
              placeholder="Ответить как оператор..."
              onKeyDown={e => e.key === "Enter" && sendReply()}
            />
            <button
              onClick={sendReply}
              disabled={!reply.trim() || sending}
              className="bg-primary text-primary-foreground p-2 rounded-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Sessions list
  return (
    <div>
      <h2 className="font-heading text-2xl mb-6">
        Чаты
        {operatorCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs bg-destructive text-destructive-foreground rounded-full">
            {operatorCount}
          </span>
        )}
      </h2>

      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-input bg-background px-3 py-2 text-sm rounded-md"
        >
          <option value="">Все чаты</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">Чатов пока нет</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSession(s.id)}
              className="w-full text-left bg-card border border-border rounded-sm p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{s.client_name}</span>
                  <span className="text-sm text-muted-foreground ml-2">📞 {s.client_phone}</span>
                </div>
                <span className={`px-2 py-0.5 text-xs rounded-sm ${statusColors[s.status] || ""}`}>
                  {statusLabels[s.status] || s.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(s.updated_at).toLocaleString("ru-RU")}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChats;
