<div class="row mb-4">
    <div class="col">
        <h1>My Flashcards</h1>
    </div>
    <div class="col text-end">
        <a href="/flashcards/create" class="btn btn-primary">Create New Card</a>
    </div>
</div>

<div class="row row-cols-1 row-cols-md-3 g-4">
    <?php foreach ($flashcards as $card): ?>
        <div class="col">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title"><?php echo htmlspecialchars($card->getFront()); ?></h5>
                    <p class="card-text"><?php echo htmlspecialchars($card->getBack()); ?></p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-<?php echo $card->getDifficulty() === 'easy' ? 'success' : ($card->getDifficulty() === 'medium' ? 'warning' : 'danger'); ?>">
                            <?php echo ucfirst($card->getDifficulty()); ?>
                        </span>
                        <div class="btn-group">
                            <a href="/flashcards/edit/<?php echo $card->getId(); ?>" class="btn btn-sm btn-outline-secondary">Edit</a>
                            <form action="/flashcards/delete/<?php echo $card->getId(); ?>" method="POST" class="d-inline">
                                <button type="submit" class="btn btn-sm btn-outline-danger" onclick="return confirm('Are you sure?')">Delete</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="card-footer">
                    <small class="text-muted">Category: <?php echo htmlspecialchars($card->getCategory()); ?></small>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>

<?php if (empty($flashcards)): ?>
    <div class="text-center mt-4">
        <p class="lead">You haven't created any flashcards yet.</p>
        <a href="/flashcards/create" class="btn btn-primary">Create Your First Card</a>
    </div>
<?php endif; ?>
