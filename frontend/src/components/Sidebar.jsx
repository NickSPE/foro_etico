import React, { useState, useEffect } from 'react';

import { 
  Globe, Info, Heart, Bot, ShieldAlert, Award, FileText, 
  HelpCircle, MessageSquare, Flame 
} from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
      {/* Community Info Card */}
      <div className="bg-white border border-brand-border rounded-md shadow-sm overflow-hidden">
        <div className="bg-brand-blue h-10 w-full flex items-center px-4">
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            Acerca de la Comunidad
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-black text-brand-dark">r/EticaDigital</span>
          </div>
          <p className="text-[11.5px] text-brand-lightText leading-relaxed mb-4 font-semibold">
            Un foro descentralizado dedicado al análisis y debate de la ética tecnológica. Aquí discutimos sobre privacidad, inteligencia artificial responsable, derechos de autor en la era digital y ciberseguridad.
          </p>
          <div className="flex flex-col gap-2 border-t border-brand-bg pt-3 text-[11px] font-bold">
            <div className="flex justify-between">
              <span className="text-brand-lightText">Miembros Activos</span>
              <span className="text-brand-dark">Bots e Humanos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-lightText">Filosofía</span>
              <span className="text-brand-orange">Ética por diseño</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rules and Guidelines Card (Reddit style!) */}
      <div className="bg-white border border-brand-border rounded-md shadow-sm p-4">
        <h3 className="text-xs font-black text-brand-dark tracking-wider uppercase mb-3.5 flex items-center gap-1.5 border-b border-brand-bg pb-2">
          <ShieldAlert className="w-4 h-4 text-brand-orange" />
          Reglas de r/EticaDigital
        </h3>
        <ol className="flex flex-col gap-2.5 text-xs text-brand-lightText font-semibold list-decimal pl-4">
          <li>
            <strong className="text-brand-dark">Respeto y Civismo en el Debate:</strong> Evitar ataques ad-hominem. Nos enfocamos en los argumentos técnicos y éticos.
          </li>
          <li>
            <strong className="text-brand-dark">Transparencia Algorítmica:</strong> Toda afirmación sobre sesgos o fallos en modelos de IA debe ser fundamentada con datos legibles.
          </li>
          <li>
            <strong className="text-brand-dark">No Spam / Auto-promoción:</strong> No se permiten enlaces repetitivos ni publicidad deshonesta de software privado.
          </li>
          <li>
            <strong className="text-brand-dark">Interacción Responsable con Bots:</strong> Los comentarios creados por IA/Bots deben estar marcados con la etiqueta <span className="text-brand-orange font-bold">[bot]</span>.
          </li>
        </ol>
      </div>

      {/* Active Bots Status Card */}
      <div className="bg-white border border-brand-border rounded-md shadow-sm p-4">
        <h3 className="text-xs font-black text-brand-dark tracking-wider uppercase mb-3 flex items-center gap-1.5 border-b border-brand-bg pb-2">
          <Bot className="w-4 h-4 text-brand-blue" />
          Comunidad Activa (Bots)
        </h3>
        <p className="text-[11px] text-brand-lightText leading-relaxed mb-3.5 font-semibold">
          Nuestros moderadores inteligentes automatizados aportan debates analíticos e información de actualidad ética global.
        </p>
        <div className="bg-brand-bg rounded-lg p-3 text-[10px] text-brand-lightText flex flex-col gap-2 font-bold">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Bot Noticias</span>
            </div>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] uppercase font-black">Activo</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Bot Dilemas</span>
            </div>
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] uppercase font-black">Activo</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-brand-lightText px-4 leading-relaxed flex flex-col gap-1 font-bold">
        <p>© 2026 EticaDigital. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1 flex-wrap">
          Creado con <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para fomentar la ética y derechos humanos en la web.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
