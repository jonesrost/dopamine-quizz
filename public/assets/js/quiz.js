/**
 * Dopamine Quiz - Quiz System with Dopaminergic Effects
 * Enhanced version with improved user experience and engagement
 */

// Quiz configuration
const quizConfig = {
    totalSlides: 12, // será atualizado dinamicamente com base no DOM
    welcomeScreenDuration: 1000
};

// Track current slide
let currentSlide = 0;
let slideStartTime = 0;
let swipeEnabled = true; // Gate for swipe navigation on intro/story slides

// Local Storage Manager for saving quiz progress
const quizStorage = {
    // Save current quiz progress
    saveProgress: function(currentSlide, responses) {
        const progressData = {
            currentSlide: currentSlide,
            responses: responses,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('dopamineQuizProgress', JSON.stringify(progressData));
        console.log('Progress saved:', progressData);
    },
    
    // Load saved quiz progress
    loadProgress: function() {
        const savedData = localStorage.getItem('dopamineQuizProgress');
        if (savedData) {
            try {
                return JSON.parse(savedData);
            } catch (e) {
                console.error('Error parsing saved progress:', e);
                return null;
            }
        }
        return null;
    },
    
    // Clear saved progress
    clearProgress: function() {
        localStorage.removeItem('dopamineQuizProgress');
        console.log('Progress cleared');
    },
    
    // Check if there's saved progress
    hasSavedProgress: function() {
        return localStorage.getItem('dopamineQuizProgress') !== null;
    }
};

// Analytics tracking
const quizAnalytics = {
    userResponses: [],
    quizStartTime: null,
    quizEndTime: null,
    
    // Initialize analytics
    init: function() {
        this.quizStartTime = new Date();
        this.userResponses = [];
        console.log('Quiz started:', this.quizStartTime);
    },
    
    // Track user response
    trackResponse: function(questionId, questionText, selectedOption, timeSpent) {
        const response = {
            questionId,
            questionText,
            selectedOption,
            timeSpent,
            timestamp: new Date()
        };
        
        this.userResponses.push(response);
        console.log('Response recorded:', response);
        
        // Sem salvar progresso em localStorage (desativado)
        
        // Here you can send the data to an analytics server
        // this.sendToAnalyticsServer(response);
    },
    
    // Track quiz completion
    trackCompletion: function() {
        this.quizEndTime = new Date();
        const totalTime = (this.quizEndTime - this.quizStartTime) / 1000; // in seconds
        
        const completionData = {
            totalTime,
            totalQuestions: quizConfig.totalSlides,
            responses: this.userResponses
        };
        
        console.log('Quiz completed:', completionData);
        
        // Clear saved progress on completion
        quizStorage.clearProgress();
        
        // Here you can send the data to an analytics server
        // this.sendCompletionToAnalyticsServer(completionData);
        
        return completionData;
    }
};

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupQuiz();
    // Atualiza dinamicamente o total de slides com base no DOM
    const allSlides = document.querySelectorAll('.quiz-slide');
    if (allSlides && allSlides.length) {
        quizConfig.totalSlides = allSlides.length;
    }
    
    // Início sempre limpo: sem memória de sessão e sem prompts
    startNewQuiz();

    // Setup custom leave/refresh protection
    setupLeaveProtection();
});

// Start a new quiz
function startNewQuiz() {
    // Initialize analytics
    quizAnalytics.init();
    
    // Reset current slide
    currentSlide = 0;
    
    // Show welcome screen
    showWelcomeScreen();
}

// Restore quiz state from saved progress
function restoreQuizState(savedProgress) {
    console.log("Restoring quiz state:", savedProgress);
    
    // Initialize analytics
    quizAnalytics.init();
    
    // Restore current slide
    if (savedProgress.currentSlide !== undefined) {
        currentSlide = savedProgress.currentSlide;
        showSlide(currentSlide);
    }
    
    // Restore user responses
    if (savedProgress.responses) {
        quizAnalytics.userResponses = savedProgress.responses;
    }
    
    // Update progress bar
    updateProgressBar();
}

