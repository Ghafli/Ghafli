class ValidationService {
    /**
     * Validate flashcard data
     * @param {Object} data - Flashcard data
     * @returns {Object} - Validation result
     */
    validateFlashcard(data) {
        const errors = {};

        // Validate front content
        if (!data.front?.trim()) {
            errors.front = 'Front content is required';
        } else if (data.front.length > 1000) {
            errors.front = 'Front content cannot exceed 1000 characters';
        }

        // Validate back content
        if (!data.back?.trim()) {
            errors.back = 'Back content is required';
        } else if (data.back.length > 1000) {
            errors.back = 'Back content cannot exceed 1000 characters';
        }

        // Validate deck ID
        if (!data.deckId) {
            errors.deckId = 'Deck is required';
        } else if (!/^[a-zA-Z0-9-_]+$/.test(data.deckId)) {
            errors.deckId = 'Invalid deck ID format';
        }

        // Validate tags
        if (data.tags) {
            if (!Array.isArray(data.tags)) {
                errors.tags = 'Tags must be an array';
            } else if (data.tags.length > 10) {
                errors.tags = 'Maximum 10 tags allowed';
            } else {
                const invalidTags = data.tags.filter(tag => 
                    typeof tag !== 'string' || 
                    tag.length > 20 || 
                    !/^[a-zA-Z0-9-_]+$/.test(tag)
                );
                if (invalidTags.length > 0) {
                    errors.tags = 'Invalid tag format';
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Sanitize HTML content
     * @param {string} html - HTML content
     * @returns {string} - Sanitized HTML
     */
    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.innerHTML = html;

        // Remove script tags
        const scripts = div.getElementsByTagName('script');
        while (scripts[0]) {
            scripts[0].parentNode.removeChild(scripts[0]);
        }

        // Remove onclick attributes
        const elements = div.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const attrs = element.attributes;
            for (let j = attrs.length - 1; j >= 0; j--) {
                const attr = attrs[j];
                if (attr.name.startsWith('on')) {
                    element.removeAttribute(attr.name);
                }
            }
        }

        return div.innerHTML;
    }

    /**
     * Validate user input
     * @param {Object} data - User input data
     * @returns {Object} - Validation result
     */
    validateUserInput(data) {
        const errors = {};

        // Validate email
        if (data.email) {
            const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            if (!emailRegex.test(data.email)) {
                errors.email = 'Invalid email format';
            }
        }

        // Validate username
        if (data.username) {
            if (data.username.length < 3 || data.username.length > 30) {
                errors.username = 'Username must be between 3 and 30 characters';
            } else if (!/^[a-zA-Z0-9-_]+$/.test(data.username)) {
                errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
            }
        }

        // Validate password
        if (data.password) {
            const passwordErrors = [];
            if (data.password.length < 8) {
                passwordErrors.push('at least 8 characters');
            }
            if (!/[A-Z]/.test(data.password)) {
                passwordErrors.push('one uppercase letter');
            }
            if (!/[a-z]/.test(data.password)) {
                passwordErrors.push('one lowercase letter');
            }
            if (!/[0-9]/.test(data.password)) {
                passwordErrors.push('one number');
            }
            if (!/[^A-Za-z0-9]/.test(data.password)) {
                passwordErrors.push('one special character');
            }
            if (passwordErrors.length > 0) {
                errors.password = `Password must contain ${passwordErrors.join(', ')}`;
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Validate file upload
     * @param {File} file - File object
     * @returns {Object} - Validation result
     */
    validateFileUpload(file) {
        const errors = {};
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            errors.type = 'Invalid file type. Only JPEG, PNG, and GIF are allowed';
        }

        if (file.size > maxSize) {
            errors.size = 'File size exceeds maximum limit of 5MB';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Validate search query
     * @param {string} query - Search query
     * @returns {string} - Sanitized query
     */
    sanitizeSearchQuery(query) {
        // Remove special characters and HTML tags
        return query
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['";\-]/g, '') // Remove potential SQL injection characters
            .trim();
    }

    /**
     * Validate study progress data
     * @param {Object} data - Progress data
     * @returns {Object} - Validation result
     */
    validateStudyProgress(data) {
        const errors = {};

        if (!data.cardId) {
            errors.cardId = 'Card ID is required';
        }

        if (typeof data.quality !== 'number' || data.quality < 0 || data.quality > 5) {
            errors.quality = 'Quality must be between 0 and 5';
        }

        if (typeof data.easeFactor !== 'number' || data.easeFactor < 1.3 || data.easeFactor > 2.5) {
            errors.easeFactor = 'Invalid ease factor';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

export default ValidationService;
