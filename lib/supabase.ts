
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krlvfsgqolaknhivnple.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtybHZmc2dxb2xha25oaXZucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTkxMzYsImV4cCI6MjA4Njc5NTEzNn0.gkxQeyEdK-hqylo9-dScYzW8g7suxjtrftoFSsPRhC4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
