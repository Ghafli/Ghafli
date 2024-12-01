<div class="row justify-content-center">
    <div class="col-md-8">
        <?php if (empty($cards)): ?>
            <div class="text-center">
                <h2>No Cards Due for Review</h2>
                <p class="lead">Great job! You've reviewed all your cards for now.</p>
                <a href="/flashcards" class="btn btn-primary">Back to My Cards</a>
            </div>
        <?php else: ?>
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h2 class="mb-0">Review Cards</h2>
                    <span class="badge bg-primary"><?php echo count($cards); ?> cards remaining</span>
                </div>
                <div class="card-body">
                    <div id="flashcard" class="mb-4" style="min-height: 200px;">
                        <div id="card-front" class="text-center">
                            <h3><?php echo htmlspecialchars($cards[0]->getFront()); ?></h3>
                        </div>
                        <div id="card-back" class="text-center d-none">
                            <h3><?php echo htmlspecialchars($cards[0]->getBack()); ?></h3>
                        </div>
                    </div>

                    <div class="text-center mb-4">
                        <button id="flip-card" class="btn btn-secondary">Show Answer</button>
                    </div>

                    <form id="progress-form" action="/flashcards/progress" method="POST" class="d-none">
                        <input type="hidden" name="card_id" value="<?php echo $cards[0]->getId(); ?>">
                        
                        <div class="text-center">
                            <p class="mb-3">How well did you know this?</p>
                            <div class="btn-group">
                                <button type="submit" name="quality" value="0" class="btn btn-danger">Failed</button>
                                <button type="submit" name="quality" value="3" class="btn btn-warning">Hard</button>
                                <button type="submit" name="quality" value="4" class="btn btn-info">Good</button>
                                <button type="submit" name="quality" value="5" class="btn btn-success">Easy</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<script>
document.getElementById('flip-card').addEventListener('click', function() {
    document.getElementById('card-front').classList.toggle('d-none');
    document.getElementById('card-back').classList.toggle('d-none');
    document.getElementById('progress-form').classList.toggle('d-none');
    this.classList.add('d-none');
});
</script>
