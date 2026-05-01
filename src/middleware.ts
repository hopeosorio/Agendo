import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// Definimos las rutas que son TOTALMENTE públicas
// Incluimos las de login/registro para evitar bucles de redirección
const isPublicRoute = createRouteMatcher([
  "/",               // Página de aterrizaje
  "/book(.*)",       // Portal de reservas público
  "/sign-in(.*)",    // Página de login (Admin)
  "/sign-up(.*)",    // Página de registro (Admin)
  "/invitation(.*)", // Nueva página de invitación
  "/api/webhooks(.*)" // Webhooks dinámicos
]);

export default clerkMiddleware(async (auth: any, request: NextRequest) => {
  // Si la ruta NO es pública, forzar autenticación
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Optimización del matcher para saltar estáticos y procesar dinámicos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
