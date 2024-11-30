// API URL
const API_URL = 'http://localhost:5000/api';

// State management
let currentUser = null;
let token = localStorage.getItem('token');
let categories = [];
let flashcards = [];
let currentCardIndex = 0;
let currentCategory = null;

// DOM Elements
const authForms = document.getElementById('authForms');
const mainContent = document.getElementById('mainContent');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const profileBtn = document.getElementById('profileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const categorySelect = document.getElementById('categorySelect');
const flashcard = document.getElementById('flashcard');
const wordDisplay = document.querySelector('.word');
const definitionDisplay = document.querySelector('.definition');
const addCategoryModal = document.getElementById('addCategoryModal');
const addFlashcardModal = document.getElementById('addFlashcardModal');
const categoriesList = document.getElementById('categoriesList');
const flashcardContainer = document.getElementById('flashcardContainer');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
if (loginBtn) loginBtn.addEventListener('click', () => showAuthForm('login'));
if (registerBtn) registerBtn.addEventListener('click', () => showAuthForm('register'));
if (profileBtn) profileBtn.addEventListener('click', showProfile);
if (logoutBtn) logoutBtn.addEventListener('click', logout);

// Prevent form submission and handle authentication
if (loginForm) loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    login();
});

if (registerForm) registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    register();
});

if (document.getElementById('submitLogin')) document.getElementById('submitLogin').addEventListener('click', login);
if (document.getElementById('submitRegister')) document.getElementById('submitRegister').addEventListener('click', register);
if (document.getElementById('addCategory')) document.getElementById('addCategory').addEventListener('click', showCategoryModal);
if (document.getElementById('saveCategory')) document.getElementById('saveCategory').addEventListener('click', createCategory);
if (document.getElementById('addCard')) document.getElementById('addCard').addEventListener('click', showCardModal);
if (document.getElementById('saveCard')) document.getElementById('saveCard').addEventListener('click', createFlashcard);
if (document.getElementById('startStudy')) document.getElementById('startStudy').addEventListener('click', startStudying);
if (document.getElementById('prev')) document.getElementById('prev').addEventListener('click', showPreviousCard);
if (document.getElementById('next')) document.getElementById('next').addEventListener('click', showNextCard);
if (document.getElementById('flip')) document.getElementById('flip').addEventListener('click', flipCard);
if (categorySelect) categorySelect.addEventListener('change', handleCategoryChange);

// Close modals
document.querySelectorAll('.closeModal').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    });
});

// Initialize app
async function initializeApp() {
    if (token) {
        try {
            await fetchUserProfile();
            showAuthenticatedUI();
            await fetchCategories();
            await fetchFlashcards();
        } catch (error) {
            console.error('Error initializing app:', error);
            logout();
        }
    } else {
        showUnauthenticatedUI();
    }
}

// Show error message
function showError(message, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error messages
    const existingError = container.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    container.insertBefore(errorDiv, container.firstChild);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Authentication functions
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('Please fill in all fields', 'loginForm');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            await initializeApp();
        } else {
            showError(data.message || 'Login failed', 'loginForm');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Error connecting to server', 'loginForm');
    }
}

async function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!username || !email || !password) {
        showError('Please fill in all fields', 'registerForm');
        return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address', 'registerForm');
        return;
    }

    // Password validation
    if (password.length < 6) {
        showError('Password must be at least 6 characters long', 'registerForm');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            await initializeApp();
            showAuthenticatedUI();
        } else {
            showError(data.message || 'Registration failed', 'registerForm');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Error connecting to server', 'registerForm');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    showUnauthenticatedUI();
}

// UI State functions
function showAuthForm(type) {
    if (authForms) authForms.classList.remove('hidden');
    if (mainContent) mainContent.classList.add('hidden');
    if (loginForm) loginForm.classList.toggle('hidden', type !== 'login');
    if (registerForm) registerForm.classList.toggle('hidden', type !== 'register');
    if (forgotPasswordForm) forgotPasswordForm.classList.toggle('hidden', type !== 'forgot');
}

function showAuthenticatedUI() {
    if (authForms) authForms.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
    if (loginBtn) loginBtn.classList.add('hidden');
    if (registerBtn) registerBtn.classList.add('hidden');
    if (profileBtn) profileBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
}

function showUnauthenticatedUI() {
    if (authForms) authForms.classList.remove('hidden');
    if (mainContent) mainContent.classList.add('hidden');
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (registerBtn) registerBtn.classList.remove('hidden');
    if (profileBtn) profileBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
}

// Form visibility functions
function showLoginForm() {
    if (document.getElementById('loginForm')) document.getElementById('loginForm').style.display = 'block';
    if (document.getElementById('registerForm')) document.getElementById('registerForm').style.display = 'none';
    if (document.getElementById('forgotPasswordForm')) document.getElementById('forgotPasswordForm').style.display = 'none';
}

function showRegisterForm() {
    if (document.getElementById('loginForm')) document.getElementById('loginForm').style.display = 'none';
    if (document.getElementById('registerForm')) document.getElementById('registerForm').style.display = 'block';
    if (document.getElementById('forgotPasswordForm')) document.getElementById('forgotPasswordForm').style.display = 'none';
}

