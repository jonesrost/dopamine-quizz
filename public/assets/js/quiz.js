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
        
        // Save progress after each response
        quizStorage.saveProgress(currentSlide, this.userResponses);
        
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
    
    // Check for saved progress
    if (quizStorage.hasSavedProgress()) {
        const savedProgress = quizStorage.loadProgress();
        if (savedProgress && confirm("You have a quiz in progress. Would you like to continue where you left off?")) {
            // Restore quiz state
            restoreQuizState(savedProgress);
        } else {
            // Start new quiz
            startNewQuiz();
        }
    } else {
        // Start new quiz
        startNewQuiz();
    }
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
    });
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
                // Hide on non-question slides (welcome, congratulations, sales page, etc.)
                progressBar.style.display = 'none';
            } else {
                // Show progress bar on question slides
                progressBar.style.display = 'block';
                const slidesArr = Array.from(document.querySelectorAll('.quiz-slide'));
                const firstQuestionIndex = slidesArr.findIndex(s => s.hasAttribute('data-question-id'));
                const totalQuestions = document.querySelectorAll('.quiz-slide[data-question-id]').length;
                const answeredCount = Math.max(0, slideIndex - firstQuestionIndex);
                const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
                updateProgressBar(progress);
            }
        }

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
    
    // Move to next slide after a short delay
    setTimeout(() => {
        currentSlide++;
        if (currentSlide < quizConfig.totalSlides) {
            showSlide(currentSlide);
        } else {
            showFinalMessage();
        }
    }, 800);
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