// Setup quiz content and event listeners
function setupQuiz() {
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Touch and scroll navigation
    setupSwipeAndScrollNavigation();
    
    // Option buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option-button')) {
            handleOptionClick(e.target);
        }
        
        // Continue button on Story (Slide 1)
        if (e.target.classList.contains('continue-button')) {
            currentSlide++;
            if (currentSlide < quizConfig.totalSlides) {
                showSlide(currentSlide);
            }
        }
        
        // CTA button
        if (e.target.classList.contains('cta-button')) {
            handleFinalCta();
        }
        
        // Restart button
        if (e.target.classList.contains('restart-button')) {
            quizStorage.clearProgress();
            startNewQuiz();
        }

        // Efeitos visuais e sonoros em cliques de botões
        const clickable = e.target.closest('button');
        if (clickable && (clickable.classList.contains('option-button') || clickable.classList.contains('cta-button') || clickable.classList.contains('continue-button') || clickable.classList.contains('start-button') || clickable.classList.contains('restart-button'))) {
            spawnSparklesAt(e.clientX || (window.innerWidth/2), e.clientY || (window.innerHeight/2));
            playClickSound();
        }
    });

    // Estado ativo nos botões durante o clique
    document.addEventListener('mousedown', function(e) {
        const btn = e.target.closest('button');
        if (btn && (btn.classList.contains('option-button') || btn.classList.contains('cta-button') || btn.classList.contains('continue-button') || btn.classList.contains('start-button') || btn.classList.contains('restart-button'))) {
            btn.classList.add('active');
        }
    });

    ['mouseup', 'mouseleave', 'blur'].forEach(evt => {
        document.addEventListener(evt, function(e) {
            const btn = e.target.closest('button');
            if (btn && (btn.classList.contains('option-button') || btn.classList.contains('cta-button') || btn.classList.contains('continue-button') || btn.classList.contains('start-button') || btn.classList.contains('restart-button'))) {
                btn.classList.remove('active');
            }
        }, true);
    });

    // Suporte a toque para estado ativo em mobile
    document.addEventListener('touchstart', function(e) {
        const btn = e.target.closest('button');
        if (btn && (btn.classList.contains('option-button') || btn.classList.contains('cta-button') || btn.classList.contains('continue-button') || btn.classList.contains('start-button') || btn.classList.contains('restart-button'))) {
            btn.classList.add('active');
        }
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        const btn = e.target.closest('button');
        if (btn && (btn.classList.contains('option-button') || btn.classList.contains('cta-button') || btn.classList.contains('continue-button') || btn.classList.contains('start-button') || btn.classList.contains('restart-button'))) {
            btn.classList.remove('active');
        }
    }, { passive: true });
}

// Setup leave/refresh protection to show custom modal
function setupLeaveProtection() {
    const leaveModal = document.getElementById('leave-modal');
    const btnRestart = document.getElementById('leave-restart');
    const btnCancel = document.getElementById('leave-cancel');

    function showLeaveModal() {
        // Não mostrar nos dois primeiros passos
        if (currentSlide < 2) return;
        if (leaveModal) {
            leaveModal.classList.remove('hidden');
        }
    }

    function hideLeaveModal() {
        if (leaveModal) {
            leaveModal.classList.add('hidden');
        }
    }

    // Keyboard refresh: F5 or Cmd/Ctrl+R
    document.addEventListener('keydown', function(e) {
        const isRefreshCombo = (e.key === 'F5') || ((e.key === 'r' || e.key === 'R') && (e.metaKey || e.ctrlKey));
        if (isRefreshCombo) {
            e.preventDefault();
            showLeaveModal();
        }
    });

    // Intercept clicks on external links
    document.addEventListener('click', function(e) {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href && !anchor.href.includes('index.html') && !anchor.href.startsWith('#')) {
            if (currentSlide >= 2) {
                e.preventDefault();
                showLeaveModal();
            }
        }
    });

    // Removido o beforeunload para evitar o prompt nativo do navegador

    // Wire modal actions
    // Botão "Continuar" removido (sem memória de sessão)

    if (btnRestart) {
        btnRestart.addEventListener('click', function() {
            quizStorage.clearProgress();
            startNewQuiz();
            hideLeaveModal();
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', function() {
            hideLeaveModal();
        });
    }
}