function showForgotPasswordForm() {
    if (document.getElementById('loginForm')) document.getElementById('loginForm').style.display = 'none';
    if (document.getElementById('registerForm')) document.getElementById('registerForm').style.display = 'none';
    if (document.getElementById('forgotPasswordForm')) document.getElementById('forgotPasswordForm').style.display = 'block';
}

// Handle forgot password submission
if (document.getElementById('forgotPasswordForm')) {
    document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Password reset instructions have been sent to your email.');
                showLoginForm();
            } else {
                alert(data.message || 'Error sending reset instructions');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending reset instructions. Please try again later.');
        }
    });
}

// Category functions
async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        categories = await response.json();
        updateCategorySelects();
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function updateCategorySelects() {
    const selects = [categorySelect, document.getElementById('cardCategory')];
    selects.forEach(select => {
        if (select) {
            select.innerHTML = '<option value="">Select Category</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category._id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        }
    });
}

async function createCategory() {
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;

    try {
        const response = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            await fetchCategories();
            if (document.getElementById('categoryModal')) {
                document.getElementById('categoryModal').classList.remove('show');
            }
        } else {
            alert('Error creating category');
        }
    } catch (error) {
        console.error('Error creating category:', error);
        alert('Error creating category');
    }
}

// Flashcard functions
async function fetchFlashcards(categoryId = '') {
    try {
        const url = categoryId
            ? `${API_URL}/cards/category/${categoryId}`
            : `${API_URL}/cards`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        flashcards = await response.json();
        currentCardIndex = 0;
        if (flashcards.length > 0) {
            showCard(currentCardIndex);
        }
    } catch (error) {
        console.error('Error fetching flashcards:', error);
    }
}

async function createFlashcard() {
    const word = document.getElementById('newWord').value;
    const definition = document.getElementById('newDefinition').value;
    const categoryId = document.getElementById('cardCategory').value;

    if (!categoryId) {
        alert('Please select a category');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ word, definition, categoryId })
        });

        if (response.ok) {
            await fetchFlashcards(currentCategory);
            if (document.getElementById('cardModal')) {
                document.getElementById('cardModal').classList.remove('show');
            }
        } else {
            alert('Error creating flashcard');
        }
    } catch (error) {
        console.error('Error creating flashcard:', error);
        alert('Error creating flashcard');
    }
}

// Study functions
function showCard(index) {
    if (flashcards.length === 0) {
        if (wordDisplay) wordDisplay.textContent = 'No cards available';
        if (definitionDisplay) definitionDisplay.textContent = '';
        return;
    }

    const card = flashcards[index];
    if (wordDisplay) wordDisplay.textContent = card.word;
    if (definitionDisplay) definitionDisplay.textContent = card.definition;
    if (flashcard) flashcard.classList.remove('flipped');
}

function startStudying() {
    if (flashcards.length === 0) {
        alert('Please add some flashcards first!');
        return;
    }
    currentCardIndex = 0;
    showCard(currentCardIndex);
}

function showNextCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    showCard(currentCardIndex);
}

function showPreviousCard() {
    if (flashcards.length === 0) return;
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    showCard(currentCardIndex);
}

function flipCard() {
    if (flashcard) flashcard.classList.toggle('flipped');
}

// Modal functions
function showCategoryModal() {
    if (document.getElementById('categoryModal')) {
        document.getElementById('categoryModal').classList.add('show');
    }
}

function showCardModal() {
    if (document.getElementById('cardModal')) {
        document.getElementById('cardModal').classList.add('show');
    }
}

async function showProfile() {
    const profileModal = document.getElementById('profileModal');
    const profileInfo = document.getElementById('profileInfo');
    const userStats = document.getElementById('userStats');

    try {
        // You would typically fetch this data from your API
        const totalCards = flashcards.length;
        const totalCategories = categories.length;

        if (profileInfo) profileInfo.innerHTML = `
            <p><strong>Username:</strong> ${currentUser.username}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
        `;

        if (userStats) userStats.innerHTML = `
            <h3>Statistics</h3>
            <p>Total Flashcards: ${totalCards}</p>
            <p>Total Categories: ${totalCategories}</p>
        `;

        if (profileModal) profileModal.classList.add('show');
    } catch (error) {
        console.error('Error showing profile:', error);
        alert('Error loading profile');
    }
}

async function handleCategoryChange(event) {
    const categoryId = event.target.value;
    currentCategory = categoryId;
    if (categoryId) {
        await fetchFlashcards(categoryId);
    } else {
        await fetchFlashcards();
    }
}

// Profile functions
async function fetchUserProfile() {
    try {
        // You would typically fetch this from your API
        // For now, we'll use a mock user object
        currentUser = {
            username: 'User',
            email: 'user@example.com'
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Auth State
let userToken = localStorage.getItem('userToken');

// Check Authentication
async function checkAuth() {
    if (userToken) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                showDashboard();
            } else {
                localStorage.removeItem('userToken');
                showLoginForm();
            }
        } catch (error) {
            console.error('Auth error:', error);
            showLoginForm();
        }
    } else {
        showLoginForm();
    }
}

