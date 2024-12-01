import FlashcardService from '../services/FlashcardService';

class QuizMode {
    constructor() {
        this.flashcardService = new FlashcardService();
        this.currentCards = [];
        this.currentIndex = 0;
        this.score = 0;
        this.selectedAnswer = null;

        // DOM Elements
        this.container = document.getElementById('quiz-mode-container');
        this.progressBar = document.getElementById('quiz-progress');
        this.scoreDisplay = document.getElementById('quiz-score');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '4') {
                this.selectAnswer(parseInt(e.key) - 1);
            } else if (e.key === 'Enter' && this.selectedAnswer !== null) {
                this.checkAnswer();
            }
        });
    }

    async loadCards(category) {
        try {
            const allCards = await this.flashcardService.getFlashcardsByCategory(category);
            this.currentCards = this.prepareQuizQuestions(allCards);
            this.currentIndex = 0;
            this.score = 0;
            this.updateScore();
            this.renderCurrentQuestion();
        } catch (error) {
            console.error('Error loading cards:', error);
            this.showError('Failed to load quiz questions. Please try again.');
        }
    }

    prepareQuizQuestions(cards) {
        return cards.map(card => {
            // Get 3 random incorrect answers from other cards
            const incorrectAnswers = cards
                .filter(c => c.id !== card.id)
                .map(c => c.back)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            // Add correct answer and shuffle all options
            const options = [...incorrectAnswers, card.back]
                .sort(() => 0.5 - Math.random());

            return {
                ...card,
                options,
                correctAnswerIndex: options.indexOf(card.back)
            };
        });
    }

    selectAnswer(index) {
        this.selectedAnswer = index;
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, i) => {
            option.classList.remove('selected');
            if (i === index) {
                option.classList.add('selected');
            }
        });
    }

    checkAnswer() {
        if (this.selectedAnswer === null) return;

        const currentQuestion = this.currentCards[this.currentIndex];
        const isCorrect = this.selectedAnswer === currentQuestion.correctAnswerIndex;

        if (isCorrect) {
            this.score++;
            this.updateScore();
            this.flashcardService.updateCardProgress(currentQuestion.id, 5);
        } else {
            this.flashcardService.updateCardProgress(currentQuestion.id, 1);
        }

        this.showAnswerFeedback(isCorrect, currentQuestion.correctAnswerIndex);
    }

    showAnswerFeedback(isCorrect, correctIndex) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.classList.remove('selected');
            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === this.selectedAnswer && !isCorrect) {
                option.classList.add('incorrect');
            }
        });

        const feedbackDiv = document.getElementById('quiz-feedback');
        feedbackDiv.innerHTML = isCorrect 
            ? '<div class="alert alert-success">Correct!</div>'
            : '<div class="alert alert-danger">Incorrect!</div>';

        document.getElementById('check-answer-btn').style.display = 'none';
        document.getElementById('next-question-btn').style.display = 'block';
    }

    nextQuestion() {
        if (this.currentIndex < this.currentCards.length - 1) {
            this.currentIndex++;
            this.selectedAnswer = null;
            this.renderCurrentQuestion();
            this.updateProgress();
        } else {
            this.showCompletionMessage();
        }
    }

    renderCurrentQuestion() {
        const question = this.currentCards[this.currentIndex];
        if (!question) return;

        this.container.innerHTML = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Question ${this.currentIndex + 1} of ${this.currentCards.length}</h5>
                    <p class="card-text">${question.front}</p>
                    <div class="quiz-options">
                        ${question.options.map((option, index) => `
                            <div class="quiz-option" onclick="quizMode.selectAnswer(${index})">
                                <span class="option-number">${index + 1}</span>
                                ${option}
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3">
                        <button id="check-answer-btn" 
                                class="btn btn-primary" 
                                onclick="quizMode.checkAnswer()">
                            Check Answer
                        </button>
                        <button id="next-question-btn" 
                                class="btn btn-secondary" 
                                style="display: none;"
                                onclick="quizMode.nextQuestion()">
                            Next Question
                        </button>
                    </div>
                    <div id="quiz-feedback" class="mt-3"></div>
                </div>
            </div>
        `;

        this.updateProgress();
    }

    updateProgress() {
        if (this.progressBar) {
            const progress = ((this.currentIndex + 1) / this.currentCards.length) * 100;
            this.progressBar.style.width = `${progress}%`;
            this.progressBar.setAttribute('aria-valuenow', progress);
        }
    }

    updateScore() {
        if (this.scoreDisplay) {
            const percentage = (this.score / this.currentCards.length) * 100;
            this.scoreDisplay.textContent = `Score: ${percentage.toFixed(1)}%`;
        }
    }

    showCompletionMessage() {
        const percentage = (this.score / this.currentCards.length) * 100;
        this.container.innerHTML = `
            <div class="text-center">
                <h3>Quiz Complete!</h3>
                <p>You scored ${this.score} out of ${this.currentCards.length} (${percentage.toFixed(1)}%)</p>
                <button onclick="quizMode.loadCards('${this.currentCategory}')" 
                        class="btn btn-primary">
                    Try Again
                </button>
            </div>
        `;
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        this.container.prepend(alert);
    }
}

// Initialize and export for global access
window.quizMode = new QuizMode();
