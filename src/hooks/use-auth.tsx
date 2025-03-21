import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

// Create a context for authentication
const AuthContext = createContext(null);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (email: string, password: string, name: string) => {
    const { error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: name,
          avatar_url: `/avatars/${Math.floor(Math.random() * 5)}.png`, // Random avatar
          created_at: new Date().toISOString()
        }
      }
    });
    if (signUpError) throw signUpError;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = { 
    user, 
    loading, 
    login, 
    logout, 
    register 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};