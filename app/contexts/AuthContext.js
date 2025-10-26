'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode user in localStorage
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      setLoading(false);
      return;
    }

    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUsernameAvailability = async (username) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    // If no data found, username is available
    return !data;
  };

  const signUp = async (email, password, fullName, username) => {
    try {
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) return { data, error };

      // Then create user profile with username
      if (data.user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              username: username.toLowerCase()
            }
          ]);

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return { data, error: profileError };
        }
      }

      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    // Check if it's a demo user
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      localStorage.removeItem('demoUser');
      setUser(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const demoLogin = () => {
    const demoUserData = {
      id: crypto.randomUUID(),
      email: 'demo@localhost.dev',
      user_metadata: {
        full_name: 'Demo User'
      },
      created_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString()
    };
    localStorage.setItem('demoUser', JSON.stringify(demoUserData));
    setUser(demoUserData);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    demoLogin,
    checkUsernameAvailability,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
