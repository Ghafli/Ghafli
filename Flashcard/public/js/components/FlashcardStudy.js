import FlashcardService from '../services/FlashcardService';

class FlashcardStudy {
    constructor() {
        this.flashcardService = new FlashcardService();
        this.currentCards = [];
        this.currentIndex = 0;
        this.isFlipped = false;

        // DOM Elements
        this.cardContainer = document.getElementById('flashcard-container');
        this.progressBar = document.getElementById('study-progress');
        this.categorySelect = document.getElementById('category-select');
        this.topicSelect = document.getElementById('topic-select');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Category selection
        if (this.categorySelect) {
            this.categorySelect.addEventListener('change', () => {
                this.loadFlashcardsByCategory(this.categorySelect.value);
            });
        }

        // Topic selection
        if (this.topicSelect) {
            this.topicSelect.addEventListener('change', () => {
                this.loadFlashcardsByTopic(this.topicSelect.value);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.flipCard();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousCard();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextCard();
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    if (this.isFlipped) {
                        this.rateCard(parseInt(e.key));
                    }
                    break;
            }
        });

        // Touch events
        let touchStartX = 0;
        let touchEndX = 0;

        this.cardContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.cardContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });

        // Click to flip
        this.cardContainer.addEventListener('click', () => {
            this.flipCard();
        });
    }

    handleSwipe(startX, endX) {
        const SWIPE_THRESHOLD = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > SWIPE_THRESHOLD) {
            if (diff > 0) {
                this.nextCard();
            } else {
                this.previousCard();
            }
        }
    }

    async loadFlashcardsByCategory(category) {
        try {
            this.currentCards = await this.flashcardService.getFlashcardsByCategory(category);
            this.currentIndex = 0;
            this.isFlipped = false;
            this.renderCurrentCard();
            this.updateProgress();
        } catch (error) {
            console.error('Error loading flashcards:', error);
            this.showError('Failed to load flashcards. Please try again.');
        }
    }

    async loadFlashcardsByTopic(topic) {
        try {
            this.currentCards = await this.flashcardService.getFlashcardsByTopic(topic);
            this.currentIndex = 0;
            this.isFlipped = false;
            this.renderCurrentCard();
            this.updateProgress();
        } catch (error) {
            console.error('Error loading flashcards:', error);
            this.showError('Failed to load flashcards. Please try again.');
        }
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        this.cardContainer.querySelector('.card-inner').classList.toggle('flipped');
    }

    async rateCard(quality) {
        const currentCard = this.currentCards[this.currentIndex];
        try {
            await this.flashcardService.updateCardProgress(currentCard.id, quality);
            this.nextCard();
        } catch (error) {
            console.error('Error updating card progress:', error);
            this.showError('Failed to save progress. Please try again.');
        }
    }

    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.isFlipped = false;
            this.renderCurrentCard();
            this.updateProgress();
        }
    }

    nextCard() {
        if (this.currentIndex < this.currentCards.length - 1) {
            this.currentIndex++;
            this.isFlipped = false;
            this.renderCurrentCard();
            this.updateProgress();
        } else {
            this.showCompletionMessage();
        }
    }

    renderCurrentCard() {
        const card = this.currentCards[this.currentIndex];
        if (!card) return;

        const template = `
            <div class="card-inner">
                <div class="card-front">
                    <div class="card-content">
                        ${card.front}
                    </div>
                </div>
                <div class="card-back">
                    <div class="card-content">
                        ${card.back}
                    </div>
                    <div class="rating-buttons ${this.isFlipped ? 'visible' : ''}">
                        <button onclick="study.rateCard(1)" class="btn btn-sm btn-outline-danger">Again</button>
                        <button onclick="study.rateCard(2)" class="btn btn-sm btn-outline-warning">Hard</button>
                        <button onclick="study.rateCard(3)" class="btn btn-sm btn-outline-primary">Good</button>
                        <button onclick="study.rateCard(4)" class="btn btn-sm btn-outline-success">Easy</button>
                        <button onclick="study.rateCard(5)" class="btn btn-sm btn-outline-success">Perfect</button>
                    </div>
                </div>
            </div>
        `;

        this.cardContainer.innerHTML = template;
    }

    updateProgress() {
        if (this.progressBar) {
            const progress = ((this.currentIndex + 1) / this.currentCards.length) * 100;
            this.progressBar.style.width = `${progress}%`;
            this.progressBar.setAttribute('aria-valuenow', progress);
        }
    }

    showCompletionMessage() {
        const template = `
            <div class="text-center">
                <h3>Great job!</h3>
                <p>You've completed this deck.</p>
                <button onclick="study.loadFlashcardsByCategory('${this.categorySelect.value}')" 
                        class="btn btn-primary">
                    Study Again
                </button>
            </div>
        `;
        this.cardContainer.innerHTML = template;
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        this.cardContainer.prepend(alert);
    }
}

// Initialize and export for global access
window.study = new FlashcardStudy();
