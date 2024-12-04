# Contributing to Flashcard App

Thank you for your interest in contributing to the Flashcard App! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

1. Clone the repository
```bash
git clone https://github.com/Ghafli/flashcard.git
cd flashcard
```

2. Install dependencies
```bash
npm install
```

3. Create a branch
```bash
git checkout -b feature/my-feature
# or
git checkout -b fix/my-fix
```

4. Make your changes and commit them
```bash
git add .
git commit -m "Description of changes"
```

5. Push to your fork and submit a pull request
```bash
git push origin feature/my-feature
```

## Development Setup

1. Copy the environment template:
```bash
cp config/env.template.js .env.local
```

2. Update the environment variables in `.env.local`

3. Start the development server:
```bash
npm run dev
```

## Style Guide

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript Style Guide

* Use TypeScript for all new code
* Follow the ESLint configuration
* Use meaningful variable names
* Add comments for complex logic
* Keep functions small and focused
* Write unit tests for new features

### Component Guidelines

* One component per file
* Use functional components with hooks
* Keep components small and reusable
* Use TypeScript interfaces for props
* Document component props
* Include unit tests

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Documentation

* Keep README.md up to date
* Document all new features
* Update API documentation when needed
* Include JSDoc comments for functions
* Update TypeScript interfaces

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
