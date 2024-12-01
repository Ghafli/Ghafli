import FlashcardService from '../services/FlashcardService';

class WritingMode {
    constructor() {
        this.flashcardService = new FlashcardService();
        this.currentCards = [];
        this.currentIndex = 0;
        this.score = 0;

        // DOM Elements
        this.container = document.getElementById('writing-mode-container');
        this.progressBar = document.getElementById('writing-progress');
        this.scoreDisplay = document.getElementById('writing-score');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('writing-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkAnswer();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.checkAnswer();
            }
        });
    }

    async loadCards(category) {
        try {
            this.currentCards = await this.flashcardService.getFlashcardsByCategory(category);
            this.currentIndex = 0;
            this.score = 0;
            this.updateScore();
            this.renderCurrentCard();
        } catch (error) {
            console.error('Error loading cards:', error);
            this.showError('Failed to load cards. Please try again.');
        }
    }

    checkAnswer() {
        const userAnswer = document.getElementById('answer-input').value.trim().toLowerCase();
        const correctAnswer = this.currentCards[this.currentIndex].back.trim().toLowerCase();

        // Calculate similarity score using Levenshtein distance
        const similarity = this.calculateSimilarity(userAnswer, correctAnswer);
        
        if (similarity >= 0.85) {
            this.showFeedback(true, correctAnswer);
            this.score++;
            this.updateScore();
            this.flashcardService.updateCardProgress(this.currentCards[this.currentIndex].id, 5);
        } else if (similarity >= 0.7) {
            this.showFeedback('partial', correctAnswer);
            this.score += 0.5;
            this.updateScore();
            this.flashcardService.updateCardProgress(this.currentCards[this.currentIndex].id, 3);
        } else {
            this.showFeedback(false, correctAnswer);
            this.flashcardService.updateCardProgress(this.currentCards[this.currentIndex].id, 1);
        }
    }

    calculateSimilarity(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null)
            .map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + substitutionCost
                );
            }
        }

        const distance = matrix[str2.length][str1.length];
        const maxLength = Math.max(str1.length, str2.length);
        return 1 - (distance / maxLength);
    }

    showFeedback(result, correctAnswer) {
        const feedbackDiv = document.getElementById('answer-feedback');
        const nextButton = document.getElementById('next-button');
        
        if (result === true) {
            feedbackDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="bi bi-check-circle-fill"></i> Correct!
                </div>`;
        } else if (result === 'partial') {
            feedbackDiv.innerHTML = `
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-circle-fill"></i> Close! The correct answer was: ${correctAnswer}
                </div>`;
        } else {
            feedbackDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-x-circle-fill"></i> Incorrect. The correct answer was: ${correctAnswer}
                </div>`;
        }

        nextButton.style.display = 'block';
        document.getElementById('answer-input').disabled = true;
    }

    nextCard() {
        if (this.currentIndex < this.currentCards.length - 1) {
            this.currentIndex++;
            this.renderCurrentCard();
            this.updateProgress();
        } else {
            this.showCompletionMessage();
        }
    }

    renderCurrentCard() {
        const card = this.currentCards[this.currentIndex];
        if (!card) return;

        this.container.innerHTML = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Question ${this.currentIndex + 1} of ${this.currentCards.length}</h5>
                    <p class="card-text">${card.front}</p>
                    <form id="writing-form" class="mt-3">
                        <div class="mb-3">
                            <textarea id="answer-input" 
                                    class="form-control" 
                                    rows="3" 
                                    placeholder="Type your answer here..."
                                    required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            Check Answer
                        </button>
                        <button id="next-button" 
                                type="button" 
                                class="btn btn-secondary" 
                                style="display: none;"
                                onclick="writingMode.nextCard()">
                            Next Card
                        </button>
                    </form>
                    <div id="answer-feedback" class="mt-3"></div>
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
                <h3>Congratulations!</h3>
                <p>You've completed this study session with a score of ${percentage.toFixed(1)}%</p>
                <button onclick="writingMode.loadCards('${this.currentCategory}')" 
                        class="btn btn-primary">
                    Study Again
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
window.writingMode = new WritingMode();
