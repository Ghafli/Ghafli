<div class="container py-5">
    <!-- Hero Section -->
    <div class="row align-items-center mb-5">
        <div class="col-md-6">
            <h1 class="display-4 mb-3">Master Any Subject with Smart Flashcards</h1>
            <p class="lead mb-4">Use our scientifically proven spaced repetition system to learn more effectively and retain information longer.</p>
            <?php if (!$this->getCurrentUser()): ?>
                <div class="d-grid gap-2 d-md-flex">
                    <a href="/register" class="btn btn-primary btn-lg px-4">Get Started</a>
                    <a href="/login" class="btn btn-outline-secondary btn-lg px-4">Login</a>
                </div>
            <?php endif; ?>
        </div>
        <div class="col-md-6">
            <img src="/assets/images/hero-image.svg" alt="Learning illustration" class="img-fluid">
        </div>
    </div>

    <?php if ($this->getCurrentUser()): ?>
        <!-- Study Modes -->
        <section class="mb-5">
            <h2 class="mb-4">Choose Your Study Mode</h2>
            <div class="row row-cols-1 row-cols-md-4 g-4">
                <div class="col">
                    <div class="study-mode-card card h-100" data-mode="flashcards">
                        <div class="card-body text-center">
                            <i class="bi bi-card-text icon mb-3"></i>
                            <h5 class="card-title">Flashcards</h5>
                            <p class="card-text">Classic flashcard review with spaced repetition.</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="study-mode-card card h-100" data-mode="writing">
                        <div class="card-body text-center">
                            <i class="bi bi-pencil-square icon mb-3"></i>
                            <h5 class="card-title">Writing Mode</h5>
                            <p class="card-text">Practice active recall by typing answers.</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="study-mode-card card h-100" data-mode="quiz">
                        <div class="card-body text-center">
                            <i class="bi bi-check-circle icon mb-3"></i>
                            <h5 class="card-title">Quiz Mode</h5>
                            <p class="card-text">Test yourself with multiple choice questions.</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="study-mode-card card h-100" data-mode="matching">
                        <div class="card-body text-center">
                            <i class="bi bi-grid-3x3 icon mb-3"></i>
                            <h5 class="card-title">Matching</h5>
                            <p class="card-text">Match pairs of related cards.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Progress Overview -->
        <section class="mb-5">
            <h2 class="mb-4">Your Progress</h2>
            <div class="row">
                <div class="col-md-8">
                    <div class="progress-card">
                        <h5>Learning Streak</h5>
                        <div class="d-flex align-items-center mb-3">
                            <i class="bi bi-fire text-warning me-2"></i>
                            <span class="h3 mb-0"><?php echo $streak ?? 0; ?> days</span>
                        </div>
                        <canvas id="progress-chart"></canvas>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="progress-card">
                        <h5>Quick Stats</h5>
                        <ul class="list-unstyled">
                            <li class="mb-3">
                                <div class="d-flex justify-content-between">
                                    <span>Cards to Review</span>
                                    <strong><?php echo $cardsToReview ?? 0; ?></strong>
                                </div>
                            </li>
                            <li class="mb-3">
                                <div class="d-flex justify-content-between">
                                    <span>Cards Mastered</span>
                                    <strong><?php echo $cardsMastered ?? 0; ?></strong>
                                </div>
                            </li>
                            <li>
                                <div class="d-flex justify-content-between">
                                    <span>Total Study Time</span>
                                    <strong><?php echo $totalStudyTime ?? '0h'; ?></strong>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    <?php else: ?>
        <!-- Features Section -->
        <section class="py-5">
            <h2 class="text-center mb-5">Why Choose Our Flashcard App?</h2>
            <div class="row row-cols-1 row-cols-md-3 g-4">
                <div class="col">
                    <div class="card h-100 border-0">
                        <div class="card-body text-center">
                            <i class="bi bi-graph-up text-primary display-4 mb-3"></i>
                            <h5 class="card-title">Smart Learning Algorithm</h5>
                            <p class="card-text">Our spaced repetition system adapts to your learning pace.</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 border-0">
                        <div class="card-body text-center">
                            <i class="bi bi-laptop text-primary display-4 mb-3"></i>
                            <h5 class="card-title">Multiple Study Modes</h5>
                            <p class="card-text">Choose from flashcards, writing, quiz, or matching modes.</p>
                        </div>
                    </div>
                </div>
                <div class="col">
                    <div class="card h-100 border-0">
                        <div class="card-body text-center">
                            <i class="bi bi-clock-history text-primary display-4 mb-3"></i>
                            <h5 class="card-title">Progress Tracking</h5>
                            <p class="card-text">Monitor your learning with detailed statistics and insights.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    <?php endif; ?>
</div>
