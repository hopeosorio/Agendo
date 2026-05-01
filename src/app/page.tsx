import Link from 'next/link';
import AnimatedBackground from '@/components/AnimatedBackground';
import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="relative font-body-md text-on-background antialiased selection:bg-blue-500/30 min-h-screen overflow-x-hidden">
      <AnimatedBackground />

      {/* 🚀 Floating Navigation Bar */}
      <div className="fixed top-6 left-0 right-0 z-50 px-4 md:px-8">
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="max-w-7xl mx-auto bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[28px] shadow-2xl shadow-blue-500/5 flex justify-between items-center px-6 py-3 font-sans antialiased text-sm font-medium"
        >
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">Agend<span className="text-blue-600">o</span></span>
            </Link>
            <div className="hidden lg:flex gap-8">
              <Link className="text-slate-600 dark:text-slate-300 font-bold hover:text-blue-600 transition-colors" href="#">Soluciones</Link>
              <Link className="text-slate-600 dark:text-slate-300 font-bold hover:text-blue-600 transition-colors" href="#">Precios</Link>
              <Link className="text-slate-600 dark:text-slate-300 font-bold hover:text-blue-600 transition-colors" href="#">Empresa</Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-slate-700 dark:text-slate-200 font-bold px-4 py-2 hover:bg-white/50 rounded-2xl transition-all text-xs">Ingresar</Link>
            <Link href="/sign-up" className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg hover:bg-blue-600 hover:shadow-blue-500/20 transition-all active:scale-95 text-[10px] uppercase tracking-widest">Comenzar</Link>
          </div>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <main className="relative overflow-hidden pt-40 pb-32">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/40 backdrop-blur-md px-6 py-2 rounded-full mb-10 inline-flex items-center gap-3 border border-white/60 shadow-xl shadow-blue-500/5"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Software de Agendamiento Profesional</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-[-0.05em] leading-[0.9] mb-10 max-w-5xl uppercase italic">
            Tu negocio en <span className="text-blue-600">Piloto Automático</span>.
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl font-bold text-slate-500 max-w-2xl mb-14 leading-relaxed"
          >
            La plataforma definitiva para gestionar tus citas, profesionales y múltiples sedes desde un solo lugar. Crea tu portal de reservas hoy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 mb-24"
          >
            <Link href="/sign-up" className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:bg-blue-600 hover:shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-3">
              Crea tu Negocio
              <span className="material-symbols-outlined text-[20px]">bolt</span>
            </Link>
            <button className="bg-white/60 backdrop-blur-md text-slate-900 px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-lg border border-white/60 transition-all hover:bg-white active:scale-95">
              Explorar Funciones
            </button>
          </motion.div>

          {/* Bento Grid Interface Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-12 gap-8 w-full mt-12"
          >
            {/* 🗓️ Portal de Reservas (Main Feature Card) */}
            <div className="col-span-12 lg:col-span-8 bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[48px] p-12 shadow-2xl relative overflow-hidden group hover:border-blue-200 transition-all duration-700">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[24px] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30">
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 italic uppercase">Portal de Reservas</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Enlace Público Activo</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-3 rounded-[24px] border border-white shadow-sm">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white bg-slate-200 overflow-hidden shadow-md"><img src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" /></div>)}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">+12 Citas Hoy</span>
                </div>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-7 gap-4 relative z-10">
                {/* 21 Simulated Calendar Days (3 Weeks) */}
                {Array.from({ length: 21 }).map((_, i) => {
                  const dayNum = 12 + i;
                  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
                  const dayName = days[i % 7];
                  const isSelected = dayNum === 14;
                  const hasAppointments = dayNum % 3 === 0;
                  const hasProgress = dayNum % 4 === 0;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "aspect-[0.9] rounded-[24px] p-4 flex flex-col justify-between transition-all cursor-pointer group/day shadow-sm border",
                        isSelected
                          ? "bg-blue-600 border-blue-400 text-white shadow-xl shadow-blue-600/30 scale-105 z-10"
                          : "bg-white/70 border-white/80 hover:bg-white hover:border-blue-200 hover:scale-[1.03]"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn("text-[9px] font-black uppercase tracking-tighter", isSelected ? "text-blue-100" : "text-slate-400")}>{dayName}</span>
                        {hasAppointments && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />}
                      </div>

                      <span className={cn("text-2xl font-black tracking-tighter", isSelected ? "text-white" : "text-slate-900")}>{dayNum}</span>

                      <div className="mt-1">
                        {isSelected ? (
                          <div className="bg-white/20 backdrop-blur-md rounded-lg py-1 px-1.5 text-[8px] font-black uppercase text-center border border-white/10 truncate">
                            8 Reservas
                          </div>
                        ) : hasProgress ? (
                          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(dayNum % 5 + 2) * 20}%` }} />
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {Array.from({ length: (dayNum % 3) + 1 }).map((_, dot) => (
                              <div key={dot} className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-slate-200")} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
              {/* 📈 Dashboard Stats Card */}
              <div className="bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[48px] p-12 flex-1 shadow-xl relative overflow-hidden group hover:border-blue-200 transition-all flex flex-col items-center text-center justify-center">
                <div className="absolute top-8 left-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span></div>
                </div>
                <div className="absolute top-8 right-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-4 py-1.5 rounded-full border border-slate-200">Tiempo Real</span>
                </div>

                <div className="space-y-3 relative z-10 mt-8">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Resumen de Hoy</p>
                  <div className="flex flex-col items-center">
                    <p className="text-7xl font-black text-slate-900 tracking-tighter">12</p>
                    <span className="text-emerald-500 font-black text-sm flex items-center gap-1 mt-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">+18% <span className="material-symbols-outlined text-sm">trending_up</span></span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 pt-2">Reservas completadas</p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                    <motion.path
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }}
                      d="M0,80 Q50,75 100,40 T200,65 T300,20 T400,50"
                      fill="none" stroke="#2563eb" strokeWidth="8" strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 👥 Team Management Card */}
              <div className="bg-slate-900 rounded-[48px] p-12 flex-1 shadow-2xl relative overflow-hidden group hover:bg-slate-800 transition-all flex flex-col items-center text-center justify-center">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -mr-24 -mt-24" />
                <div className="absolute top-8 left-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-blue-400 flex items-center justify-center border border-white/10 shadow-sm"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span></div>
                </div>
                <div className="absolute top-10 right-10">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>

                <div className="relative z-10 w-full flex flex-col items-center">
                  <h4 className="text-4xl font-black text-white tracking-tighter mb-10 uppercase italic">Tu Equipo</h4>
                  <div className="flex items-center gap-5 mb-10">
                    <div className="flex -space-x-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-16 h-16 rounded-[24px] bg-slate-800 border-4 border-slate-900 overflow-hidden shadow-2xl hover:scale-110 hover:-translate-y-2 transition-all cursor-pointer relative z-0 hover:z-10">
                          <img alt="Team member" src={`https://i.pravatar.cc/100?u=team${i}`} className="grayscale group-hover:grayscale-0 transition-all duration-500 object-cover" />
                        </div>
                      ))}
                    </div>
                    <div className="w-16 h-16 rounded-[24px] bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center text-white/40 hover:bg-white/10 hover:border-white/40 cursor-pointer transition-all">
                      <span className="material-symbols-outlined">add</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400">Profesionales Activos</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Why Choose Us */}
      <section className="py-32 bg-transparent border-y border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
          >
            <div className="max-w-2xl text-left">
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase italic mb-6">Todo lo que necesitas <br />para <span className="text-blue-600">crecer</span>.</h2>
              <p className="text-lg font-bold text-slate-500">Agendo elimina la fricción entre tus clientes y tus servicios.</p>
            </div>
            <button className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 group bg-white px-6 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all">
              Ver Especificaciones
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span>
            </button>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="group p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] hover:bg-white/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-3xl">link</span>
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-4 tracking-tight">URL Personalizada</h3>
              <p className="text-slate-500 font-bold leading-relaxed">Obtén un enlace único para tu negocio. Compártelo en Instagram o WhatsApp y recibe citas al instante.</p>
            </div>
            <div className="group p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[40px] hover:bg-white/20 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-3xl">badge</span>
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-4 tracking-tight">Equipo y Servicios</h3>
              <p className="text-slate-500 font-bold leading-relaxed">Configura a tus profesionales, asigna servicios específicos y define duraciones exactas para cada cita.</p>
            </div>
            <div className="group p-10 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform shadow-inner">
                <span className="material-symbols-outlined text-3xl">dashboard_customize</span>
              </div>
              <h3 className="font-black text-2xl text-slate-900 mb-4 tracking-tight">Gestión Multi-Negocio</h3>
              <p className="text-slate-500 font-bold leading-relaxed">¿Tienes más de un local? Gestiónalos todos desde una misma cuenta sin complicaciones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-24 bg-transparent border-b border-white/20">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-[10px] font-black text-slate-400 mb-12 uppercase tracking-[0.3em]">Potenciando a Innovadores Globales</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">STRIPE</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">SUPABASE</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">CLERK</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">VERCEL</span>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">NEXT.JS</span>
          </div>
        </div>
      </section>

      {/* Floating UI CTA Section */}
      <section className="py-32 overflow-hidden px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-[56px] p-12 md:p-24 relative overflow-hidden text-white flex flex-col lg:flex-row items-center gap-16 shadow-2xl shadow-blue-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 opacity-50" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />

            <div className="z-10 lg:w-1/2 text-left">
              <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic">Digitaliza tu <br />agenda <br /><span className="text-blue-200">hoy mismo</span></h2>
              <p className="text-lg font-bold mb-12 text-blue-50 leading-relaxed opacity-90 max-w-md">Únete a los negocios que ya están optimizando su tiempo con la potencia de Agendo.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/sign-up" className="bg-white text-blue-600 px-12 py-5 rounded-[24px] font-black shadow-xl hover:bg-slate-50 transition-all text-center flex items-center justify-center uppercase tracking-widest text-xs">Registrar mi Negocio</Link>
                <Link href="/sign-in" className="bg-blue-700/50 backdrop-blur-md border border-white/20 px-10 py-5 rounded-[24px] font-black transition-all hover:bg-blue-700/80 uppercase tracking-widest text-xs text-center">Acceder al Panel</Link>
              </div>
            </div>

            <div className="lg:w-1/2 relative z-10 w-full">
              <div className="bg-white/10 backdrop-blur-3xl border border-white/20 w-full aspect-video rounded-[40px] p-8 shadow-2xl relative translate-x-4 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 animate-pulse"></div>
                  <div className="h-4 w-32 bg-white/10 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-3 w-full bg-white/10 rounded-full"></div>
                  <div className="h-3 w-3/4 bg-white/10 rounded-full"></div>
                </div>
              </div>
              <div className="bg-white absolute top-0 left-0 w-40 h-40 rounded-[40px] shadow-2xl -translate-x-12 -translate-y-12 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600" style={{ fontSize: "100px", fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent w-full py-16 border-t border-white/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-8">
          <div className="mb-12 md:mb-0 text-left">
            <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Agend<span className="text-blue-600">o</span></span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4">© 2026 Agendo.</p>
          </div>
          <div className="flex flex-wrap gap-12">
            <Link className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors" href="#">Privacidad</Link>
            <Link className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors" href="#">Términos</Link>
            <Link className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors" href="#">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
