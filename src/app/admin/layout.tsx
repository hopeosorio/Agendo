"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserButton, OrganizationSwitcher, useOrganization, useOrganizationList, useUser, SignOutButton } from "@clerk/nextjs";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Layers, 
  Clock, 
  Settings,
  CalendarCheck,
  Building2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Zap,
  HelpCircle,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getSettings } from "@/app/actions/settings";
import { syncTenant } from "@/app/actions/onboarding";
import { NavigationProvider, useNavigationGuard } from "@/context/NavigationContext";
import { AlertTriangle, X, Loader2 as LoaderIcon } from "lucide-react";

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: "Resumen", href: "/admin" },
  { icon: CalendarCheck, label: "Citas", href: "/admin/appointments" },
  { icon: Users, label: "Clientes", href: "/admin/clients" },
  { icon: Layers, label: "Servicios", href: "/admin/services" },
  { icon: Clock, label: "Disponibilidad", href: "/admin/schedule" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { organization, isLoaded: isOrgLoaded, membership } = useOrganization();
  const { userMemberships } = useOrganizationList({ userMemberships: true });
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite_token") || undefined;

  const isAdmin = membership?.role === "org:admin";
  
  // Filtrar el menú según el rol
  const filteredMenuItems = MENU_ITEMS.filter(item => {
    if (isAdmin) return true;
    // Los miembros normales solo ven Resumen, Citas y Clientes
    return ["Resumen", "Citas", "Clientes"].includes(item.label);
  });
  
  const [dbTenant, setDbTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si hay un token, sincronizamos de inmediato para vincular al usuario
    if (inviteToken) {
      handleSync(inviteToken);
    } else if (isOrgLoaded && organization) {
      handleSync();
    }
  }, [isOrgLoaded, organization, inviteToken]);

  const handleSync = async (token?: string) => {
    try {
      const data: any = await syncTenant(token);
      if (data?.redirect) {
        window.location.href = "/admin";
        return;
      }
      setDbTenant(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTenantData = async () => {
    try {
      const data = await getSettings();
      setDbTenant(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const hasMultipleOrgs = (userMemberships?.data?.length ?? 0) > 1;
  const bookingUrl = dbTenant?.slug 
    ? `/book/${dbTenant.slug}` 
    : (organization?.slug ? `/book/${organization.slug}` : `/book/${organization?.id}`);
  
  // Use DB data with Clerk fallback
  const brandName = dbTenant?.name || organization?.name || "Agendo";
  const brandImage = dbTenant?.logoUrl || organization?.imageUrl;

  return (
    <NavigationProvider>
      <AdminContent 
        brandName={brandName}
        brandImage={brandImage}
        bookingUrl={bookingUrl}
        filteredMenuItems={filteredMenuItems}
        isAdmin={isAdmin}
        organization={organization}
        loading={loading}
      >
        {children}
      </AdminContent>
    </NavigationProvider>
  );
}

function AdminContent({ 
  children, 
  brandName, 
  brandImage, 
  bookingUrl, 
  filteredMenuItems, 
  isAdmin,
  organization,
  loading
}: any) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { 
    confirmNavigation, 
    showGlobalExitModal, 
    setShowGlobalExitModal, 
    pendingHref, 
    resetNavigation 
  } = useNavigationGuard();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      
      {/* 🚀 Modern Collapsible Sidebar (Expand on Hover) */}
      <aside className="hidden md:flex flex-col h-full bg-white border-r border-slate-200/50 w-[80px] hover:w-[280px] fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out group shadow-xl hover:shadow-2xl overflow-hidden">
        
        {/* Brand Header */}
        <div className="py-8">
           <div className="flex items-center w-full">
              <div className="w-[80px] flex justify-center shrink-0">
                <div className="w-12 h-12 rounded-[16px] bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/10 text-white overflow-hidden border border-slate-800">
                   {brandImage ? (
                      <img src={brandImage} alt={brandName} className="w-full h-full object-cover" />
                   ) : (
                      <Sparkles className="w-6 h-6" />
                   )}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                <h1 className="text-xl font-black tracking-tighter text-slate-900 truncate max-w-[160px]">{brandName}</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Admin Panel</p>
              </div>
           </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-3 mb-8">
           <a 
             href={bookingUrl} 
             target="_blank" 
             className="w-full flex items-center h-14 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-blue-200 transition-all duration-300 group/btn overflow-hidden"
           >
              <div className="w-[54px] flex justify-center shrink-0">
                 <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/btn:text-blue-600 transition-colors">
                    <ExternalLink className="w-4.5 h-4.5" />
                 </div>
              </div>
              <span className="text-xs font-black text-slate-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Página Pública</span>
              <ChevronRight className="ml-auto mr-4 w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
           </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <div className="h-6 flex items-center mb-2 px-8">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-0 group-hover:opacity-60 transition-opacity duration-300 whitespace-nowrap">Operaciones</p>
          </div>
          {filteredMenuItems.map((item: any) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            const Icon = item.icon;
            return (
              <button 
                key={item.href}
                onClick={() => confirmNavigation(item.href)}
                className="block relative w-full text-left"
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-y-0 left-2 right-2 bg-blue-50 border border-blue-100/50 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={cn(
                  "relative flex items-center h-12 transition-all duration-200",
                  isActive 
                    ? "text-blue-700" 
                    : "text-slate-500 hover:text-slate-900"
                )}>
                  <div className="w-[80px] flex justify-center shrink-0 relative z-10">
                     <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn("text-sm tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap relative z-10", isActive ? "font-black" : "font-semibold")}>{item.label}</span>
                  {isActive && <div className="ml-auto mr-6 w-1.5 h-1.5 rounded-full bg-blue-600 shadow-lg shadow-blue-600/50 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </button>
            )
          })}
        </nav>
        
        {/* User & Settings Area */}
        <div className="border-t border-slate-100 bg-slate-50/30 py-4">
          {isAdmin && (
            <button 
              onClick={() => confirmNavigation("/admin/settings")}
              className={cn(
                "flex items-center h-12 transition-all duration-200 mb-2 relative group/sett w-full text-left",
                pathname === "/admin/settings" ? "text-blue-700" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {pathname === "/admin/settings" && (
                 <div className="absolute inset-y-0 left-2 right-2 bg-white border border-slate-200 shadow-sm rounded-2xl" />
              )}
              <div className="w-[80px] flex justify-center shrink-0 relative z-10">
                 <Settings className={cn("w-5 h-5 transition-colors", pathname === "/admin/settings" ? "text-blue-600" : "text-slate-400")} strokeWidth={pathname === "/admin/settings" ? 2.5 : 2} />
              </div>
              <span className={cn("relative z-10 text-sm tracking-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap", pathname === "/admin/settings" ? "font-black" : "font-bold")}>Ajustes</span>
            </button>
          )}

          <div className="pb-4 mt-auto">
            <div className="flex items-center h-16 group/user transition-all duration-300 hover:bg-slate-50/80 cursor-pointer relative overflow-hidden">
                <div className="w-[80px] flex justify-center shrink-0 relative z-10">
                   <UserButton 
                     appearance={{ 
                       elements: { 
                         rootBox: "flex items-center justify-center w-full",
                         userButtonAvatarBox: "w-10 h-10 rounded-2xl border border-slate-200 shadow-sm transition-transform duration-300 group-hover/user:scale-110" 
                       } 
                     }} 
                   />
                </div>
               <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap min-w-0 pr-4 flex items-center justify-between flex-1">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black text-slate-900 leading-none truncate">
                      {user?.fullName || user?.username || "Mi Cuenta"}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 truncate max-w-[120px]">
                      {brandName}
                    </p>
                  </div>

                  <SignOutButton>
                    <button className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90" title="Cerrar Sesión">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </SignOutButton>
               </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 📱 Modern Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50 flex justify-between items-center p-2 bg-slate-900 rounded-[28px] shadow-2xl ring-4 ring-slate-900/10">
        <button onClick={() => confirmNavigation("/admin")} className={cn("flex flex-col items-center justify-center p-3 rounded-[22px] transition-all duration-300 flex-1", pathname === "/admin" ? "bg-white text-slate-900 shadow-lg" : "text-slate-400")}>
          <LayoutDashboard className="w-5 h-5" strokeWidth={pathname === "/admin" ? 2.5 : 2} />
        </button>
        <button onClick={() => confirmNavigation("/admin/appointments")} className={cn("flex flex-col items-center justify-center p-3 rounded-[22px] transition-all duration-300 flex-1", pathname.includes("/admin/appointments") ? "bg-white text-slate-900 shadow-lg" : "text-slate-400")}>
          <CalendarCheck className="w-5 h-5" strokeWidth={pathname.includes("/admin/appointments") ? 2.5 : 2} />
        </button>
        <button onClick={() => confirmNavigation("/admin/schedule")} className={cn("flex flex-col items-center justify-center p-3 rounded-[22px] transition-all duration-300 flex-1", pathname.includes("/admin/schedule") ? "bg-white text-slate-900 shadow-lg" : "text-slate-400")}>
          <Clock className="w-5 h-5" strokeWidth={pathname.includes("/admin/schedule") ? 2.5 : 2} />
        </button>
        <div className="flex flex-col items-center justify-center p-3 flex-1">
           <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 border border-slate-700 shadow-sm" } }} />
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[80px] flex flex-col min-h-screen relative bg-[#f8fafc]">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-blue-50/30 to-transparent pointer-events-none -z-10" />
        <main className="flex-1 px-4 md:px-8 lg:px-10 py-8 pb-32">
          {!organization ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-[32px] flex items-center justify-center text-blue-600 shadow-inner mb-4">
                <Building2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Selecciona tu <span className="text-blue-600">Negocio</span></h2>
              <p className="text-slate-500 font-bold max-w-sm">Para acceder al panel administrativo, debes seleccionar o crear una organización.</p>
              <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100">
                <OrganizationSwitcher 
                  hidePersonal 
                  afterCreateOrganizationUrl="/admin"
                  afterSelectOrganizationUrl="/admin"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      organizationSwitcherTrigger: "w-full h-14 px-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200",
                    }
                  }}
                />
              </div>
            </div>
          ) : loading ? (
            <div className="h-full flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* 🛡️ Global Navigation Guard Modal */}
      <AnimatePresence>
        {showGlobalExitModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGlobalExitModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white w-full max-w-md rounded-[40px] p-10 relative z-10 shadow-2xl border border-slate-200 overflow-hidden text-center">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-sm">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">¿Abandonar esta página?</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">Tienes cambios sin guardar. Si sales ahora, perderás todas las modificaciones realizadas.</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    resetNavigation();
                    if (pendingHref) router.push(pendingHref);
                  }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
                >
                  Descartar y Salir
                </button>
                <button
                  onClick={() => setShowGlobalExitModal(false)}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  Continuar Editando
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
