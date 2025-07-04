export default async function handler(req, res) {
  // --- 1. Guardianes de Seguridad ---
  // Comprueba que el método de la petición es POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']); // Informa al cliente qué métodos son válidos
    return res.status(405).json({ error: `El método ${req.method} no está permitido.` });
  }

  // Comprueba que el cuerpo (body) de la petición no venga vacío
  if (!req.body) {
    return res.status(400).json({ error: 'Falta el cuerpo (body) de la petición.' });
  }

  // --- 2. Extracción y Validación de los Datos ---
  const { nombre, email, canal, resumen } = req.body;

  // Comprueba que todos los campos necesarios están presentes en el body
  if (!nombre || !email || !canal || !resumen) {
    return res.status(400).json({ error: 'Faltan campos requeridos. Se necesita: nombre, email, canal y resumen.' });
  }

  // --- 3. Lógica Principal (Enviar a Slack) ---
  
  // ¡MUY IMPORTANTE! Saca tu webhook del código y ponlo en una variable de entorno.
  const slackWebhook = process.env.SLACK_WEBHOOK_URL;

  if (!slackWebhook) {
    console.error("La variable de entorno SLACK_WEBHOOK_URL no está definida.");
    // No le des detalles al cliente, es un error de configuración interno.
    return res.status(500).json({ error: "Error de configuración del servidor." });
  }

  const mensaje = {
    text: `📩 *Nuevo lead del chatbot de pAIneer Lab:*\n\n👤 *Nombre:* ${nombre}\n📧 *Email:* ${email}\n📱 *Canal:* ${canal}\n📝 *Resumen:* ${resumen}`
  };
  
  // Usamos try...catch para capturar errores de red (ej. si Slack está caído)
  try {
    const slackRes = await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mensaje)
    });

    if (slackRes.ok) {
      console.log("✅ Mensaje enviado a Slack correctamente.");
      return res.status(200).json({ status: "ok" });
    } else {
      // Si Slack devuelve un error, lo registramos para poder depurarlo
      const errorText = await slackRes.text();
      console.error("Error al enviar a Slack:", slackRes.status, errorText);
      return res.status(slackRes.status).json({ error: "Error al contactar con la API de Slack." });
    }
  } catch (error) {
    console.error("Error de conexión o al ejecutar fetch:", error);
    return res.status(500).json({ error: "Error de conexión con el servidor de Slack." });
  }
}
