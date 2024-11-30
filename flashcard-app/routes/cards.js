const express = require('express');
const router = express.Router();
const Flashcard = require('../models/Flashcard');
const auth = require('../middleware/auth');

// Get all flashcards for a user
router.get('/', auth, async (req, res) => {
    try {
        const cards = await Flashcard.find({ user: req.user.userId })
            .populate('category');
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flashcards' });
    }
});

// Get flashcards by category
router.get('/category/:categoryId', auth, async (req, res) => {
    try {
        const cards = await Flashcard.find({
            user: req.user.userId,
            category: req.params.categoryId
        }).populate('category');
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flashcards' });
    }
});

// Create new flashcard
router.post('/', auth, async (req, res) => {
    try {
        const { word, definition, categoryId } = req.body;
        const card = new Flashcard({
            word,
            definition,
            category: categoryId,
            user: req.user.userId
        });
        await card.save();
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ message: 'Error creating flashcard' });
    }
});

// Update flashcard
router.put('/:id', auth, async (req, res) => {
    try {
        const { word, definition, categoryId } = req.body;
        const card = await Flashcard.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { word, definition, category: categoryId },
            { new: true }
        );
        if (!card) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(500).json({ message: 'Error updating flashcard' });
    }
});

// Delete flashcard
router.delete('/:id', auth, async (req, res) => {
    try {
        const card = await Flashcard.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });
        if (!card) {
            return res.status(404).json({ message: 'Flashcard not found' });
        }
        res.json({ message: 'Flashcard deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting flashcard' });
    }
});

module.exports = router;
