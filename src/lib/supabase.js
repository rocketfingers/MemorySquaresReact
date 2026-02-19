import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://doozequwfpqhgcjmvjgf.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvb3plcXV3ZnBxaGdjam12amdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NTE0NDgsImV4cCI6MjA4NzAyNzQ0OH0.-I_Rq743U884cViPRK7oi0E-Kn_fQ9WNYFSMj5QTCo0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
