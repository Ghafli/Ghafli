const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all categories for a user
router.get('/', auth, async (req, res) => {
    try {
        const categories = await Category.find({ user: req.user.userId });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Create new category
router.post('/', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = new Category({
            name,
            description,
            user: req.user.userId
        });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category' });
    }
});

// Update category
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { name, description },
            { new: true }
        );
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error updating category' });
    }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category' });
    }
});

module.exports = router;