function setupSwipeAndScrollNavigation() {
    let touchStartY = 0;
    let touchEndY = 0;
    let isScrolling = false;
    
    // Touch events for mobile
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture();
    }, { passive: true });
    
    // Wheel event for desktop scroll
    document.addEventListener('wheel', function(e) {
        if (isScrolling) return;
        
        // Detect upward scroll (negative deltaY)
        if (e.deltaY < -50) {
            // Só impede o scroll e navega quando o swipe está habilitado
            if (swipeEnabled) {
                e.preventDefault(); // Prevent default scroll behavior apenas quando for navegar
                isScrolling = true;
                navigateToNextSlide();
                
                // Prevent rapid scrolling with smoother timing
                setTimeout(() => {
                    isScrolling = false;
                }, 600); // Reduced from 800ms to 600ms for smoother experience
            }
        }
    }, { passive: false }); // Changed to passive: false to allow preventDefault
    
    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const swipeDistance = touchStartY - touchEndY;
        
        // Detect upward swipe (positive distance)
        if (swipeDistance > swipeThreshold) {
            if (swipeEnabled) {
                navigateToNextSlide();
            }
        }
    }
    
    function navigateToNextSlide() {
        // Allow navigation from welcome screen (slide 0) to story screen (slide 1)
        if (currentSlide === 0 || currentSlide === 1) {
            // Antes de trocar, aplica gate imediato baseado no alvo
            const slidesAll = document.querySelectorAll('.quiz-slide');
            const targetIndex = currentSlide + 1;
            const targetEl = slidesAll[targetIndex];
            if (targetEl) {
                // Se o alvo tem no-swipe, desabilita imediatamente para evitar avanço acidental
                swipeEnabled = !targetEl.hasAttribute('data-no-swipe');
            }

            currentSlide++;
            // Add smooth transition effect
            const currentSlideElement = document.querySelector('.quiz-slide[style*="display: flex"]');
            if (currentSlideElement) {
                currentSlideElement.style.transition = 'opacity 0.3s ease-out';
                currentSlideElement.style.opacity = '0';
                
                setTimeout(() => {
                    showSlide(currentSlide);
                    const newSlideElement = document.querySelector('.quiz-slide[style*="display: flex"]');
                    if (newSlideElement) {
                        newSlideElement.style.opacity = '0';
                        newSlideElement.style.transition = 'opacity 0.3s ease-in';
                        setTimeout(() => {
                            newSlideElement.style.opacity = '1';
                        }, 50);
                    }
                }, 300);
            } else {
                showSlide(currentSlide);
            }
        }
    }
}

// Show welcome screen
function showWelcomeScreen() {
    hideAllSlides();
    const welcomeScreen = document.querySelector('.welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
    }
    // Hide progress bar on welcome screen
    const progressBar = document.querySelector('.quiz-progress-bar');
    if (progressBar) {
        progressBar.style.display = 'none';
    }
}

// Show a specific slide
function showSlide(slideIndex) {
    hideAllSlides();
    
    // Record start time for analytics
    slideStartTime = Date.now();
    
    // Show the current slide
    const slides = document.querySelectorAll('.quiz-slide');
    if (slideIndex >= 0 && slideIndex < slides.length) {
        slides[slideIndex].style.display = 'flex';
        const slideElement = slides[slideIndex];
        
        // Show/hide progress bar based on whether the slide is a question
        const progressBar = document.querySelector('.quiz-progress-bar');
        if (progressBar) {
            const isQuestionSlide = slideElement.hasAttribute('data-question-id');
            if (!isQuestionSlide) {
                // Esconde em slides não-pergunta (boas-vindas, parabéns, vendas, etc.)
                progressBar.style.display = 'none';
            } else {
                // Mostra e calcula pelo número de respostas registradas
                progressBar.style.display = 'block';
                const totalQuestions = document.querySelectorAll('.quiz-slide[data-question-id]').length;
                const answeredCount = (quizAnalytics.userResponses && quizAnalytics.userResponses.length) ? quizAnalytics.userResponses.length : 0;
                const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
                updateProgressBar(progress);
            }
        }

        // Fade-in suave ao exibir slide
        slideElement.style.opacity = '0';
        slideElement.style.transition = 'opacity 300ms ease';
        setTimeout(() => { slideElement.style.opacity = '1'; }, 30);

        // Gating: require reading content on intro/story slides if marked
        setupScrollGateForSlide(slideElement, slideIndex);
    }
}

// Hide all slides
function hideAllSlides() {
    document.querySelectorAll('.quiz-slide').forEach(slide => {
        slide.style.display = 'none';
    });
}

