export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  console.log("✅ Endpoint recibido correctamente");
  //tweak for redeploy 1.0.1

  const { nombre, email, canal, resumen } = req.body;

  const slackWebhook = "https://hooks.slack.com/services/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"; // ← Pega tu webhook aquí

  const mensaje = {
    text: `📩 *Nuevo lead del chatbot de pAIneer Lab:*

👤 *Nombre:* ${nombre}
📧 *Email:* ${email}
📱 *Canal:* ${canal}
📝 *Resumen:* ${resumen}`
  };

  const slackRes = await fetch(slackWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mensaje)
  });

  if (slackRes.ok) {
    res.status(200).json({ status: "ok" });
  } else {
    res.status(500).json({ error: "Slack error" });
  }
}
