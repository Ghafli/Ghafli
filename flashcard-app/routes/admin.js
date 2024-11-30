const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();

// In-memory storage for admin (in production, this should be in a database)
const adminUser = {
    email: 'admin@example.com',
    password: '$2b$10$YourHashedPasswordHere', // This will be set when we create the admin
    isAdmin: true
};

// Create default admin user on startup
(async () => {
    adminUser.password = await bcrypt.hash('admin123', 10);
})();

// Admin Authentication Middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, 'your-secret-key'); // Use environment variable in production
        if (!decoded.isAdmin) {
            return res.status(403).json({ message: 'Not authorized as admin' });
        }
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Admin Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (email !== adminUser.email) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    try {
        const isValid = await bcrypt.compare(password, adminUser.password);
        
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { email: adminUser.email, isAdmin: true },
            'your-secret-key', // Use environment variable in production
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify admin token
router.get('/verify', authenticateAdmin, (req, res) => {
    res.json({ message: 'Valid admin token' });
});

// Get all users
router.get('/users', authenticateAdmin, (req, res) => {
    // In production, fetch from database
    const users = Array.from(store.users.values());
    res.json(users);
});

// Delete user
router.delete('/users/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    if (store.users.delete(id)) {
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Get all categories
router.get('/categories', authenticateAdmin, (req, res) => {
    const categories = Array.from(store.categories.values());
    res.json(categories);
});

// Create category
router.post('/categories', authenticateAdmin, (req, res) => {
    const { name, description } = req.body;
    
    const category = {
        id: Date.now().toString(),
        name,
        description,
        createdAt: new Date(),
        flashcardsCount: 0
    };

    store.categories.set(category.id, category);
    res.status(201).json(category);
});

// Delete category
router.delete('/categories/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    
    if (store.categories.delete(id)) {
        res.json({ message: 'Category deleted successfully' });
    } else {
        res.status(404).json({ message: 'Category not found' });
    }
});

// Get all flashcards
router.get('/flashcards', authenticateAdmin, (req, res) => {
    const flashcards = Array.from(store.flashcards.values()).map(flashcard => {
        const category = store.categories.get(flashcard.category);
        return {
            ...flashcard,
            category: category ? { id: category.id, name: category.name } : null
        };
    });
    res.json(flashcards);
});

// Get single flashcard
router.get('/flashcards/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const flashcard = store.flashcards.get(id);
    
    if (!flashcard) {
        return res.status(404).json({ message: 'Flashcard not found' });
    }

    const category = store.categories.get(flashcard.category);
    res.json({
        ...flashcard,
        category: category ? { id: category.id, name: category.name } : null
    });
});

// Create flashcard
router.post('/flashcards', authenticateAdmin, (req, res) => {
    const { word, definition, category } = req.body;
    
    if (!store.categories.has(category)) {
        return res.status(400).json({ message: 'Invalid category' });
    }

    const flashcard = {
        id: Date.now().toString(),
        word,
        definition,
        category,
        createdAt: new Date()
    };

    store.flashcards.set(flashcard.id, flashcard);
    
    // Update category flashcard count
    const categoryData = store.categories.get(category);
    categoryData.flashcardsCount = (categoryData.flashcardsCount || 0) + 1;
    store.categories.set(category, categoryData);

    res.status(201).json(flashcard);
});

// Update flashcard
router.put('/flashcards/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { word, definition, category } = req.body;
    
    const flashcard = store.flashcards.get(id);
    if (!flashcard) {
        return res.status(404).json({ message: 'Flashcard not found' });
    }

    if (!store.categories.has(category)) {
        return res.status(400).json({ message: 'Invalid category' });
    }

    // Update category counts if category changed
    if (flashcard.category !== category) {
        const oldCategory = store.categories.get(flashcard.category);
        const newCategory = store.categories.get(category);
        
        oldCategory.flashcardsCount--;
        newCategory.flashcardsCount = (newCategory.flashcardsCount || 0) + 1;
        
        store.categories.set(flashcard.category, oldCategory);
        store.categories.set(category, newCategory);
    }

    const updatedFlashcard = {
        ...flashcard,
        word,
        definition,
        category,
        updatedAt: new Date()
    };

    store.flashcards.set(id, updatedFlashcard);
    res.json(updatedFlashcard);
});

// Delete flashcard
router.delete('/flashcards/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const flashcard = store.flashcards.get(id);
    
    if (!flashcard) {
        return res.status(404).json({ message: 'Flashcard not found' });
    }

    // Update category flashcard count
    const category = store.categories.get(flashcard.category);
    if (category) {
        category.flashcardsCount--;
        store.categories.set(flashcard.category, category);
    }

    store.flashcards.delete(id);
    res.json({ message: 'Flashcard deleted successfully' });
});

module.exports = router;
