import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts";

// --- Deno 2.x Compatibility Patch ---
if (typeof (Deno as any).writeAll !== 'function') {
  (Deno as any).writeAll = async (writer: any, data: Uint8Array) => {
    let offset = 0;
    while (offset < data.byteLength) {
      const n = await writer.write(data.subarray(offset));
      if (n === 0) break;
      offset += n;
    }
  };
}
if (typeof (Deno as any).copy !== 'function') {
  (Deno as any).copy = async (src: any, dst: any) => {
    let count = 0;
    const buf = new Uint8Array(32 * 1024);
    while (true) {
      const n = await src.read(buf);
      if (n === null || n === 0) break;
      await (Deno as any).writeAll(dst, buf.subarray(0, n));
      count += n;
    }
    return count;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "";
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") ?? "465");
const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
const SMTP_PASS = Deno.env.get("SMTP_PASS") ?? "";
const SMTP_FROM = Deno.env.get("SMTP_FROM") ?? "Agendo <noreply@agendo.com>";
const SMTP_SECURE = (Deno.env.get("SMTP_SECURE") ?? "true").toLowerCase() !== "false";

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, customerName, serviceName, startTime, tenantName, tenantAddress, logoUrl, coordinates } = await req.json();

    if (!to) {
      throw new Error("No email address provided");
    }

    // Construir URL de Maps priorizando Coordenadas
    let mapsUrl = null;
    if (coordinates && coordinates.lat && coordinates.lng) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
    } else if (tenantAddress) {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenantAddress)}`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Cita</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              
              <!-- Main Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" style="padding: 50px 40px 30px 40px;">
                    ${logoUrl ? `
                      <img src="${logoUrl}" alt="${tenantName}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 20px; border: 1px solid #f1f5f9;">
                    ` : `
                      <div style="width: 80px; height: 80px; background-color: #0f172a; border-radius: 20px; display: inline-block; text-align: center; color: #ffffff; font-size: 32px; font-weight: 900; line-height: 80px;">
                        ${tenantName.charAt(0)}
                      </div>
                    `}
                    <h1 style="margin: 30px 0 10px 0; font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -1px;">Confirmación de Cita</h1>
                    <p style="margin: 0; font-size: 16px; color: #64748b; font-weight: 500;">Hola ${customerName}, tu reserva en ${tenantName} ha sido agendada con éxito.</p>
                  </td>
                </tr>

                <!-- Details Card -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafbff; border-radius: 24px; border: 1px solid #f1f5f9;">
                      <tr>
                        <td style="padding: 30px;">
                          <div style="margin-bottom: 24px;">
                            <p style="margin: 0 0 6px 0; font-size: 9px; font-weight: 900; color: #6366f1; text-transform: uppercase; letter-spacing: 2px;">Servicio Solicitado</p>
                            <p style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">${serviceName}</p>
                          </div>
                          
                          <div>
                            <p style="margin: 0 0 6px 0; font-size: 9px; font-weight: 900; color: #6366f1; text-transform: uppercase; letter-spacing: 2px;">Fecha y Horario</p>
                            <p style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; text-transform: capitalize;">${startTime}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Location Info -->
                ${tenantAddress || mapsUrl ? `
                <tr>
                  <td style="padding: 0 40px 50px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #f1f5f9; padding-top: 30px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">Ubicación de la Cita</p>
                          <p style="margin: 0 0 24px 0; font-size: 15px; color: #64748b; line-height: 1.6; font-weight: 500;">${tenantAddress || 'Ver mapa para ubicación exacta'}</p>
                          
                          ${mapsUrl ? `
                          <a href="${mapsUrl}" target="_blank" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 18px 36px; border-radius: 16px; font-size: 11px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 1.5px;">
                            Ver Mapa y Navegar
                          </a>
                          ` : ''}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}

                <!-- Brand Footer -->
                <tr>
                  <td align="center" style="padding: 0 40px 40px 40px; border-top: 1px solid #f1f5f9;">
                    <p style="margin: 30px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">${tenantName} • Gestión de Citas Profesional</p>
                  </td>
                </tr>

              </table>

              <!-- Footer Legal -->
              <p style="margin: 30px 0 0 0; font-size: 10px; color: #cbd5e1; text-align: center; font-weight: 500;">
                Este es un mensaje automático del sistema Agendo. Por favor no respondas directamente.
              </p>

            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const client = new SmtpClient();
    
    if (SMTP_SECURE) {
      await client.connectTLS({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USER,
        password: SMTP_PASS,
      });
    } else {
      await client.connect({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USER,
        password: SMTP_PASS,
      });
    }

    await client.send({
      from: SMTP_FROM,
      to: to,
      subject: `Confirmación de Cita - ${tenantName}`,
      content: `Hola ${customerName}, tu cita en ${tenantName} para el ${startTime} ha sido confirmada.`,
      html: htmlContent,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true, message: "Email sent via SMTP" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
