import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { session_id, message } = await req.json();
    if (!session_id || !message) {
      return new Response(JSON.stringify({ error: "session_id and message required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);

    // Save user message
    await supabase.from("chat_messages").insert({
      session_id, role: "user", content: message,
    });

    // Load context in parallel
    const [servicesRes, mastersRes, historyRes, sessionRes] = await Promise.all([
      supabase.from("services").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("masters").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("chat_messages").select("*").eq("session_id", session_id).order("created_at"),
      supabase.from("chat_sessions").select("*").eq("id", session_id).single(),
    ]);

    const services = servicesRes.data || [];
    const masters = mastersRes.data || [];
    const history = historyRes.data || [];
    const session = sessionRes.data;

    const categoryNames: Record<string, string> = {
      nails: "Ногтевой сервис",
      hair: "Волосы",
      brows: "Брови и ресницы",
      face: "Уход за лицом",
      body: "Уход за телом",
      massage: "Массаж",
    };

    const servicesCatalog = services.map(s =>
      `- ${s.title} (${categoryNames[s.category] || s.category}): ${s.price}₽, ${s.duration}, ${s.description}`
    ).join("\n");

    const mastersCatalog = masters.map(m =>
      `- ${m.name} (${m.role}): опыт ${m.experience}, специализация: ${m.specialties.join(", ")}`
    ).join("\n");

    const systemPrompt = `Ты — AI-ассистент салона красоты TERRA в Москве. Твоя задача — помочь клиенту выбрать услугу, мастера, дату и время для записи.

Клиент: ${session?.client_name || "Гость"}, телефон: ${session?.client_phone || "не указан"}.

КАТАЛОГ УСЛУГ:
${servicesCatalog || "Услуги не загружены"}

МАСТЕРА:
${mastersCatalog || "Мастера не загружены"}

ПРАВИЛА:
1. Будь дружелюбным, профессиональным и кратким.
2. Помоги клиенту выбрать услугу исходя из его пожеланий.
3. Рекомендуй подходящих мастеров.
4. Когда клиент определился с услугой, мастером, датой и временем — предложи оформить запись.
5. Для оформления записи ответь СТРОГО в формате JSON (и ТОЛЬКО JSON, без текста до/после):
{"action":"book","service":"название услуги","master":"имя мастера","date":"YYYY-MM-DD","time":"HH:MM"}
6. Если не можешь помочь или клиент просит живого оператора — ответь СТРОГО:
{"action":"operator"}
7. Не придумывай услуги или мастеров, которых нет в каталоге.
8. Даты предлагай начиная с завтрашнего дня.
9. Время работы салона: 9:00–21:00.
10. Отвечай ТОЛЬКО на русском языке.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m: any) => ({
        role: m.role === "operator" ? "assistant" : m.role,
        content: m.content,
      })),
    ];

    // Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов, попробуйте позже" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Сервис временно недоступен" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    let assistantContent = aiData.choices?.[0]?.message?.content || "Извините, произошла ошибка.";

    // Check for action JSON
    let actionResult = null;
    try {
      const trimmed = assistantContent.trim();
      if (trimmed.startsWith("{")) {
        const parsed = JSON.parse(trimmed);
        if (parsed.action === "book") {
          // Find service and master
          const service = services.find((s: any) =>
            s.title.toLowerCase() === parsed.service?.toLowerCase()
          );
          const master = masters.find((m: any) =>
            m.name.toLowerCase() === parsed.master?.toLowerCase()
          );

          const { error: bookError } = await supabase.from("appointments").insert({
            client_name: session?.client_name || "Гость",
            client_phone: session?.client_phone || "",
            service_name: parsed.service || "",
            service_id: service?.id || null,
            master_name: parsed.master || "",
            master_id: master?.id || null,
            appointment_date: parsed.date,
            appointment_time: parsed.time,
            status: "new",
          });

          if (bookError) {
            console.error("Booking error:", bookError);
            assistantContent = "Произошла ошибка при создании записи. Пожалуйста, попробуйте ещё раз или обратитесь к оператору.";
          } else {
            assistantContent = `✅ Отлично! Вы записаны:\n\n📋 **Услуга:** ${parsed.service}\n👩‍💼 **Мастер:** ${parsed.master}\n📅 **Дата:** ${parsed.date}\n🕐 **Время:** ${parsed.time}\n\nМы свяжемся с вами для подтверждения. Спасибо!`;
            actionResult = "booked";
          }
        } else if (parsed.action === "operator") {
          await supabase.from("chat_sessions")
            .update({ status: "operator_requested" })
            .eq("id", session_id);
          assistantContent = "Я передал ваш запрос оператору. Он свяжется с вами в ближайшее время. Пожалуйста, подождите.";
          actionResult = "operator_requested";
        }
      }
    } catch {
      // Not JSON, regular text response
    }

    // Save assistant message
    await supabase.from("chat_messages").insert({
      session_id, role: "assistant", content: assistantContent,
    });

    return new Response(JSON.stringify({
      reply: assistantContent,
      action: actionResult,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