// Handle option click
function handleOptionClick(optionButton) {
    // Get question data
    const slide = optionButton.closest('.quiz-slide');
    const questionId = parseInt(slide.dataset.questionId);
    const questionText = slide.querySelector('.slide-question').textContent;
    const selectedOption = optionButton.textContent;
    
    // Calculate time spent on this question
    const timeSpent = (Date.now() - slideStartTime) / 1000; // in seconds
    
    // Track response for analytics
    quizAnalytics.trackResponse(questionId, questionText, selectedOption, timeSpent);

    // Atualiza visualmente a barra de progresso conforme respostas
    const totalQuestions = document.querySelectorAll('.quiz-slide[data-question-id]').length;
    const answeredCount = (quizAnalytics.userResponses && quizAnalytics.userResponses.length) ? quizAnalytics.userResponses.length : 0;
    const progressNow = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
    updateProgressBar(progressNow);

    // Se respondeu a última pergunta, anima até 100% antes de parabéns
    const isLastQuestionAnswered = answeredCount >= totalQuestions && totalQuestions > 0;
    if (isLastQuestionAnswered) {
        // Completa a barra e só então mostra parabéns
        updateProgressBar(100);
        setTimeout(() => {
            showFinalMessage();
        }, 800);
        return;
    }

    // Move to next slide after a short delay
    setTimeout(() => {
        currentSlide++;
        if (currentSlide < quizConfig.totalSlides) {
            showSlide(currentSlide);
        } else {
            showFinalMessage();
        }
    }, 600);
}

// Show reward animation
function showRewardAnimation() {
    const rewardAnimation = document.querySelector('.reward-animation');
    if (rewardAnimation) {
        rewardAnimation.classList.remove('hidden');
        
        // Show confetti
        showConfetti();
        
        // Hide reward animation after a delay
        setTimeout(() => {
            rewardAnimation.classList.add('hidden');
        }, 1500);
    }
}

// Show confetti animation
function showConfetti() {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// Sparkles (confetti leve) na posição do clique
function spawnSparklesAt(x, y) {
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 20,
            spread: 30,
            startVelocity: 30,
            origin: { x: x / window.innerWidth, y: y / window.innerHeight }
        });
    }
}

// Som satisfatório de clique (beep curto)
function playClickSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
        // Se o contexto não puder iniciar, silenciosamente ignora
        console.warn('Audio click not available:', e);
    }
}

// Show final message
function showFinalMessage() {
    hideAllSlides();
    const finalSlide = document.querySelector('.final-slide');
    if (finalSlide) {
        finalSlide.style.display = 'flex';
    }
    
    // Track quiz completion
    quizAnalytics.trackCompletion();
}

// Handle final CTA button click
function handleFinalCta() {
    // Navega para a seção de vendas interna no fluxo do quiz
    const slides = Array.from(document.querySelectorAll('.quiz-slide'));
    const salesSlide = document.querySelector('.quiz-slide.sales-page');
    if (salesSlide) {
        const targetIndex = slides.indexOf(salesSlide);
        if (targetIndex !== -1) {
            currentSlide = targetIndex;
            showSlide(currentSlide);
            return;
        }
    }
    // Fallback: caso a seção interna não exista, redireciona para sales.html
    window.location.href = 'sales.html';
}

// Update progress bar
function updateProgressBar(progress = 0) {
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
}

// Setup scroll gate for slides that require reading before swiping
function setupScrollGateForSlide(slideElement, slideIndex) {
    const indicator = slideElement.querySelector('.swipe-indicator');
    const contentEl = slideElement.querySelector('.slide-scroll-content');
    // Desabilita swipe quando marcado com data-no-swipe
    const noSwipe = slideElement.hasAttribute('data-no-swipe');
    setSwipeEnabled(!noSwipe, indicator, contentEl);
}

function setSwipeEnabled(enabled, indicator, contentEl) {
    swipeEnabled = enabled;
    if (indicator) {
        const textEl = indicator.querySelector('.swipe-text');
        if (enabled) {
            indicator.classList.add('enabled');
            indicator.classList.remove('disabled');
            indicator.classList.remove('hidden');
            if (textEl) { textEl.textContent = 'swipe'; }
        } else {
            indicator.classList.remove('enabled');
            indicator.classList.add('disabled');
            indicator.classList.add('hidden');
            if (textEl) { textEl.textContent = ''; }
        }
    }
}