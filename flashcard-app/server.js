const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Categories API
const categories = new Map();

app.get('/api/categories', (req, res) => {
    const categoriesArray = Array.from(categories.values());
    res.json(categoriesArray);
});

app.post('/api/categories', (req, res) => {
    const { name, description } = req.body;
    const id = Date.now().toString();
    const category = {
        id,
        name,
        description,
        flashcardsCount: 0,
        createdAt: new Date()
    };
    categories.set(id, category);
    res.status(201).json(category);
});

// Flashcards API
const flashcards = new Map();

app.get('/api/flashcards/category/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    const categoryFlashcards = Array.from(flashcards.values())
        .filter(card => card.categoryId === categoryId);
    res.json(categoryFlashcards);
});

app.post('/api/flashcards', (req, res) => {
    const { categoryId, word, definition } = req.body;
    const id = Date.now().toString();
    const flashcard = {
        id,
        categoryId,
        word,
        definition,
        createdAt: new Date()
    };
    flashcards.set(id, flashcard);
    
    // Update category flashcard count
    const category = categories.get(categoryId);
    if (category) {
        category.flashcardsCount = (category.flashcardsCount || 0) + 1;
        categories.set(categoryId, category);
    }
    
    res.status(201).json(flashcard);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});
