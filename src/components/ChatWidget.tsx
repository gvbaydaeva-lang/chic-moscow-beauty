import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const STORAGE_KEY = "terra_chat_session";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"register" | "chat">("register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setSessionId(data.session_id);
        setStep("chat");
      } catch { /* ignore */ }
    }
  }, []);

  // Load messages when session exists
  useEffect(() => {
    if (!sessionId) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at");
      if (data) setMessages(data);
    };
    loadMessages();
  }, [sessionId]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return;
    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !agreed) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ client_name: name.trim(), client_phone: phone.trim() })
      .select()
      .single();
    if (error || !data) {
      setLoading(false);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ session_id: data.id }));
    setSessionId(data.id);
    setStep("chat");
    setLoading(false);

    // Send welcome via AI
    sendMessage("Привет!", data.id);
  };

  const sendMessage = useCallback(async (text: string, sid?: string) => {
    const currentSessionId = sid || sessionId;
    if (!currentSessionId || !text.trim()) return;
    setLoading(true);
    setInput("");

    // Optimistic user message
    if (!sid) {
      const optimistic: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, optimistic]);
    }

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ session_id: currentSessionId, message: text }),
        }
      );
      if (!resp.ok) {
        console.error("Chat error:", resp.status);
      }
      // Messages will arrive via realtime
    } catch (e) {
      console.error("Chat error:", e);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading) sendMessage(input);
  };

  const requestOperator = async () => {
    if (!sessionId) return;
    setLoading(true);
    await supabase.from("chat_sessions").update({ status: "operator_requested" }).eq("id", sessionId);
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: "Хочу поговорить с оператором",
    });
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[520px] bg-background border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <span className="font-medium text-sm">Ассистент TERRA</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {step === "register" ? (
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Представьтесь, чтобы начать чат с нашим ассистентом
              </p>
              <input
                placeholder="Ваше имя"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md"
              />
              <input
                placeholder="Телефон"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-input bg-background px-3 py-2 text-sm rounded-md"
              />
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Согласен с{" "}
                  <Link to="/privacy" className="underline" onClick={() => setOpen(false)}>
                    политикой конфиденциальности
                  </Link>
                </span>
              </label>
              <button
                onClick={handleRegister}
                disabled={!name.trim() || !phone.trim() || !agreed || loading}
                className="w-full bg-primary text-primary-foreground py-2 text-sm rounded-md disabled:opacity-50"
              >
                {loading ? "Загрузка..." : "Начать чат"}
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px] max-h-[360px]">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : msg.role === "operator"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.role === "operator" && (
                        <div className="flex items-center gap-1 text-xs font-medium mb-1">
                          <UserRound className="w-3 h-3" /> Оператор
                        </div>
                      )}
                      <div className="prose prose-sm max-w-none [&>p]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm">
                      Печатает...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-2">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1 border border-input bg-background px-3 py-2 text-sm rounded-md"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="bg-primary text-primary-foreground p-2 rounded-md disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <button
                  onClick={requestOperator}
                  disabled={loading}
                  className="w-full text-xs text-muted-foreground mt-2 hover:underline"
                >
                  Позвать оператора
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
