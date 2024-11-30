// Check if user is authenticated as admin
function checkAdminAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = '/admin/login.html';
        return;
    }

    fetch('http://localhost:5000/api/admin/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Not authorized');
        }
        return response.json();
    })
    .then(data => {
        loadDashboard();
    })
    .catch(error => {
        console.error('Auth error:', error);
        window.location.href = '/admin/login.html';
    });
}

// Load admin dashboard data
async function loadDashboard() {
    try {
        const token = localStorage.getItem('adminToken');
        const [usersResponse, categoriesResponse, flashcardsResponse] = await Promise.all([
            fetch('http://localhost:5000/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:5000/api/admin/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:5000/api/admin/flashcards', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const [users, categories, flashcards] = await Promise.all([
            usersResponse.json(),
            categoriesResponse.json(),
            flashcardsResponse.json()
        ]);

        updateDashboardStats(users, categories, flashcards);
        displayUsers(users);
        displayCategories(categories);
        displayFlashcards(flashcards);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Error loading dashboard data');
    }
}

// Update dashboard statistics
function updateDashboardStats(users, categories, flashcards) {
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('totalFlashcards').textContent = flashcards.length;
}

// Display users in table
function displayUsers(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Display categories in table
function displayCategories(categories) {
    const tbody = document.querySelector('#categoriesTable tbody');
    if (!tbody) return;

    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.description || '-'}</td>
            <td>${category.flashcardsCount || 0}</td>
            <td>
                <button onclick="editCategory('${category._id}')" class="edit-btn">Edit</button>
                <button onclick="deleteCategory('${category._id}')" class="delete-btn">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Display flashcards in table
function displayFlashcards(flashcards) {
    const tbody = document.querySelector('#flashcardsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = flashcards.map(flashcard => `
        <tr>
            <td>${flashcard.word}</td>
            <td>${flashcard.definition}</td>
            <td>${flashcard.category ? flashcard.category.name : '-'}</td>
            <td>
                <button onclick="editFlashcard('${flashcard._id}')" class="edit-btn">Edit</button>
                <button onclick="deleteFlashcard('${flashcard._id}')" class="delete-btn">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Add new flashcard
async function addFlashcard(event) {
    event.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    const formData = {
        word: document.getElementById('flashcardWord').value,
        definition: document.getElementById('flashcardDefinition').value,
        category: document.getElementById('flashcardCategory').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/admin/flashcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to add flashcard');
        }

        document.getElementById('addFlashcardForm').reset();
        document.getElementById('addFlashcardModal').classList.remove('show');
        loadDashboard();
        alert('Flashcard added successfully!');
    } catch (error) {
        console.error('Error adding flashcard:', error);
        alert('Error adding flashcard');
    }
}

// Edit flashcard
async function editFlashcard(id) {
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`http://localhost:5000/api/admin/flashcards/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const flashcard = await response.json();
        
        document.getElementById('editFlashcardId').value = flashcard._id;
        document.getElementById('editFlashcardWord').value = flashcard.word;
        document.getElementById('editFlashcardDefinition').value = flashcard.definition;
        document.getElementById('editFlashcardCategory').value = flashcard.category._id;
        
        document.getElementById('editFlashcardModal').classList.add('show');
    } catch (error) {
        console.error('Error loading flashcard:', error);
        alert('Error loading flashcard details');
    }
}

// Update flashcard
async function updateFlashcard(event) {
    event.preventDefault();
    const token = localStorage.getItem('adminToken');
    const id = document.getElementById('editFlashcardId').value;
    
    const formData = {
        word: document.getElementById('editFlashcardWord').value,
        definition: document.getElementById('editFlashcardDefinition').value,
        category: document.getElementById('editFlashcardCategory').value
    };

    try {
        const response = await fetch(`http://localhost:5000/api/admin/flashcards/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to update flashcard');
        }

        document.getElementById('editFlashcardModal').classList.remove('show');
        loadDashboard();
        alert('Flashcard updated successfully!');
    } catch (error) {
        console.error('Error updating flashcard:', error);
        alert('Error updating flashcard');
    }
}

// Delete flashcard
async function deleteFlashcard(id) {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
        return;
    }

    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`http://localhost:5000/api/admin/flashcards/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete flashcard');
        }

        loadDashboard();
        alert('Flashcard deleted successfully!');
    } catch (error) {
        console.error('Error deleting flashcard:', error);
        alert('Error deleting flashcard');
    }
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        loadDashboard();
        alert('User deleted successfully!');
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    
    // Add event listeners for modals
    const addFlashcardForm = document.getElementById('addFlashcardForm');
    const editFlashcardForm = document.getElementById('editFlashcardForm');
    
    if (addFlashcardForm) {
        addFlashcardForm.addEventListener('submit', addFlashcard);
    }
    
    if (editFlashcardForm) {
        editFlashcardForm.addEventListener('submit', updateFlashcard);
    }

    // Modal close buttons
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    });
});
