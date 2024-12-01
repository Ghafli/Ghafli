# Contributing to Flashcard App

Thank you for your interest in contributing to our Flashcard App! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Pull Request Process](#pull-request-process)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)

## Code of Conduct

- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative
- Gracefully accept constructive criticism
- Focus on what is best for the community

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Flashcard2.git
   ```
3. Set up your development environment:
   ```bash
   npm install
   composer install
   ```
4. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. **Branch Naming Convention**
   - `feature/` - for new features
   - `bugfix/` - for bug fixes
   - `docs/` - for documentation
   - `test/` - for test additions or changes

2. **Commit Messages**
   - Use present tense ("Add feature" not "Added feature")
   - Use imperative mood ("Move cursor to..." not "Moves cursor to...")
   - Limit the first line to 72 characters
   - Reference issues and pull requests when relevant

3. **Code Style**
   - Follow PSR-12 for PHP code
   - Use ESLint configuration for JavaScript
   - Maintain consistent indentation (2 spaces)
   - Add comments for complex logic

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation with any new dependencies
3. Ensure all tests pass
4. Get at least one code review from a maintainer
5. Your PR will be merged once approved

## Coding Standards

### PHP
- Follow PSR-12 coding standard
- Use type hints where possible
- Document classes and methods with PHPDoc
- Use meaningful variable and function names

### JavaScript
- Follow Airbnb JavaScript Style Guide
- Use ES6+ features appropriately
- Document complex functions
- Use meaningful variable and function names

### CSS/SCSS
- Use BEM naming convention
- Keep selectors specific but not too nested
- Use variables for colors and common values
- Maintain mobile-first approach

## Testing Guidelines

1. **Unit Tests**
   - Write tests for new features
   - Maintain existing tests
   - Aim for high code coverage
   - Use meaningful test descriptions

2. **Integration Tests**
   - Test component interactions
   - Verify Firebase operations
   - Test authentication flows

3. **E2E Tests**
   - Test critical user paths
   - Verify form submissions
   - Test responsive design

## Development Setup

1. **Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

2. **Database Setup**
   - Configure Firebase project
   - Set up security rules
   - Initialize test data if needed

3. **Running Tests**
   ```bash
   npm run test
   composer test
   ```

## Reporting Bugs

1. Use the GitHub issue tracker
2. Check if the issue already exists
3. Include:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Your environment details

## Feature Requests

1. Use the GitHub issue tracker
2. Clearly describe the feature
3. Explain why it would be useful
4. Be open to feedback and discussion

## Code Review Process

1. **Reviewers will look for:**
   - Code quality and style
   - Test coverage
   - Documentation
   - Performance implications
   - Security considerations

2. **Review Response Time:**
   - Initial response within 2 business days
   - Detailed review within 5 business days

## Questions?

Feel free to reach out to the maintainers or open an issue for clarification.

Thank you for contributing to make this project better! 🚀
