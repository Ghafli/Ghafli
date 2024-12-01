<div class="container py-5">
    <!-- Study Controls -->
    <div class="row mb-4">
        <div class="col-md-6">
            <select id="category-select" class="form-select mb-2">
                <option value="">Select Category</option>
                <?php foreach ($categories as $category): ?>
                    <option value="<?php echo htmlspecialchars($category); ?>">
                        <?php echo htmlspecialchars($category); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="col-md-6">
            <select id="topic-select" class="form-select mb-2">
                <option value="">Select Topic</option>
                <?php foreach ($topics as $topic): ?>
                    <option value="<?php echo htmlspecialchars($topic); ?>">
                        <?php echo htmlspecialchars($topic); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
    </div>

    <!-- Study Progress -->
    <div class="progress mb-4" style="height: 5px;">
        <div id="study-progress" 
             class="progress-bar" 
             role="progressbar" 
             style="width: 0%" 
             aria-valuenow="0" 
             aria-valuemin="0" 
             aria-valuemax="100">
        </div>
    </div>

    <!-- Flashcard Container -->
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div id="flashcard-container" class="flashcard">
                <!-- Flashcard content will be dynamically inserted here -->
            </div>
        </div>
    </div>

    <!-- Keyboard Shortcuts Help -->
    <div class="row mt-4">
        <div class="col-md-8 mx-auto">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Keyboard Shortcuts</h5>
                    <div class="row">
                        <div class="col-sm-6">
                            <ul class="list-unstyled mb-0">
                                <li><kbd>Space</kbd> Flip card</li>
                                <li><kbd>←</kbd> Previous card</li>
                                <li><kbd>→</kbd> Next card</li>
                            </ul>
                        </div>
                        <div class="col-sm-6">
                            <ul class="list-unstyled mb-0">
                                <li><kbd>1</kbd> Again</li>
                                <li><kbd>2</kbd> Hard</li>
                                <li><kbd>3</kbd> Good</li>
                                <li><kbd>4</kbd> Easy</li>
                                <li><kbd>5</kbd> Perfect</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Initialize Flashcard Study -->
<script type="module">
    import { study } from '/js/components/FlashcardStudy.js';
    
    // Load initial cards if category is pre-selected
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        document.getElementById('category-select').value = category;
        study.loadFlashcardsByCategory(category);
    }
</script>
