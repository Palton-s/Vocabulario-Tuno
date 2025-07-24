// Carregador do vocabulário da Umbanda
let vocabularioTermos = [];

// Função para carregar o vocabulário
async function loadVocabulario() {
    // Primeiro, verificar se temos o vocabulário completo carregado diretamente
    if (typeof vocabularioCompleto !== 'undefined' && vocabularioCompleto.length > 0) {
        console.log('Usando vocabulário completo carregado diretamente...');
        vocabularioTermos = vocabularioCompleto;
        console.log(`Vocabulário carregado com ${vocabularioTermos.length} termos`);
        return vocabularioTermos;
    }
    
    // Se não, tentar carregar do JSON
    try {
        console.log('Tentando carregar vocabulário do JSON...');
        const response = await fetch('vocabulario_umbanda.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        vocabularioTermos = data.termos;
        console.log(`Vocabulário JSON carregado com ${vocabularioTermos.length} termos`);
        return vocabularioTermos;
    } catch (error) {
        console.error('Erro ao carregar vocabulário do JSON:', error);
        console.log('Usando vocabulário mínimo como último recurso...');
        
        // Último recurso - vocabulário mínimo
        vocabularioTermos = [
            { termo: "Babalô", explicacao: "Pai no Santo" },
            { termo: "Babá", explicacao: "Mãe no Santo" },
            { termo: "Babalorixá", explicacao: "Pai no Santo (Babalô) com sete anos de Terreiro aberto" },
            { termo: "Yalorixá", explicacao: "Mãe no Santo (Babá) com sete anos de Terreiro aberto" },
            { termo: "Amalá", explicacao: "Comida para o Santo" },
            { termo: "Oin", explicacao: "Mel" },
            { termo: "Ebó", explicacao: "Despacho com matança na Umbanda" },
            { termo: "Padê", explicacao: "Oferenda simples sem matança na Umbanda" },
            { termo: "Pemba", explicacao: "Giz sagrado para riscar pontos" },
            { termo: "Ponto de Santo", explicacao: "Símbolo sagrado riscado no chão" },
            { termo: "Terreiro", explicacao: "Local de culto da Umbanda" },
            { termo: "Gongá", explicacao: "Altar dos Orixás" },
            { termo: "Cambono", explicacao: "Auxiliar do médium no terreiro" },
            { termo: "Médium", explicacao: "Pessoa que incorpora entidades espirituais" },
            { termo: "Guia", explicacao: "Colar de contas dos Orixás" },
            { termo: "Axé", explicacao: "Força vital sagrada" },
            { termo: "Gira", explicacao: "Sessão espiritual da Umbanda" },
            { termo: "Saravá", explicacao: "Saudação geral da Umbanda" },
            { termo: "Caboclo", explicacao: "Entidade indígena da Umbanda" },
            { termo: "Preto Velho", explicacao: "Entidade de escravo antigo" }
        ];
        console.log(`Vocabulário mínimo carregado com ${vocabularioTermos.length} termos`);
        return vocabularioTermos;
    }
}
