// Chamando o banco de dados supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from "dotenv";

// Guarda as chaves para conexão com o banco
dotenv.config();

// Configuração inicial
const supabase = createClient(
    process.env.SB_URL, 
    process.env.SB_KEY
);

// Estabelecendo a conexão
try {
    await supabase.from('folha_ponto').select('*').limit(1);
    await supabase.from('funcionarios').select('*').limit(1);
    console.log('Banco de dados supabase conectado com sucesso!');
} catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
}

export default supabase;