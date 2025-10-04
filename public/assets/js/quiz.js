/**
 * Dopamine Quiz - Quiz System with Dopaminergic Effects
 * Enhanced version with improved user experience and engagement
 */

// Quiz configuration
const quizConfig = {
    totalSlides: 12, // Welcome + Congratulations + 9 questions + Final
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
            e.preventDefault(); // Prevent default scroll behavior
            isScrolling = true;
            if (swipeEnabled) {
                navigateToNextSlide();
            }
            
            // Prevent rapid scrolling with smoother timing
            setTimeout(() => {
                isScrolling = false;
            }, 600); // Reduced from 800ms to 600ms for smoother experience
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
        
        // Show/hide progress bar based on slide index
        const progressBar = document.querySelector('.quiz-progress-bar');
        if (progressBar) {
            // Hide progress bar on congratulations screen (slide 1)
            if (slideIndex === 1) {
                progressBar.style.display = 'none';
            } else if (slideIndex >= 2) {
                // Show progress bar starting from slide 2 (first question)
                progressBar.style.display = 'block';
                // Adjust progress calculation to start from slide 2
                const adjustedProgress = ((slideIndex - 2) / (quizConfig.totalSlides - 3)) * 100;
                updateProgressBar(Math.max(0, adjustedProgress));
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
    // For now, just show an alert - this would be replaced with actual results page
    alert('Your personalized results would be displayed here!');
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
    const requiresRead = slideElement && slideElement.dataset && slideElement.dataset.requiresRead === 'true';
    const indicator = slideElement.querySelector('.swipe-indicator');
    const contentEl = slideElement.querySelector('.slide-scroll-content');
    
    // Default: enable swipe except for intro/story slides with requiresRead
    if (requiresRead && (slideIndex === 0 || slideIndex === 1)) {
        // If content is scrollable, disable swipe until bottom reached
        const isScrollable = contentEl && contentEl.scrollHeight > contentEl.clientHeight + 2;
        if (isScrollable) {
            setSwipeEnabled(false, indicator, contentEl);
            // Attach listener to enable swipe when scrolled to bottom
            const onScroll = () => {
                if (isScrolledToBottom(contentEl)) {
                    setSwipeEnabled(true, indicator, contentEl);
                }
            };
            contentEl.addEventListener('scroll', onScroll, { passive: true });
        } else {
            // Not scrollable: allow immediate swipe
            setSwipeEnabled(true, indicator, contentEl);
        }
    } else {
        setSwipeEnabled(true, indicator, contentEl);
    }
}

function setSwipeEnabled(enabled, indicator, contentEl) {
    swipeEnabled = enabled;
    if (indicator) {
        indicator.classList.toggle('enabled', enabled);
        indicator.classList.toggle('disabled', !enabled);
        indicator.classList.toggle('hidden', !enabled);
        const textEl = indicator.querySelector('.swipe-text');
        if (textEl) {
            textEl.textContent = enabled ? 'deslize para continuar' : 'role para ler e depois deslize';
        }
    }

    // Não reservar espaço no conteúdo: indicador fica sobreposto sem criar faixa
}

function isScrolledToBottom(el) {
    if (!el) return true;
    return (el.scrollTop + el.clientHeight) >= (el.scrollHeight - 6);
}