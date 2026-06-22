import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, PlusSquare, Search, Bell, MessageSquare, ChevronDown, CircleUser, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-border px-4 py-2 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-brand-orange hover:opacity-90 transition-opacity shrink-0">
        <Shield className="w-8 h-8 stroke-[2.5]" />
        <span className="font-bold text-xl tracking-tight text-brand-dark flex items-center gap-1">
          Etica<span className="text-brand-orange">Digital</span>
        </span>
      </Link>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
        <div className="w-full bg-brand-bg hover:bg-slate-100 focus-within:bg-white border border-transparent focus-within:border-brand-orange transition-all rounded-full px-4 py-1.5 flex items-center gap-2 text-xs">
          <Search className="w-4 h-4 text-brand-lightText shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Explorar debates sobre privacidad, IA, ciberseguridad..."
            className="w-full bg-transparent outline-none font-semibold text-brand-dark placeholder:text-brand-lightText placeholder:font-medium"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {isAuthenticated && user ? (
          <>
            {/* Direct quick action buttons */}
            <div className="flex items-center gap-1">
              <Link
                to="/chat"
                className="text-brand-lightText hover:text-brand-orange hover:bg-brand-bg transition-all p-2 rounded-full flex items-center justify-center relative"
                title="Mensajes Directos / Chat"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
              </Link>

              <Link
                to="/inbox"
                className="text-brand-lightText hover:text-brand-orange hover:bg-brand-bg transition-all p-2 rounded-full flex items-center justify-center relative"
                title="Bandeja de Entrada / Notificaciones"
              >
                <Bell className="w-5 h-5 animate-pulse" />
                <span className="absolute top-1 right-1 bg-brand-orange text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  2
                </span>
              </Link>
            </div>

            <div className="h-5 w-px bg-brand-border"></div>

            <Link 
              to="/crear-post" 
              className="flex items-center gap-1.5 bg-brand-orange hover:bg-opacity-90 text-white font-semibold text-xs px-4 py-2 rounded-full transition-all shadow-sm"
            >
              <PlusSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Publicar</span>
            </Link>
            
            <div className="h-5 w-px bg-brand-border"></div>

            {/* User Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 hover:opacity-85 transition-opacity focus:outline-none"
                aria-label="User menu"
              >
                <img 
                  src={user.avatar} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full border border-brand-border bg-brand-bg shrink-0"
                />
                <span className="hidden sm:inline font-semibold text-xs text-brand-dark">
                  u/{user.username}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-brand-lightText hidden sm:inline" />
              </button>

              {dropdownOpen && (
                <>
                  {/* Overlay to close on outside click */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                  
                  {/* Dropdown Card */}
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-brand-border rounded-md shadow-lg py-1.5 z-20 animate-fade-in text-xs font-bold text-brand-dark">
                    <div className="px-3 py-2 border-b border-brand-bg text-[10px] text-brand-lightText uppercase tracking-wider">
                      u/{user.username}
                    </div>
                    <Link
                      to={`/user/${user.username}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-brand-bg transition-colors"
                    >
                      <CircleUser className="w-4 h-4 text-brand-lightText" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link
                      to="/crear-post"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-brand-bg transition-colors"
                    >
                      <PlusSquare className="w-4 h-4 text-brand-lightText" />
                      <span>Crear Debate</span>
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-brand-bg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-brand-lightText" />
                      <span>Chat de Debate</span>
                    </Link>
                    <Link
                      to="/auditoria"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-brand-bg transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-brand-lightText" />
                      <span>Auditoría Ética</span>
                    </Link>
                    <div className="h-px bg-brand-bg my-1"></div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 text-brand-orange hover:bg-brand-bg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="text-brand-blue hover:bg-brand-bg font-bold text-xs px-4 py-2 rounded-full border border-brand-blue transition-all"
            >
              Iniciar Sesión
            </Link>
            <Link 
              to="/registro" 
              className="bg-brand-blue hover:bg-opacity-90 text-white font-bold text-xs px-4 py-2 rounded-full transition-all"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
