<div class="container py-5">
    <!-- Overview Cards -->
    <div class="row g-4 mb-5">
        <div class="col-md-3">
            <div class="card h-100 border-primary">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Current Streak</h6>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-fire text-primary me-2 display-4"></i>
                        <h2 class="mb-0" id="current-streak">0</h2>
                        <small class="ms-2">days</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Cards Studied</h6>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-card-text text-success me-2 display-4"></i>
                        <h2 class="mb-0" id="total-cards">0</h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Average Accuracy</h6>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-bullseye text-danger me-2 display-4"></i>
                        <h2 class="mb-0" id="average-accuracy">0%</h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card h-100">
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Study Time</h6>
                    <div class="d-flex align-items-center">
                        <i class="bi bi-clock-history text-info me-2 display-4"></i>
                        <h2 class="mb-0" id="total-time">0h</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Progress Charts -->
    <div class="row mb-5">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Study Activity</h5>
                    <canvas id="activity-chart"></canvas>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Category Progress</h5>
                    <canvas id="category-chart"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Recent Activity</h5>
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Mode</th>
                            <th>Cards Studied</th>
                            <th>Accuracy</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody id="recent-activity">
                        <!-- Activity rows will be inserted here -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script type="module">
    import ProgressService from '/js/services/ProgressService.js';

    class ProgressDashboard {
        constructor() {
            this.progressService = new ProgressService();
            this.activityChart = null;
            this.categoryChart = null;
            this.initialize();
        }

        async initialize() {
            await this.loadUserStats();
            await this.loadActivityChart();
            await this.loadCategoryChart();
            await this.loadRecentActivity();
        }

        async loadUserStats() {
            try {
                const stats = await this.progressService.getUserStats();
                if (!stats) return;

                document.getElementById('current-streak').textContent = stats.currentStreak;
                document.getElementById('total-cards').textContent = stats.totalCardsStudied;
                document.getElementById('average-accuracy').textContent = 
                    `${((stats.totalCorrectAnswers / stats.totalCardsStudied) * 100).toFixed(1)}%`;
                document.getElementById('total-time').textContent = 
                    this.progressService.formatDuration(stats.totalStudyTime);
            } catch (error) {
                console.error('Error loading user stats:', error);
            }
        }

        async loadActivityChart() {
            try {
                const recentProgress = await this.progressService.getRecentProgress();
                const ctx = document.getElementById('activity-chart');

                const dailyData = this.aggregateDailyProgress(recentProgress);

                this.activityChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dailyData.map(d => d.date),
                        datasets: [{
                            label: 'Cards Studied',
                            data: dailyData.map(d => d.cardsStudied),
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error loading activity chart:', error);
            }
        }

        async loadCategoryChart() {
            try {
                const categoryProgress = await this.progressService.getCategoryProgress();
                const ctx = document.getElementById('category-chart');

                this.categoryChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: categoryProgress.map(c => c.category),
                        datasets: [{
                            data: categoryProgress.map(c => c.cardsStudied),
                            backgroundColor: [
                                'rgb(255, 99, 132)',
                                'rgb(54, 162, 235)',
                                'rgb(255, 205, 86)',
                                'rgb(75, 192, 192)',
                                'rgb(153, 102, 255)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            } catch (error) {
                console.error('Error loading category chart:', error);
            }
        }

        async loadRecentActivity() {
            try {
                const recentProgress = await this.progressService.getRecentProgress();
                const tbody = document.getElementById('recent-activity');

                tbody.innerHTML = recentProgress.map(activity => `
                    <tr>
                        <td>${new Date(activity.timestamp.seconds * 1000).toLocaleDateString()}</td>
                        <td>${activity.category}</td>
                        <td>${activity.mode}</td>
                        <td>${activity.cardsStudied}</td>
                        <td>${((activity.correctAnswers / activity.cardsStudied) * 100).toFixed(1)}%</td>
                        <td>${this.progressService.formatDuration(activity.duration)}</td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Error loading recent activity:', error);
            }
        }

        aggregateDailyProgress(progress) {
            const dailyMap = new Map();

            progress.forEach(session => {
                const date = new Date(session.timestamp.seconds * 1000)
                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                if (!dailyMap.has(date)) {
                    dailyMap.set(date, { cardsStudied: 0 });
                }
                
                const daily = dailyMap.get(date);
                daily.cardsStudied += session.cardsStudied;
            });

            return Array.from(dailyMap.entries())
                .map(([date, data]) => ({
                    date,
                    ...data
                }))
                .reverse();
        }
    }

    // Initialize dashboard
    new ProgressDashboard();
</script>
