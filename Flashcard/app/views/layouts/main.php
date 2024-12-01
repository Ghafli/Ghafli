<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flashcard App</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="/css/app.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container">
            <a class="navbar-brand" href="/">Flashcard App</a>
            <?php if ($this->getCurrentUser()): ?>
                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="/flashcards">My Cards</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/flashcards/review">Review</a>
                        </li>
                    </ul>
                    <form action="/logout" method="POST" class="d-flex">
                        <button class="btn btn-outline-light" type="submit">Logout</button>
                    </form>
                </div>
            <?php endif; ?>
        </div>
    </nav>

    <main class="container py-4">
        <?php echo $content; ?>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="/js/app.js"></script>
</body>
</html>
