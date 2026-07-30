import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('sir_user') || 'null'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const token = localStorage.getItem('sir_token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          localStorage.setItem('sir_user', JSON.stringify(data.user));
        } catch {
          localStorage.removeItem('sir_token');
          localStorage.removeItem('sir_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    hydrate();
  }, []);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.access_token) return;
      try {
        const { data } = await api.post('/auth/supabase', { access_token: session.access_token });
        persist(data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to finish Google sign in.');
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const persist = (data) => {
    localStorage.setItem('sir_token', data.token);
    localStorage.setItem('sir_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (values) => {
    const { data } = await api.post('/auth/login', values);
    persist(data);
    toast.success('Welcome back.');
  }, []);

  const signup = useCallback(async (values) => {
    const { data } = await api.post('/auth/signup', values);
    persist(data);
    toast.success('Account created. Check your inbox to verify email.');
  }, []);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      await supabase.auth.signOut();
    } finally {
      localStorage.removeItem('sir_token');
      localStorage.removeItem('sir_user');
      setUser(null);
      toast.success('Signed out.');
    }
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  };

  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    });
    if (error) throw error;
    toast.success('Password reset email sent.');
  };

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', login, signup, logout, loginWithGoogle, forgotPassword }),
    [user, loading, login, signup]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
