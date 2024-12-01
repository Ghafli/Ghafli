<div class="container py-5">
    <!-- Learning Progress Overview -->
    <div class="row g-4 mb-5">
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">Cards to Review Today</h5>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-calendar-check text-primary me-2 display-4"></i>
                        <h2 class="mb-0" id="due-cards-count">0</h2>
                    </div>
                    <a href="/study" class="btn btn-primary mt-3">Start Review</a>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">Mastery Progress</h5>
                    <div class="progress mb-3" style="height: 20px;">
                        <div id="mastery-progress" 
                             class="progress-bar bg-success" 
                             role="progressbar" 
                             style="width: 0%" 
                             aria-valuenow="0" 
                             aria-valuemin="0" 
                             aria-valuemax="100">0%</div>
                    </div>
                    <small class="text-muted">
                        <span id="mastered-cards">0</span> out of <span id="total-cards">0</span> cards mastered
                    </small>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">Average Difficulty</h5>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-graph-up text-info me-2 display-4"></i>
                        <h2 class="mb-0" id="average-ease">2.5</h2>
                    </div>
                    <small class="text-muted d-block mt-2">Based on your performance</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Review Schedule -->
    <div class="card mb-5">
        <div class="card-body">
            <h5 class="card-title">Upcoming Reviews</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Cards Due</th>
                            <th>Categories</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="review-schedule">
                        <!-- Schedule rows will be inserted here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Individual Card Progress -->
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Card Progress Details</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Card</th>
                            <th>Reviews</th>
                            <th>Average Quality</th>
                            <th>Next Review</th>
                            <th>Interval</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="card-progress">
                        <!-- Card progress rows will be inserted here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script type="module">
    import SpacedRepetitionService from '/js/services/SpacedRepetitionService.js';

    class ScheduleDashboard {
        constructor() {
            this.spacedRepetitionService = new SpacedRepetitionService();
            this.initialize();
        }

        async initialize() {
            await this.loadLearningProgress();
            await this.loadReviewSchedule();
            await this.loadCardProgress();
        }

        async loadLearningProgress() {
            try {
                const progress = await this.spacedRepetitionService.getLearningProgress();
                
                // Update cards to review
                document.getElementById('due-cards-count').textContent = progress.cardsToReview;

                // Update mastery progress
                const masteryProgress = document.getElementById('mastery-progress');
                masteryProgress.style.width = `${progress.masteryPercentage}%`;
                masteryProgress.textContent = `${progress.masteryPercentage.toFixed(1)}%`;

                // Update card counts
                document.getElementById('mastered-cards').textContent = progress.masteredCards;
                document.getElementById('total-cards').textContent = progress.totalCards;

                // Update average ease
                document.getElementById('average-ease').textContent = 
                    progress.averageEaseFactor.toFixed(2);
            } catch (error) {
                console.error('Error loading learning progress:', error);
            }
        }

        async loadReviewSchedule() {
            try {
                const dueCards = await this.spacedRepetitionService.getDueCards();
                const schedule = this.groupCardsByDueDate(dueCards);
                const tbody = document.getElementById('review-schedule');

                tbody.innerHTML = schedule.map(day => `
                    <tr>
                        <td>${this.formatDate(day.date)}</td>
                        <td>${day.cards.length}</td>
                        <td>${this.formatCategories(day.categories)}</td>
                        <td>
                            <a href="/study?date=${day.date.toISOString()}" 
                               class="btn btn-sm btn-primary">
                                Review
                            </a>
                        </td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Error loading review schedule:', error);
            }
        }

        async loadCardProgress() {
            try {
                const dueCards = await this.spacedRepetitionService.getDueCards();
                const tbody = document.getElementById('card-progress');

                const cardRows = await Promise.all(dueCards.map(async card => {
                    const stats = await this.spacedRepetitionService.getCardStats(card.id);
                    return `
                        <tr>
                            <td>${card.front}</td>
                            <td>${stats.totalReviews}</td>
                            <td>${stats.averageQuality.toFixed(1)}</td>
                            <td>${this.formatDate(stats.nextReview.toDate())}</td>
                            <td>${stats.currentInterval} days</td>
                            <td>${this.getStatusBadge(stats)}</td>
                            <td>
                                <button onclick="scheduleDashboard.resetCard('${card.id}')"
                                        class="btn btn-sm btn-outline-danger">
                                    Reset
                                </button>
                            </td>
                        </tr>
                    `;
                }));

                tbody.innerHTML = cardRows.join('');
            } catch (error) {
                console.error('Error loading card progress:', error);
            }
        }

        groupCardsByDueDate(cards) {
            const groups = new Map();

            cards.forEach(card => {
                const dueDate = card.nextReview.toDate();
                dueDate.setHours(0, 0, 0, 0);
                
                if (!groups.has(dueDate.getTime())) {
                    groups.set(dueDate.getTime(), {
                        date: dueDate,
                        cards: [],
                        categories: new Set()
                    });
                }

                const group = groups.get(dueDate.getTime());
                group.cards.push(card);
                group.categories.add(card.category);
            });

            return Array.from(groups.values())
                .sort((a, b) => a.date - b.date);
        }

        formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }

        formatCategories(categories) {
            return Array.from(categories)
                .map(category => `
                    <span class="badge bg-secondary">${category}</span>
                `)
                .join(' ');
        }

        getStatusBadge(stats) {
            if (stats.mastered) {
                return '<span class="badge bg-success">Mastered</span>';
            }
            if (stats.averageQuality >= 4) {
                return '<span class="badge bg-info">Learning</span>';
            }
            return '<span class="badge bg-warning">Reviewing</span>';
        }

        async resetCard(cardId) {
            if (confirm('Are you sure you want to reset this card\'s progress?')) {
                try {
                    await this.spacedRepetitionService.resetCardProgress(cardId);
                    await this.loadCardProgress();
                } catch (error) {
                    console.error('Error resetting card:', error);
                }
            }
        }
    }

    // Initialize and expose for event handlers
    window.scheduleDashboard = new ScheduleDashboard();
</script>
