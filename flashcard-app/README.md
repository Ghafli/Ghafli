# Flashcard Learning Application

A full-stack web application for creating and studying flashcards with user authentication and category management.

## Features

- User authentication (register, login, logout)
- User profile with statistics
- Create and manage categories
- Create and manage flashcards within categories
- Study mode with card flipping and navigation
- Modern, responsive UI
- Data persistence with MongoDB

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Modern web browser

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flashcard-app
JWT_SECRET=your-secret-key
```

3. Start MongoDB service (if using local installation)

4. Start the server:
```bash
npm start
```

5. Open `index.html` in your web browser

## Usage

1. Register a new account or login with existing credentials
2. Create categories for your flashcards (e.g., "Spanish Vocabulary", "Math Terms")
3. Add flashcards to your categories
4. Start studying by selecting a category and using the flashcard interface
5. View your progress and statistics in the profile section

## Project Structure

- `index.html`: Main application interface
- `styles.css`: Application styling
- `script.js`: Frontend JavaScript
- `server.js`: Express server setup
- `models/`: MongoDB models
- `routes/`: API routes
- `middleware/`: Custom middleware functions

## API Endpoints

### Authentication
- POST `/api/auth/register`: Register new user
- POST `/api/auth/login`: Login user

### Categories
- GET `/api/categories`: Get all categories for user
- POST `/api/categories`: Create new category
- PUT `/api/categories/:id`: Update category
- DELETE `/api/categories/:id`: Delete category

### Flashcards
- GET `/api/cards`: Get all flashcards
- GET `/api/cards/category/:categoryId`: Get flashcards by category
- POST `/api/cards`: Create new flashcard
- PUT `/api/cards/:id`: Update flashcard
- DELETE `/api/cards/:id`: Delete flashcard

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- CORS enabled
- Input validation

## Contributing

Feel free to submit issues and enhancement requests!
