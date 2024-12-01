<div class="row justify-content-center">
    <div class="col-md-8">
        <div class="card">
            <div class="card-header">
                <h2 class="mb-0"><?php echo isset($flashcard) ? 'Edit Flashcard' : 'Create New Flashcard'; ?></h2>
            </div>
            <div class="card-body">
                <form action="<?php echo isset($flashcard) ? '/flashcards/edit/' . $flashcard->getId() : '/flashcards/create'; ?>" method="POST">
                    <div class="mb-3">
                        <label for="front" class="form-label">Front (Question)</label>
                        <textarea class="form-control" id="front" name="front" rows="3" required><?php echo isset($flashcard) ? htmlspecialchars($flashcard->getFront()) : ''; ?></textarea>
                    </div>

                    <div class="mb-3">
                        <label for="back" class="form-label">Back (Answer)</label>
                        <textarea class="form-control" id="back" name="back" rows="3" required><?php echo isset($flashcard) ? htmlspecialchars($flashcard->getBack()) : ''; ?></textarea>
                    </div>

                    <div class="mb-3">
                        <label for="category" class="form-label">Category</label>
                        <select class="form-select" id="category" name="category" required>
                            <option value="">Select a category</option>
                            <option value="general" <?php echo (isset($flashcard) && $flashcard->getCategory() === 'general') ? 'selected' : ''; ?>>General</option>
                            <option value="language" <?php echo (isset($flashcard) && $flashcard->getCategory() === 'language') ? 'selected' : ''; ?>>Language</option>
                            <option value="math" <?php echo (isset($flashcard) && $flashcard->getCategory() === 'math') ? 'selected' : ''; ?>>Math</option>
                            <option value="science" <?php echo (isset($flashcard) && $flashcard->getCategory() === 'science') ? 'selected' : ''; ?>>Science</option>
                            <option value="history" <?php echo (isset($flashcard) && $flashcard->getCategory() === 'history') ? 'selected' : ''; ?>>History</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="difficulty" class="form-label">Difficulty</label>
                        <select class="form-select" id="difficulty" name="difficulty" required>
                            <option value="">Select difficulty</option>
                            <option value="easy" <?php echo (isset($flashcard) && $flashcard->getDifficulty() === 'easy') ? 'selected' : ''; ?>>Easy</option>
                            <option value="medium" <?php echo (isset($flashcard) && $flashcard->getDifficulty() === 'medium') ? 'selected' : ''; ?>>Medium</option>
                            <option value="hard" <?php echo (isset($flashcard) && $flashcard->getDifficulty() === 'hard') ? 'selected' : ''; ?>>Hard</option>
                        </select>
                    </div>

                    <div class="d-flex justify-content-between">
                        <a href="/flashcards" class="btn btn-secondary">Cancel</a>
                        <button type="submit" class="btn btn-primary"><?php echo isset($flashcard) ? 'Update' : 'Create'; ?> Flashcard</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
