
import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables for Vercel deployment, fallback to hardcoded values for local development
export const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://krlvfsgqolaknhivnple.supabase.co';
export const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybHZmc2dxb2xha25oaXZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTkxMzYsImV4cCI6MjA4Njc5NTEzNn0.gkxQeyEdK-hqylo9-dScYzW8g7suxjtrftoFSsPRhC4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
