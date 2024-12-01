<?php

namespace App\Services;

use InvalidArgumentException;

class ValidationService
{
    /**
     * Sanitize and validate flashcard data
     * @param array $data Flashcard data
     * @return array Sanitized data
     * @throws InvalidArgumentException
     */
    public function validateFlashcard(array $data): array
    {
        $sanitized = [];

        // Required fields
        $requiredFields = ['front', 'back', 'deckId'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                throw new InvalidArgumentException("Missing required field: {$field}");
            }
        }

        // Sanitize and validate front content
        $sanitized['front'] = $this->sanitizeHtml($data['front']);
        if (strlen($sanitized['front']) > 1000) {
            throw new InvalidArgumentException('Front content exceeds maximum length of 1000 characters');
        }

        // Sanitize and validate back content
        $sanitized['back'] = $this->sanitizeHtml($data['back']);
        if (strlen($sanitized['back']) > 1000) {
            throw new InvalidArgumentException('Back content exceeds maximum length of 1000 characters');
        }

        // Validate deckId format
        $sanitized['deckId'] = $this->sanitizeAlphanumeric($data['deckId']);
        if (!preg_match('/^[a-zA-Z0-9-_]+$/', $sanitized['deckId'])) {
            throw new InvalidArgumentException('Invalid deck ID format');
        }

        // Optional fields
        if (isset($data['tags'])) {
            $sanitized['tags'] = $this->validateTags($data['tags']);
        }

        if (isset($data['difficulty'])) {
            $sanitized['difficulty'] = $this->validateDifficulty($data['difficulty']);
        }

        if (isset($data['category'])) {
            $sanitized['category'] = $this->sanitizeAlphanumeric($data['category']);
        }

        return $sanitized;
    }

    /**
     * Validate user input data
     * @param array $data User data
     * @return array Sanitized data
     * @throws InvalidArgumentException
     */
    public function validateUserInput(array $data): array
    {
        $sanitized = [];

        // Validate email
        if (isset($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException('Invalid email format');
            }
            $sanitized['email'] = $data['email'];
        }

        // Validate username
        if (isset($data['username'])) {
            $username = $this->sanitizeAlphanumeric($data['username']);
            if (strlen($username) < 3 || strlen($username) > 30) {
                throw new InvalidArgumentException('Username must be between 3 and 30 characters');
            }
            $sanitized['username'] = $username;
        }

        // Validate password strength
        if (isset($data['password'])) {
            $this->validatePasswordStrength($data['password']);
            $sanitized['password'] = $data['password'];
        }

        return $sanitized;
    }

    /**
     * Sanitize HTML content
     * @param string $html HTML content
     * @return string Sanitized HTML
     */
    private function sanitizeHtml(string $html): string
    {
        // Remove all HTML tags except allowed ones
        $allowedTags = '<p><br><strong><em><ul><ol><li><code>';
        $html = strip_tags($html, $allowedTags);

        // Convert special characters to HTML entities
        $html = htmlspecialchars($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Remove potential script injections
        $html = preg_replace('/javascript:/i', '', $html);
        $html = preg_replace('/on\w+=/i', '', $html);
        
        return trim($html);
    }

    /**
     * Sanitize alphanumeric string
     * @param string $input Input string
     * @return string Sanitized string
     */
    private function sanitizeAlphanumeric(string $input): string
    {
        return preg_replace('/[^a-zA-Z0-9-_]/', '', $input);
    }

    /**
     * Validate tags array
     * @param array $tags Tags array
     * @return array Validated tags
     * @throws InvalidArgumentException
     */
    private function validateTags(array $tags): array
    {
        if (count($tags) > 10) {
            throw new InvalidArgumentException('Maximum 10 tags allowed');
        }

        return array_map(function($tag) {
            $tag = $this->sanitizeAlphanumeric($tag);
            if (strlen($tag) > 20) {
                throw new InvalidArgumentException('Tag length cannot exceed 20 characters');
            }
            return $tag;
        }, $tags);
    }

    /**
     * Validate difficulty level
     * @param mixed $difficulty Difficulty level
     * @return int Validated difficulty
     * @throws InvalidArgumentException
     */
    private function validateDifficulty($difficulty): int
    {
        $difficulty = filter_var($difficulty, FILTER_VALIDATE_INT);
        if ($difficulty === false || $difficulty < 1 || $difficulty > 5) {
            throw new InvalidArgumentException('Difficulty must be between 1 and 5');
        }
        return $difficulty;
    }

    /**
     * Validate password strength
     * @param string $password Password string
     * @throws InvalidArgumentException
     */
    private function validatePasswordStrength(string $password): void
    {
        if (strlen($password) < 8) {
            throw new InvalidArgumentException('Password must be at least 8 characters long');
        }

        if (!preg_match('/[A-Z]/', $password)) {
            throw new InvalidArgumentException('Password must contain at least one uppercase letter');
        }

        if (!preg_match('/[a-z]/', $password)) {
            throw new InvalidArgumentException('Password must contain at least one lowercase letter');
        }

        if (!preg_match('/[0-9]/', $password)) {
            throw new InvalidArgumentException('Password must contain at least one number');
        }

        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            throw new InvalidArgumentException('Password must contain at least one special character');
        }
    }

    /**
     * Validate and sanitize search query
     * @param string $query Search query
     * @return string Sanitized query
     */
    public function sanitizeSearchQuery(string $query): string
    {
        // Remove any potential SQL injection patterns
        $query = str_replace(['\'', '"', ';', '--'], '', $query);
        
        // Remove any HTML tags
        $query = strip_tags($query);
        
        // Convert special characters to HTML entities
        $query = htmlspecialchars($query, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        return trim($query);
    }

    /**
     * Validate file upload
     * @param array $file File data
     * @return bool Validation result
     * @throws InvalidArgumentException
     */
    public function validateFileUpload(array $file): bool
    {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $maxSize = 5 * 1024 * 1024; // 5MB

        if (!isset($file['type']) || !in_array($file['type'], $allowedTypes)) {
            throw new InvalidArgumentException('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        }

        if (!isset($file['size']) || $file['size'] > $maxSize) {
            throw new InvalidArgumentException('File size exceeds maximum limit of 5MB');
        }

        if (!isset($file['error']) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new InvalidArgumentException('File upload failed');
        }

        return true;
    }
}
