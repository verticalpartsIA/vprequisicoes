import { supabase } from '../src/lib/supabase/client';

async function test() {
  console.log('Testando conexão com Supabase...');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { data, error } = await supabase
    .from('req_tickets')
    .select('id')
    .limit(1);
  
  if (error) {
    console.error('❌ ERRO:', error.message);
    console.error('Detalhes:', error);
  } else {
    console.log('✅ SUCESSO:', data);
  }
}

test();
