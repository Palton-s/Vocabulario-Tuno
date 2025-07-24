// Namespace para evitar conflitos
window.saudacoesQuiz = {};

// Função de embaralhamento Fisher-Yates
window.saudacoesQuiz.shuffleArray = function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Variáveis globais
window.saudacoesQuiz.shuffledTerms = [];
window.saudacoesQuiz.allMeaningsOptions = [];
window.saudacoesQuiz.currentTermIndex = 0;
window.saudacoesQuiz.correctAnswers = 0;
window.saudacoesQuiz.tomSelect = null;
window.saudacoesQuiz.currentAnswered = false;

// Função para preparar todas as opções de significados
window.saudacoesQuiz.prepareAllMeanings = function() {
    window.saudacoesQuiz.allMeaningsOptions = [];
    
    saudacoes.forEach(item => {
        window.saudacoesQuiz.allMeaningsOptions.push({
            value: item.explicacao,
            text: item.explicacao,
            termo: item.termo
        });
    });
    
    // Embaralhar as opções de significados
    window.saudacoesQuiz.allMeaningsOptions = window.saudacoesQuiz.shuffleArray(window.saudacoesQuiz.allMeaningsOptions);
    
    // Embaralhar a ordem dos termos
    window.saudacoesQuiz.shuffledTerms = window.saudacoesQuiz.shuffleArray(saudacoes);
};

// Inicializar TomSelect
window.saudacoesQuiz.initTomSelect = function() {
    if (window.saudacoesQuiz.tomSelect) {
        window.saudacoesQuiz.tomSelect.destroy();
    }

    window.saudacoesQuiz.tomSelect = new TomSelect('#meaning-search', {
        create: false,
        maxItems: 1,
        valueField: 'value',
        labelField: 'text',
        searchField: 'text',
        options: window.saudacoesQuiz.allMeaningsOptions,
        render: {
            option: function(data, escape) {
                return `<div class="option-content">
                    <span class="option-name">${escape(data.text)}</span>
                </div>`;
            }
        },
        onItemAdd: function(value) {
            window.saudacoesQuiz.onItemAdd(value);
        }
    });
};

// Função para lidar com a seleção de significados
window.saudacoesQuiz.onItemAdd = function(value) {
    if (window.saudacoesQuiz.currentAnswered) {
        window.saudacoesQuiz.tomSelect.clear();
        return;
    }

    const currentTerm = window.saudacoesQuiz.shuffledTerms[window.saudacoesQuiz.currentTermIndex];
    const resultDisplay = document.getElementById('result-display');
    
    if (value === currentTerm.explicacao) {
        // Resposta correta
        window.saudacoesQuiz.correctAnswers++;
        window.saudacoesQuiz.currentAnswered = true;
        
        resultDisplay.className = 'result-display correct-answer';
        resultDisplay.innerHTML = `✅ Correto! <strong>${currentTerm.termo}</strong> = <strong>${currentTerm.explicacao}</strong>`;
        resultDisplay.style.display = 'block';
        
        // Habilitar botão próximo
        document.getElementById('next-btn').disabled = false;
        
    } else {
        // Resposta incorreta
        window.saudacoesQuiz.currentAnswered = true;
        
        resultDisplay.className = 'result-display wrong-answer';
        resultDisplay.innerHTML = `❌ Incorreto!<br>
            Você respondeu: <strong>${value}</strong><br>
            Resposta correta: <strong>${currentTerm.explicacao}</strong>`;
        resultDisplay.style.display = 'block';
        
        // Habilitar botão próximo
        document.getElementById('next-btn').disabled = false;
    }
    
    // Desabilitar o campo de busca
    window.saudacoesQuiz.tomSelect.disable();
    
    // Atualizar progresso
    window.saudacoesQuiz.updateProgress();
    
    // Limpar seleção
    window.saudacoesQuiz.tomSelect.clear();
};

// Função para atualizar progresso
window.saudacoesQuiz.updateProgress = function() {
    const totalTerms = window.saudacoesQuiz.shuffledTerms.length;
    const currentTerm = window.saudacoesQuiz.currentTermIndex + (window.saudacoesQuiz.currentAnswered ? 1 : 0);
    
    document.getElementById('progress-counter').textContent = `${currentTerm} / ${totalTerms}`;
    
    const percentage = (currentTerm / totalTerms) * 100;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
};

