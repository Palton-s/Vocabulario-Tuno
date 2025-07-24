// Namespace para evitar conflitos
window.vocabularioQuiz = {};

// Função de embaralhamento Fisher-Yates
window.vocabularioQuiz.shuffleArray = function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Variáveis globais
window.vocabularioQuiz.shuffledTerms = [];
window.vocabularioQuiz.allMeaningsOptions = [];
window.vocabularioQuiz.currentTermIndex = 0;
window.vocabularioQuiz.correctAnswers = 0;
window.vocabularioQuiz.tomSelect = null;
window.vocabularioQuiz.currentAnswered = false;

// Função para preparar todas as opções de significados
window.vocabularioQuiz.prepareAllMeanings = function() {
    console.log('Preparando opções de significados...');
    console.log('Vocabulário disponível:', vocabularioTermos.length, 'termos');
    
    window.vocabularioQuiz.allMeaningsOptions = [];
    
    vocabularioTermos.forEach(item => {
        window.vocabularioQuiz.allMeaningsOptions.push({
            value: item.explicacao,
            text: item.explicacao,
            termo: item.termo
        });
    });
    
    console.log('Opções preparadas:', window.vocabularioQuiz.allMeaningsOptions.length);
    
    // Embaralhar as opções de significados
    window.vocabularioQuiz.allMeaningsOptions = window.vocabularioQuiz.shuffleArray(window.vocabularioQuiz.allMeaningsOptions);
    
    // Embaralhar a ordem dos termos
    window.vocabularioQuiz.shuffledTerms = window.vocabularioQuiz.shuffleArray(vocabularioTermos);
    
    console.log('Termos embaralhados:', window.vocabularioQuiz.shuffledTerms.length);
};

// Inicializar TomSelect
window.vocabularioQuiz.initTomSelect = function() {
    if (window.vocabularioQuiz.tomSelect) {
        window.vocabularioQuiz.tomSelect.destroy();
    }

    window.vocabularioQuiz.tomSelect = new TomSelect('#meaning-search', {
        create: false,
        maxItems: 1,
        valueField: 'value',
        labelField: 'text',
        searchField: 'text',
        options: window.vocabularioQuiz.allMeaningsOptions,
        render: {
            option: function(data, escape) {
                return `<div class="option-content">
                    <span class="option-name">${escape(data.text)}</span>
                </div>`;
            }
        },
        onItemAdd: function(value) {
            window.vocabularioQuiz.onItemAdd(value);
        }
    });
};

// Função para lidar com a seleção de significados
window.vocabularioQuiz.onItemAdd = function(value) {
    if (window.vocabularioQuiz.currentAnswered) {
        window.vocabularioQuiz.tomSelect.clear();
        return;
    }

    const currentTerm = window.vocabularioQuiz.shuffledTerms[window.vocabularioQuiz.currentTermIndex];
    const resultDisplay = document.getElementById('result-display');
    
    if (value === currentTerm.explicacao) {
        // Resposta correta
        window.vocabularioQuiz.correctAnswers++;
        window.vocabularioQuiz.currentAnswered = true;
        
        resultDisplay.className = 'result-display correct-answer';
        resultDisplay.innerHTML = `✅ Correto! <strong>${currentTerm.termo}</strong> = <strong>${currentTerm.explicacao}</strong>`;
        resultDisplay.style.display = 'block';
        
        // Habilitar botão próximo
        document.getElementById('next-btn').disabled = false;
        
    } else {
        // Resposta incorreta
        window.vocabularioQuiz.currentAnswered = true;
        
        resultDisplay.className = 'result-display wrong-answer';
        resultDisplay.innerHTML = `❌ Incorreto!<br>
            Você respondeu: <strong>${value}</strong><br>
            Resposta correta: <strong>${currentTerm.explicacao}</strong>`;
        resultDisplay.style.display = 'block';
        
        // Habilitar botão próximo
        document.getElementById('next-btn').disabled = false;
    }
    
    // Desabilitar o campo de busca
    window.vocabularioQuiz.tomSelect.disable();
    
    // Atualizar progresso
    window.vocabularioQuiz.updateProgress();
    
    // Limpar seleção
    window.vocabularioQuiz.tomSelect.clear();
};

