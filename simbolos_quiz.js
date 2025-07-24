// Evitar redeclaração em caso de recarregamento do script
if (typeof window.quizApp === 'undefined') {
    window.quizApp = {};
}

window.quizApp.currentOrixaIndex = 0;
window.quizApp.tomSelect = null;
window.quizApp.selectedSymbols = [];
window.quizApp.allSymbolsOptions = [];
window.quizApp.shuffledOrixas = [];

// Função para embaralhar array
window.quizApp.shuffleArray = function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Função para obter cor de fundo baseada na cor do Orixá
window.quizApp.getColorStyle = function(cor) {
    const colorMap = {
        'branco': '#f8f9fa',
        'amarelo': '#ffc107',
        'rosa': '#e91e63',
        'azul claro': '#17a2b8',
        'azul escuro': '#1a237e',
        'roxo': '#673ab7',
        'vermelho': '#d32f2f',
        'verde': '#388e3c',
        'verde escuro': '#2e7d32',
        'marrom': '#8d6e63'
    };
    return colorMap[cor] || '#6c757d';
};

// Função para preparar todas as opções de símbolos
window.quizApp.prepareAllSymbols = function() {
    window.quizApp.allSymbolsOptions = [];
    const symbolsMap = new Map(); // Para agrupar símbolos com mesmo nome
    
    simbolos.forEach(orixaData => {
        orixaData.simbolos.forEach(simbolo => {
            const symbolName = simbolo.nome;
            
            if (!symbolsMap.has(symbolName)) {
                // Primeira vez que encontra este símbolo
                symbolsMap.set(symbolName, {
                    value: simbolo.nome,
                    text: simbolo.nome,
                    orixas: [orixaData.orixa], // Array de Orixás que têm este símbolo
                    cores: [orixaData.cor],
                    caminhos: [simbolo.caminho],
                    descricoes: [simbolo.descricao]
                });
            } else {
                // Símbolo já existe, adiciona o Orixá à lista
                const existingSymbol = symbolsMap.get(symbolName);
                existingSymbol.orixas.push(orixaData.orixa);
                existingSymbol.cores.push(orixaData.cor);
                existingSymbol.caminhos.push(simbolo.caminho);
                existingSymbol.descricoes.push(simbolo.descricao);
            }
        });
    });
    
    // Converter Map para Array
    window.quizApp.allSymbolsOptions = Array.from(symbolsMap.values());
    
    // Embaralhar as opções de símbolos
    window.quizApp.allSymbolsOptions = window.quizApp.shuffleArray(window.quizApp.allSymbolsOptions);
    
    // Embaralhar a ordem dos Orixás
    window.quizApp.shuffledOrixas = window.quizApp.shuffleArray(simbolos);
};

// Função para inicializar TomSelect
window.quizApp.initTomSelect = function() {
    if (window.quizApp.tomSelect) {
        window.quizApp.tomSelect.destroy();
    }

    window.quizApp.tomSelect = new TomSelect('#symbol-search', {
        create: false,
        maxItems: 1,
        valueField: 'value',
        labelField: 'text',
        searchField: 'text',
        options: window.quizApp.allSymbolsOptions,
        render: {
            option: function(data, escape) {
                return `<div class="option-content">
                    <span class="option-name">${escape(data.text)}</span>
                </div>`;
            }
        },
        onItemAdd: function(value) {
            window.quizApp.onItemAdd(value);
        }
    });
};

// Função para lidar com a seleção de símbolos
window.quizApp.onItemAdd = function(value) {
    const currentOrixaData = window.quizApp.shuffledOrixas[window.quizApp.currentOrixaIndex];
    
    // Verificar se o símbolo pertence ao Orixá atual
    const isCorrect = currentOrixaData.simbolos.some(simbolo => simbolo.nome === value);
    
    if (isCorrect) {
        // Encontrar o símbolo correto do Orixá atual
        const currentSymbol = currentOrixaData.simbolos.find(simbolo => simbolo.nome === value);
        
        // Verificar se já foi selecionado
        if (window.quizApp.selectedSymbols.find(s => s.nome === currentSymbol.nome)) {
            alert('Este símbolo já foi selecionado!');
            window.quizApp.tomSelect.clear();
            return;
        }
        
        // Adicionar à lista de símbolos selecionados
        window.quizApp.selectedSymbols.push(currentSymbol);
        window.quizApp.addSymbolToGrid(currentSymbol);
        window.quizApp.tomSelect.clear();
        
    } else {
        alert(`"${value}" não pertence a ${currentOrixaData.orixa}. Tente novamente!`);
        window.quizApp.tomSelect.clear();
    }
};