// Form Display Functions
function showLoginForm() {
    if (authForms) authForms.classList.remove('hidden');
    if (mainContent) mainContent.classList.add('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
}

function showRegisterForm() {
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.add('hidden');
}

function showForgotPasswordForm() {
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.add('hidden');
    if (forgotPasswordForm) forgotPasswordForm.classList.remove('hidden');
}

function showDashboard() {
    if (authForms) authForms.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');
    if (profileBtn) profileBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    loadCategories();
}

// Authentication Handlers
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('userToken', data.token);
                userToken = data.token;
                currentUser = data.user;
                showDashboard();
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registration successful! Please login.');
                showLoginForm();
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        }
    });
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('resetEmail').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Password reset instructions have been sent to your email.');
                showLoginForm();
            } else {
                alert(data.message || 'Password reset request failed');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Password reset request failed. Please try again.');
        }
    });
}

// Category Management
async function loadCategories() {
    if (!categoriesList) return;

    try {
        const response = await fetch('http://localhost:5000/api/categories', {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        const categories = await response.json();
        
        categoriesList.innerHTML = categories.map(category => `
            <div class="category-card" onclick="selectCategory('${category.id}')">
                <h3>${category.name}</h3>
                <p>${category.description || ''}</p>
                <div class="category-stats">
                    <span>${category.flashcardsCount || 0} flashcards</span>
                </div>
            </div>
        `).join('');

        // Update category select in flashcard modal
        const categorySelect = document.getElementById('flashcardCategory');
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="">Select Category</option>
                ${categories.map(category => `
                    <option value="${category.id}">${category.name}</option>
                `).join('')}
            `;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('Error loading categories. Please try again.');
    }
}

// Add Category Modal
const addCategoryBtn = document.getElementById('addCategoryBtn');
if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
        if (addCategoryModal) {
            addCategoryModal.classList.add('show');
        }
    });
}

const addCategoryForm = document.getElementById('addCategoryForm');
if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(categoryData)
            });

            const data = await response.json();

            if (response.ok) {
                if (addCategoryModal) {
                    addCategoryModal.classList.remove('show');
                }
                e.target.reset();
                loadCategories();
                alert('Category added successfully!');
            } else {
                alert(data.message || 'Error adding category');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding category. Please try again.');
        }
    });
}

// Close Modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        if (addCategoryModal) addCategoryModal.classList.remove('show');
        if (addFlashcardModal) addFlashcardModal.classList.remove('show');
    });
});

window.addEventListener('click', (e) => {
    if (e.target === addCategoryModal) {
        addCategoryModal.classList.remove('show');
    }
    if (e.target === addFlashcardModal) {
        addFlashcardModal.classList.remove('show');
    }
});

// Flashcard Study Mode
let currentFlashcards = [];
let currentFlashcardIndex = 0;

function selectCategory(categoryId) {
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) {
        categorySelect.value = categoryId;
    }
    loadFlashcards(categoryId);
}

async function loadFlashcards(categoryId) {
    try {
        const response = await fetch(`http://localhost:5000/api/flashcards/category/${categoryId}`, {
            headers: {
                'Authorization': `Bearer ${userToken}`
            }
        });

        currentFlashcards = await response.json();
        
        if (currentFlashcards.length > 0) {
            currentFlashcardIndex = 0;
            if (flashcardContainer) {
                flashcardContainer.classList.remove('hidden');
            }
            displayCurrentFlashcard();
        } else {
            alert('No flashcards in this category yet. Add some flashcards to start studying!');
        }
    } catch (error) {
        console.error('Error loading flashcards:', error);
        alert('Error loading flashcards. Please try again.');
    }
}

function displayCurrentFlashcard() {
    const currentCard = currentFlashcards[currentFlashcardIndex];
    const wordDisplay = document.getElementById('wordDisplay');
    const definitionDisplay = document.getElementById('definitionDisplay');
    
    if (wordDisplay && definitionDisplay && currentCard) {
        wordDisplay.textContent = currentCard.word;
        definitionDisplay.textContent = currentCard.definition;
    }
}

// Flashcard Controls
const flipBtn = document.getElementById('flipBtn');
if (flipBtn && flashcard) {
    flipBtn.addEventListener('click', () => {
        flashcard.classList.toggle('flipped');
    });
}

const prevBtn = document.getElementById('prevBtn');
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        if (currentFlashcardIndex > 0) {
            currentFlashcardIndex--;
            if (flashcard) {
                flashcard.classList.remove('flipped');
            }
            displayCurrentFlashcard();
        }
    });
}

const nextBtn = document.getElementById('nextBtn');
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (currentFlashcardIndex < currentFlashcards.length - 1) {
            currentFlashcardIndex++;
            if (flashcard) {
                flashcard.classList.remove('flipped');
            }
            displayCurrentFlashcard();
        }
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('userToken');
        userToken = null;
        currentUser = null;
        showLoginForm();
    });
}

// Initialize
checkAuth();
