import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * 🛰️ AGENDO NOTIFICATION ENGINE (v1.0)
 * Sistema de abstracción para mensajería transaccional.
 */

interface WhatsAppParams {
  to: string;
  customerName: string;
  serviceName: string;
  startTime: Date;
  tenantName: string;
}

export async function sendWhatsAppConfirmation({
  to,
  customerName,
  serviceName,
  startTime,
  tenantName
}: WhatsAppParams) {
  // Limpiar el número de teléfono
  const cleanPhone = to.replace(/\D/g, "");
  
  // Plantilla de Mensaje (Deep-Tech Style)
  const dateStr = format(startTime, "EEEE d 'de' MMMM", { locale: es });
  const timeStr = format(startTime, "HH:mm");
  
  const message = `Hola *${customerName}* 👋

Tu cita en *${tenantName}* ha sido confirmada con éxito.

🗓️ *Día:* ${dateStr}
🕒 *Hora:* ${timeStr}h
💼 *Servicio:* ${serviceName}

_Por favor, llega 5 minutos antes de tu cita. Si necesitas reprogramar, hazlo con 24h de antelación._

✨ Gracias por confiar en la red Agendo.`;

  console.log(`[Agendo Notifications] 🚀 Intentando enviar WhatsApp a: ${cleanPhone}`);
  console.log(`[Agendo Notifications] 📝 Contenido:\n${message}`);

  // --- CONFIGURACIÓN DE PROVEEDOR (EJEMPLO CON TWILIO) ---
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // ej: "whatsapp:+14155238886"

  if (!accountSid || !authToken || !from) {
    console.warn("[Agendo Notifications] ⚠️ Falta configuración de Twilio. El mensaje se ha logueado pero no enviado físicamente.");
    return { success: false, mode: "mock", message: "Configuración incompleta" };
  }

  try {
     // Usamos fetch nativo para evitar dependencias pesadas en el servidor si es necesario
     // aunque la librería oficial 'twilio' es preferible en producción.
     const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
           'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({
           To: `whatsapp:+${cleanPhone}`,
           From: from,
           Body: message,
        }),
     });

     const data = await response.json();
     if (response.ok) {
        console.log("[Agendo Notifications] ✅ Mensaje enviado exitosamente vía Twilio.");
        return { success: true, sid: data.sid };
     } else {
        console.error("[Agendo Notifications] ❌ Error de Twilio:", data);
        return { success: false, error: data };
     }

  } catch (error) {
     console.error("[Agendo Notifications] ❌ Error fatal en el motor de mensajería:", error);
     return { success: false, error };
  }
}

interface EmailParams {
  to: string;
  customerName: string;
  serviceName: string;
  startTime: Date;
  tenantName: string;
  tenantAddress?: string;
  logoUrl?: string;
  coordinates?: { lat: number; lng: number };
}

export async function sendEmailConfirmation({
  to,
  customerName,
  serviceName,
  startTime,
  tenantName,
  tenantAddress,
  logoUrl,
  coordinates
}: EmailParams) {
  const dateStr = format(startTime, "EEEE d 'de' MMMM 'a las' HH:mm'h'", { locale: es });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("[Agendo Email] ⚠️ Falta configuración. Correo simulado para:", to);
    return { success: false, mode: 'mock' };
  }

  // Normalizar Logo URL (Asegurar que sea absoluta y apunte al bucket correcto)
  let finalLogoUrl = logoUrl;
  if (logoUrl && !logoUrl.startsWith("http")) {
    const bucketPath = logoUrl.includes("logos/") ? logoUrl : `logos/${logoUrl}`;
    finalLogoUrl = `${supabaseUrl}/storage/v1/object/public/${bucketPath}`;
  } else if (logoUrl && (logoUrl.includes("clerk.com") || logoUrl.startsWith("http"))) {
    // Si ya es una URL de Clerk o externa, la mantenemos intacta
    finalLogoUrl = logoUrl;
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/send-booking-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        to,
        customerName,
        serviceName,
        startTime: dateStr,
        tenantName,
        tenantAddress,
        logoUrl: finalLogoUrl,
        coordinates
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log("[Agendo Email] ✅ Correo enviado vía Supabase Edge Function.");
      return { success: true, data };
    } else {
      console.error("[Agendo Email] ❌ Error en Supabase Edge Function:", data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.error("[Agendo Email] ❌ Error fatal enviando correo:", error);
    return { success: false, error };
  }
}
