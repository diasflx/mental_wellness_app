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
  const [hasUsername, setHasUsername] = useState(true);

  const checkUserProfile = async (userId) => {
    if (!userId) {
      console.log('No userId provided, setting hasUsername to true');
      setHasUsername(true);
      return true;
    }

    console.log('Checking user profile for userId:', userId);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      console.log('User profile query result:', { data, error });

      if (error) {
        console.error('Error checking user profile:', error);
        // If error code is 42P01 (undefined_table) or 42703 (undefined_column),
        // the table/column doesn't exist - prompt for username creation
        if (error.code === '42P01' || error.code === '42703') {
          console.log('Table/column does not exist, prompting for username');
          setHasUsername(false);
          return false;
        }
        // For other errors, assume they need a username to be safe
        setHasUsername(false);
        return false;
      }

      // If data is null, user doesn't have a profile
      const hasProfile = data !== null;
      console.log('User has profile:', hasProfile, 'data:', data);
      setHasUsername(hasProfile);
      return hasProfile;
    } catch (err) {
      console.error('Exception checking user profile:', err);
      // On exception, assume they need a username
      setHasUsername(false);
      return false;
    }
  };

  useEffect(() => {
    // Check for demo mode user in localStorage
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      setUser(JSON.parse(demoUser));
      setHasUsername(true); // Demo users don't need username
      setLoading(false);
      return;
    }

    // Check active sessions
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserProfile(session.user.id);
      } else {
        setHasUsername(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUsernameAvailability = async (username) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .maybeSingle();

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

  const handleUsernameCreated = async () => {
    if (user) {
      await checkUserProfile(user.id);
    }
  };

  const value = {
    user,
    loading,
    hasUsername,
    signUp,
    signIn,
    signOut,
    demoLogin,
    checkUsernameAvailability,
    handleUsernameCreated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