// Função para adicionar símbolo ao grid
window.quizApp.addSymbolToGrid = function(symbol) {
    const symbolItem = document.createElement('div');
    symbolItem.className = 'symbol-item';
    symbolItem.innerHTML = `
        <img src="${symbol.caminho}" alt="${symbol.nome}" class="symbol-image">
        <div class="symbol-name">${symbol.nome}</div>
    `;

    document.getElementById('symbols-grid').appendChild(symbolItem);
    window.quizApp.updateProgress();
};

// Função para atualizar progresso
window.quizApp.updateProgress = function() {
    const currentOrixa = window.quizApp.shuffledOrixas[window.quizApp.currentOrixaIndex];
    const totalSymbols = currentOrixa.simbolos.length;
    const foundSymbols = window.quizApp.selectedSymbols.length;
    
    document.getElementById('progress-counter').textContent = `${foundSymbols} / ${totalSymbols}`;
    
    const percentage = (foundSymbols / totalSymbols) * 100;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
    
    // Habilitar botão quando todos os símbolos forem encontrados
    document.getElementById('next-btn').disabled = foundSymbols < totalSymbols;
};

// Função para carregar Orixá atual
window.quizApp.loadCurrentOrixa = function() {
    if (window.quizApp.currentOrixaIndex >= window.quizApp.shuffledOrixas.length) {
        window.quizApp.showResults();
        return;
    }

    const currentOrixa = window.quizApp.shuffledOrixas[window.quizApp.currentOrixaIndex];
    window.quizApp.selectedSymbols = [];
    
    document.getElementById('orixa-name').textContent = currentOrixa.orixa;
    
    const colorBadge = document.getElementById('color-badge');
    colorBadge.textContent = currentOrixa.cor;
    colorBadge.style.backgroundColor = window.quizApp.getColorStyle(currentOrixa.cor);
    
    document.getElementById('total-symbols').textContent = currentOrixa.simbolos.length;
    document.getElementById('symbols-grid').innerHTML = '';
    
    // Resetar estado do botão "Desisto"
    const giveUpBtn = document.getElementById('give-up-btn');
    giveUpBtn.disabled = false;
    giveUpBtn.textContent = '🏳️ Desisto';
    
    // Reabilitar o campo de busca
    if (window.quizApp.tomSelect) {
        window.quizApp.tomSelect.enable();
    }
    
    window.quizApp.updateProgress();
    
    // Atualizar texto do botão
    const nextBtn = document.getElementById('next-btn');
    if (window.quizApp.currentOrixaIndex === window.quizApp.shuffledOrixas.length - 1) {
        nextBtn.textContent = 'Finalizar Quiz';
    } else {
        nextBtn.textContent = 'Próximo Orixá';
    }
};

// Função para próximo Orixá
function nextOrixa() {
    window.quizApp.currentOrixaIndex++;
    window.quizApp.loadCurrentOrixa();
}

// Função para desistir e mostrar todas as soluções
function giveUp() {
    const currentOrixaData = window.quizApp.shuffledOrixas[window.quizApp.currentOrixaIndex];
    
    // Confirmar se o usuário quer desistir
    if (confirm(`Tem certeza que deseja desistir? Isso mostrará todas as soluções restantes de ${currentOrixaData.orixa}.`)) {
        // Adicionar todos os símbolos restantes
        currentOrixaData.simbolos.forEach(simbolo => {
            // Verificar se o símbolo já não foi encontrado
            const alreadyFound = window.quizApp.selectedSymbols.find(s => s.nome === simbolo.nome);
            if (!alreadyFound) {
                window.quizApp.selectedSymbols.push(simbolo);
                window.quizApp.addSymbolToGrid(simbolo);
            }
        });
        
        // Habilitar o botão "Próximo Orixá"
        document.getElementById('next-btn').disabled = false;
        
        // Desabilitar o botão "Desisto"
        document.getElementById('give-up-btn').disabled = true;
        document.getElementById('give-up-btn').textContent = '✅ Soluções Mostradas';
        
        // Desabilitar o campo de busca
        window.quizApp.tomSelect.disable();
    }
}

// Função para mostrar resultados
window.quizApp.showResults = function() {
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'block';
};

// Função para reiniciar quiz
function restartQuiz() {
    window.quizApp.currentOrixaIndex = 0;
    window.quizApp.selectedSymbols = [];
    document.getElementById('quiz-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    window.quizApp.loadCurrentOrixa();
}

// Inicializar quiz
document.addEventListener('DOMContentLoaded', function() {
    window.quizApp.prepareAllSymbols();
    window.quizApp.initTomSelect();
    window.quizApp.loadCurrentOrixa();
});
