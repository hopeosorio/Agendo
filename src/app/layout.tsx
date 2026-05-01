import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import SecurityGuard from "@/components/SecurityGuard";

const bricolage = Bricolage_Grotesque({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-bricolage" 
});

export const viewport: Viewport = {
  themeColor: "#f8fafc",
};

export const metadata: Metadata = {
  title: "Agendo | Gestión de Citas de Élite",
  description: "La plataforma definitiva para gestionar tus citas, profesionales y múltiples sedes desde un solo lugar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      localization={esES}
      appearance={{
        variables: { 
          colorPrimary: "#2563EB", // Azul Agendo (Blue-600)
          borderRadius: "1.25rem",
          fontFamily: "var(--font-bricolage)",
        },
        elements: {
          card: "border border-slate-100 bg-white shadow-[0_30px_100px_rgba(0,0,0,0.05)] rounded-[40px] p-4",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white transition-all font-black uppercase text-[11px] tracking-[0.15em] h-14 shadow-xl shadow-blue-500/20 active:scale-95 border-none",
          headerTitle: "text-3xl font-black tracking-tighter text-slate-900 uppercase italic mb-2",
          headerSubtitle: "text-slate-500 font-bold text-sm tracking-tight", 
          socialButtonsBlockButton: "bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-200 transition-all text-slate-900 h-12 rounded-2xl",
          socialButtonsBlockButtonText: "text-slate-900 font-black text-xs uppercase tracking-tighter", 
          footerActionLink: "text-blue-600 font-black hover:text-blue-800 transition-colors",
          formFieldLabel: "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1", 
          formFieldInput: "bg-slate-50 border-2 border-slate-100 focus:border-blue-600 focus:bg-white transition-all h-14 text-slate-900 placeholder:text-slate-300 rounded-2xl px-5 font-bold",
          organizationSwitcherTrigger: "bg-white border border-slate-200 hover:border-blue-300 transition-all rounded-2xl h-12 px-4",
          organizationPreviewTextContainer: "text-left",
          organizationPreviewMainIdentifier: "font-black text-slate-900",
          userButtonAvatarBox: "w-10 h-10 rounded-2xl border-2 border-white shadow-md",
          // Estilos específicos para la pantalla de "Crear Organización"
          organizationProfile: "bg-transparent shadow-none",
          navbar: "hidden", // Opcional: ocultar barra lateral si es muy ruidosa
          breadcrumbs: "hidden",
          fileDropAreaBox: "border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 transition-all rounded-3xl",
          fileDropAreaIcon: "text-blue-600",
          formFieldInputShowPasswordButton: "text-slate-400 hover:text-blue-600"
        }
      }}
    >
      <html lang="es" className="scroll-smooth">
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD,opsz@100..700,0..1,-50..200,20..48&display=swap" rel="stylesheet" />
        </head>
        <body className={`${bricolage.variable} font-sans antialiased bg-[#f8fafc] text-slate-900`}>
          <SecurityGuard />
          <div className="relative min-h-screen">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
