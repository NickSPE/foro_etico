import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to build public user object from Supabase session + profile
  const buildUserObject = async (supabaseUser) => {
    if (!supabaseUser) return null;
    
    // Fetch the public profile (username, avatar)
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url, fecha_registro')
      .eq('id', supabaseUser.id)
      .single();

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      username: profile?.username || supabaseUser.user_metadata?.username || 'usuario',
      avatar: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${supabaseUser.id}`,
      fecha_registro: profile?.fecha_registro || supabaseUser.created_at
    };
  };

  // Listen for auth state changes (login, logout, token refresh, page reload)
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const userObj = await buildUserObject(currentSession.user);
        setUser(userObj);
      }
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          const userObj = await buildUserObject(currentSession.user);
          setUser(userObj);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message === 'Invalid login credentials' 
          ? 'Credenciales inválidas. Verifica tu email y contraseña.' 
          : error.message };
      }

      const userObj = await buildUserObject(data.user);
      setUser(userObj);
      setSession(data.session);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Error de conexión. Inténtalo de nuevo.' };
    }
  };

  const register = async (username, email, password, avatarUrl) => {
    setLoading(true);
    try {
      const avatar = avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            avatar_url: avatar,
          }
        }
      });

      if (error) {
        setLoading(false);
        let errorMsg = error.message;
        if (error.message.includes('already registered')) {
          errorMsg = 'Este correo electrónico ya está registrado.';
        }
        return { success: false, error: errorMsg };
      }

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'Error en el registro. Inténtalo de nuevo.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!session 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
