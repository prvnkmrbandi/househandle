import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // row from the `customers` table
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in (e.g. page refresh)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Keep this in sync whenever login/logout/signup happens
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    // Pull this customer's own profile row (name, address, etc.)
    api.getCustomer(session.user.id)
      .then(setProfile)
      .catch(() => setProfile(null));
  }, [session]);

  async function signUp({ email, password, fullName, phone, postcode, addressLine1 }) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Create the matching profile row in the `customers` table
    if (data.user) {
      const newProfile = await api.createCustomer({
        id: data.user.id,
        email,
        full_name: fullName,
        phone,
        postcode,
        address_line1: addressLine1
      });
      setProfile(newProfile);
    }
    return data;
  }

  async function logIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function logOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  const value = {
    session,
    user: session?.user || null,
    profile,
    isLoggedIn: !!session,
    loading,
    signUp,
    logIn,
    logOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
