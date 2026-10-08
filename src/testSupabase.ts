import { supabase } from './lib/supabase';

export async function testSupabase() {
  if (!supabase) {
    console.log('❌ Supabase not configured');
    return;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  console.log('Supabase data:', data);
  console.log('Supabase error:', error);
}