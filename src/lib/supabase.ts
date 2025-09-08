import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://kvswjsedcxcbxuhsrskl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c3dqc2VkY3hjYnh1aHNyc2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMjY2ODAsImV4cCI6MjA3MjkwMjY4MH0.HsAc0i7CDd4Y5S3o7JV4QnaWf1nEQHYbMU_iVVfJArs';

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key environment variable');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);