// Função para atualizar progresso
window.vocabularioQuiz.updateProgress = function() {
    const totalTerms = window.vocabularioQuiz.shuffledTerms.length;
    const currentTerm = window.vocabularioQuiz.currentTermIndex + (window.vocabularioQuiz.currentAnswered ? 1 : 0);
    
    document.getElementById('progress-counter').textContent = `${currentTerm} / ${totalTerms}`;
    
    const percentage = (currentTerm / totalTerms) * 100;
    document.getElementById('progress-bar').style.width = `${percentage}%`;
};

// Função para carregar termo atual
window.vocabularioQuiz.loadCurrentTerm = function() {
    if (window.vocabularioQuiz.currentTermIndex >= window.vocabularioQuiz.shuffledTerms.length) {
        window.vocabularioQuiz.showResults();
        return;
    }

    const currentTerm = window.vocabularioQuiz.shuffledTerms[window.vocabularioQuiz.currentTermIndex];
    window.vocabularioQuiz.currentAnswered = false;
    
    document.getElementById('term-name').textContent = currentTerm.termo;
    
    // Esconder resultado anterior
    document.getElementById('result-display').style.display = 'none';
    
    // Resetar estado do botão "Desisto"
    const giveUpBtn = document.getElementById('give-up-btn');
    giveUpBtn.disabled = false;
    giveUpBtn.textContent = '🏳️ Desisto';
    
    // Reabilitar o campo de busca
    if (window.vocabularioQuiz.tomSelect) {
        window.vocabularioQuiz.tomSelect.enable();
    }
    
    // Desabilitar botão próximo
    document.getElementById('next-btn').disabled = true;
    
    window.vocabularioQuiz.updateProgress();
    
    // Atualizar texto do botão
    const nextBtn = document.getElementById('next-btn');
    if (window.vocabularioQuiz.currentTermIndex === window.vocabularioQuiz.shuffledTerms.length - 1) {
        nextBtn.textContent = 'Finalizar Quiz';
    } else {
        nextBtn.textContent = 'Próximo Termo';
    }
};

// Função para próximo termo
function nextTerm() {
    window.vocabularioQuiz.currentTermIndex++;
    window.vocabularioQuiz.loadCurrentTerm();
}

// Função para desistir e mostrar a solução
function giveUp() {
    if (window.vocabularioQuiz.currentAnswered) {
        return;
    }

    const currentTerm = window.vocabularioQuiz.shuffledTerms[window.vocabularioQuiz.currentTermIndex];
    
    // Confirmar se o usuário quer desistir
    if (confirm(`Tem certeza que deseja desistir? Isso mostrará a resposta para "${currentTerm.termo}".`)) {
        window.vocabularioQuiz.currentAnswered = true;
        
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
        window.vocabularioQuiz.tomSelect.disable();
        
        // Atualizar progresso
        window.vocabularioQuiz.updateProgress();
    }
}

// Função para mostrar resultados
window.vocabularioQuiz.showResults = function() {
    const totalTerms = window.vocabularioQuiz.shuffledTerms.length;
    const percentage = Math.round((window.vocabularioQuiz.correctAnswers / totalTerms) * 100);
    
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
    window.vocabularioQuiz.currentTermIndex = 0;
    window.vocabularioQuiz.correctAnswers = 0;
    window.vocabularioQuiz.currentAnswered = false;
    
    document.getElementById('quiz-section').style.display = 'block';
    document.getElementById('results-section').style.display = 'none';
    
    window.vocabularioQuiz.prepareAllMeanings();
    window.vocabularioQuiz.initTomSelect();
    window.vocabularioQuiz.loadCurrentTerm();
}

// Inicializar quiz
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Iniciando quiz de vocabulário...');
    
    // Carregar vocabulário primeiro
    await loadVocabulario();
    console.log('Vocabulário carregado, iniciando preparação...');
    
    // Então inicializar o quiz
    window.vocabularioQuiz.prepareAllMeanings();
    window.vocabularioQuiz.initTomSelect();
    window.vocabularioQuiz.loadCurrentTerm();
    
    console.log('Quiz inicializado com sucesso!');
});
