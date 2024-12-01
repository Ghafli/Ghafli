// Theme Management
const themeToggle = {
    init() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
        this.applyTheme();
    },

    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        this.applyTheme();
    },

    applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
    }
};

// Flashcard Management
const flashcardManager = {
    init() {
        const flashcards = document.querySelectorAll('.flashcard');
        flashcards.forEach(card => {
            card.addEventListener('click', () => this.flipCard(card));
        });
    },

    flipCard(card) {
        const inner = card.querySelector('.card-inner');
        inner.classList.toggle('flipped');
    }
};

// Progress Chart
const progressChart = {
    init() {
        const ctx = document.getElementById('progress-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.getLastSevenDays(),
                datasets: [{
                    label: 'Cards Reviewed',
                    data: [], // This should be populated with actual data
                    borderColor: getComputedStyle(document.documentElement)
                        .getPropertyValue('--primary-color'),
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
    },

    getLastSevenDays() {
        return Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        }).reverse();
    }
};

// Form Validation
const formValidator = {
    init() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.validateForm(e, form));
        });
    },

    validateForm(e, form) {
        if (!form.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
        }
        form.classList.add('was-validated');
    }
};

// Study Mode Selection
const studyModeSelector = {
    init() {
        const modes = document.querySelectorAll('.study-mode-card');
        modes.forEach(mode => {
            mode.addEventListener('click', () => this.selectMode(mode));
        });
    },

    selectMode(mode) {
        const modeType = mode.dataset.mode;
        window.location.href = `/study/${modeType}`;
    }
};

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    themeToggle.init();
    flashcardManager.init();
    progressChart.init();
    formValidator.init();
    studyModeSelector.init();
});
