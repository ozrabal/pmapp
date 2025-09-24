"use client";

import { useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * A hook to get the currently logged in user in client components
 * @returns An object containing the user, loading state, and error if any
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<Session["access_token"] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getUser();
        //const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
        // eslint-disable-next-line no-console
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setToken(session.access_token);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return { user, token, loading, error };
}
