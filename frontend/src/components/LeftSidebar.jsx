import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { 
  Home, TrendingUp, MessageSquare, Bell, CircleUser, PlusSquare, 
  EyeOff, Brain, Shield, Globe, Copyright, Info, List, ShieldAlert
} from 'lucide-react';

const iconMap = {
  EyeOff: EyeOff,
  Brain: Brain,
  Shield: Shield,
  Globe: Globe,
  Copyright: Copyright
};

const LeftSidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categorySlug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <aside className="hidden md:flex flex-col gap-5 w-52 shrink-0 border-r border-brand-border pr-2.5 py-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-border">
      {/* Navigation Section */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-brand-lightText uppercase tracking-widest pl-3 mb-2 block">
          Navegación
        </span>
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-brand-bg ${
            location.pathname === '/' ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span>Inicio / Feed</span>
        </Link>
        
        <Link
          to="/search?q="
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-brand-bg ${
            location.pathname === '/search' ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
          }`}
        >
          <TrendingUp className="w-4 h-4 shrink-0" />
          <span>Populares</span>
        </Link>

        <Link
          to="/chat"
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-brand-bg ${
            location.pathname === '/chat' ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Chat de Debate</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </Link>

        <Link
          to="/auditoria"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-brand-bg ${
            location.pathname === '/auditoria' ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-brand-orange shrink-0" />
          <span>Auditoría Ética</span>
        </Link>

        {isAuthenticated && (
          <>
            <Link
              to="/inbox"
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-brand-bg ${
                location.pathname === '/inbox' ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notificaciones</span>
              </div>
              <span className="bg-brand-orange text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                2
              </span>
            </Link>
          </>
        )}
      </div>

      <div className="h-px bg-brand-border mx-2"></div>

      {/* User Actions Section */}
      {isAuthenticated && user && (
        <>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-brand-lightText uppercase tracking-widest pl-3 mb-2 block">
              Mi Cuenta
            </span>
            <Link
              to={`/user/${user.username}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-brand-bg ${
                location.pathname.startsWith('/user/') ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
              }`}
            >
              <CircleUser className="w-4 h-4 shrink-0" />
              <span>Mi Perfil</span>
            </Link>

            <Link
              to="/crear-post"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all hover:bg-brand-bg ${
                location.pathname === '/crear-post' ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
              }`}
            >
              <PlusSquare className="w-4 h-4 shrink-0" />
              <span>Crear Debate</span>
            </Link>
          </div>
          <div className="h-px bg-brand-border mx-2"></div>
        </>
      )}

      {/* Categories Section */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-brand-lightText uppercase tracking-widest pl-3 mb-2 block">
          Categorías
        </span>
        
        <Link
          to="/"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-brand-bg ${
            !categorySlug && location.pathname === '/' ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
          }`}
        >
          <List className="w-4 h-4" />
          <span>Todos los temas</span>
        </Link>

        {loading ? (
          <div className="flex flex-col gap-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 bg-brand-bg rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const IconComp = iconMap[cat.icono] || Globe;
            const isSelected = categorySlug === cat.slug;
            return (
              <Link
                key={cat.id}
                to={`/categoria/${cat.slug}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-brand-bg ${
                  isSelected ? 'bg-brand-bg text-brand-orange' : 'text-brand-dark'
                }`}
                title={cat.descripcion}
              >
                <IconComp className="w-4 h-4 shrink-0" />
                <span className="truncate">{cat.nombre}</span>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar;
