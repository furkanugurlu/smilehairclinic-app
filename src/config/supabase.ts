import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Bu değerleri kendi Supabase projenizin değerleriyle değiştirin
const SUPABASE_URL = 'https://oqaiooxhbmrbwryqqxkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYWlvb3hoYm1yYndyeXFxeGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDUwNTksImV4cCI6MjA3ODM4MTA1OX0.nfD-kJGzjujZnhfuHEKuYZgTXarTtP2644JWeDYFcVY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