// Função para carregar termo atual
window.saudacoesQuiz.loadCurrentTerm = function() {
    if (window.saudacoesQuiz.currentTermIndex >= window.saudacoesQuiz.shuffledTerms.length) {
        window.saudacoesQuiz.showResults();
        return;
    }

    const currentTerm = window.saudacoesQuiz.shuffledTerms[window.saudacoesQuiz.currentTermIndex];
    window.saudacoesQuiz.currentAnswered = false;
    
    document.getElementById('term-name').textContent = currentTerm.termo;
    
    // Esconder resultado anterior
    document.getElementById('result-display').style.display = 'none';
    
    // Resetar estado do botão "Desisto"
    const giveUpBtn = document.getElementById('give-up-btn');
    giveUpBtn.disabled = false;
    giveUpBtn.textContent = '🏳️ Desisto';
    
    // Reabilitar o campo de busca
    if (window.saudacoesQuiz.tomSelect) {
        window.saudacoesQuiz.tomSelect.enable();
    }
    
    // Desabilitar botão próximo
    document.getElementById('next-btn').disabled = true;
    
    window.saudacoesQuiz.updateProgress();
    
    // Atualizar texto do botão
    const nextBtn = document.getElementById('next-btn');
    if (window.saudacoesQuiz.currentTermIndex === window.saudacoesQuiz.shuffledTerms.length - 1) {
        nextBtn.textContent = 'Finalizar Quiz';
    } else {
        nextBtn.textContent = 'Próximo Termo';
    }
};

// Função para próximo termo
function nextTerm() {
    window.saudacoesQuiz.currentTermIndex++;
    window.saudacoesQuiz.loadCurrentTerm();
}

// Função para desistir e mostrar a solução
function giveUp() {
    if (window.saudacoesQuiz.currentAnswered) {
        return;
    }

    const currentTerm = window.saudacoesQuiz.shuffledTerms[window.saudacoesQuiz.currentTermIndex];
    
    // Confirmar se o usuário quer desistir
    if (confirm(`Tem certeza que deseja desistir? Isso mostrará a resposta para "${currentTerm.termo}".`)) {
        window.saudacoesQuiz.currentAnswered = true;
        
        const resultDisplay = document.getElementById('result-display');
        resultDisplay.className = 'result-display wrong-answer';
        resultDisplay.innerHTML = `🏳️ Você desistiu!<br>
            Resposta correta: <strong>${currentTerm.explicacao}</strong>`;
        resultDisplay.style.display = 'block';
        
        // Habilitar botão próximo
        document.getElementById('next-btn').disabled = false;
        
        // Desabilitar o botão "Desisto"
        document.getElementById('give-up-btn').disabled = true;
        document.getElementById('give-up-btn').textContent = '✅ Resposta Mostrada';
        
        // Desabilitar o campo de busca
        window.saudacoesQuiz.tomSelect.disable();
        
        // Atualizar progresso
        window.saudacoesQuiz.updateProgress();
    }
}

// Função para mostrar resultados
window.saudacoesQuiz.showResults = function() {
    const totalTerms = window.saudacoesQuiz.shuffledTerms.length;
    const percentage = Math.round((window.saudacoesQuiz.correctAnswers / totalTerms) * 100);
    
    document.getElementById('quiz-section').style.display = 'none';
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('final-score').textContent = `${percentage}%`;
    
    const finalMessage = document.querySelector('.final-message');
    if (percentage === 100) {
        finalMessage.textContent = 'Perfeito! Você acertou todas as saudações!';
    } else if (percentage >= 80) {
        finalMessage.textContent = 'Muito bem! Você tem um bom conhecimento das saudações!';
    } else if (percentage >= 60) {
        finalMessage.textContent = 'Bom trabalho! Continue estudando para melhorar!';
    } else {
        finalMessage.textContent = 'Continue praticando! O conhecimento vem com o tempo!';
    }
};

// Função para reiniciar quiz
function restartQuiz() {
    window.saudacoesQuiz.currentTermIndex = 0;
    window.saudacoesQuiz.correctAnswers = 0;
    window.saudacoesQuiz.currentAnswered = false;
    
    document.getElementById('quiz-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    
    window.saudacoesQuiz.prepareAllMeanings();
    window.saudacoesQuiz.initTomSelect();
    window.saudacoesQuiz.loadCurrentTerm();
}

// Inicializar quiz
document.addEventListener('DOMContentLoaded', function() {
    window.saudacoesQuiz.prepareAllMeanings();
    window.saudacoesQuiz.initTomSelect();
    window.saudacoesQuiz.loadCurrentTerm();
});
