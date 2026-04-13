import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

serve(async (req) => {
  try {
    const { type, record } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
    if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY is not configured");

    const CHAT_ID = 372650941;
    let text = "";

    if (type === "new_appointment") {
      text = `📋 <b>Новая заявка на запись!</b>\n\n` +
        `👤 Клиент: ${record.client_name}\n` +
        `📞 Телефон: ${record.client_phone}\n` +
        `💅 Услуга: ${record.service_name}\n` +
        `👩‍💼 Мастер: ${record.master_name}\n` +
        `📅 Дата: ${record.appointment_date}\n` +
        `🕐 Время: ${record.appointment_time}\n` +
        `📝 Статус: ${record.status}`;
    } else if (type === "new_chat_session") {
      text = `💬 <b>Новая сессия чата</b>\n\n` +
        `👤 Клиент: ${record.client_name}\n` +
        `📞 Телефон: ${record.client_phone}`;
    } else if (type === "operator_requested") {
      text = `🚨 <b>Запрос оператора!</b>\n\n` +
        `👤 Клиент: ${record.client_name}\n` +
        `📞 Телефон: ${record.client_phone}\n\n` +
        `Клиент просит связаться с живым оператором.`;
    } else {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
    }

    const response = await fetch(`${GATEWAY_URL}/sendMessage`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Telegram API error:", JSON.stringify(data));
      throw new Error(`Telegram API failed [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ ok: true, message_id: data.result?.message_id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("telegram-notify error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
