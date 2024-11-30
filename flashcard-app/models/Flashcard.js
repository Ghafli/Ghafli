const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    word: {
        type: String,
        required: true,
        trim: true
    },
    definition: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastReviewed: {
        type: Date
    },
    reviewCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Flashcard', flashcardSchema);
