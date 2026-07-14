exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Telegram is not configured" }),
    };
  }

  let reservation;
  try {
    reservation = JSON.parse(event.body || "{}");
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const text = [
    "Nouvelle reservation Residence Kanga",
    "",
    `Client : ${reservation.clientName || "-"}`,
    `Telephone : ${reservation.clientPhone || "-"}`,
    `Chambre : ${reservation.roomName || "-"}`,
    reservation.roomLocation ? `Localisation : ${reservation.roomLocation}` : "",
    `Arrivee : ${reservation.arrivalDate || "-"}`,
    `Depart : ${reservation.departureDate || "-"}`,
    `Tarif : ${reservation.roomPrice || "-"} FCFA/nuit`,
  ].filter(Boolean).join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!telegramResponse.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Telegram message failed" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};
