# Contributing to Parsnipt

First off, thank you for considering contributing to Parsnipt!

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the [issue list](https://github.com/parsnipt/parsnipt/issues) as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps which reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots if applicable**
- **Include your environment** (OS, Node version, npm version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/parsnipt/parsnipt/issues). When creating an enhancement suggestion, please include:

- **A clear and descriptive title**
- **A step-by-step description of the suggested enhancement**
- **Specific examples to demonstrate the steps**
- **A description of the current behavior and expected behavior**
- **Why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Follow the TypeScript styleguides
- Include appropriate test cases
- Document new code based on the documentation standards
- End all files with a newline

---

## Development Setup

### Prerequisites
- Node.js 24+
- npm or yarn
- Git

### Local Development

1. **Fork the repository**

    Click "Fork" on GitHub

2. git clone https://github.com/YOUR-USERNAME/parsnipt.git

    cd parsnipt

3. git remote add upstream https://github.com/parsnipt/parsnipt.git

4. # Backend
    cd backend

    npm install

5. # Frontend (in another terminal)
    cd frontend

    npm install

6. git checkout -b feature/your-feature-name

7. Make your changes and test thoroughly

8. git commit -m "feat: add new feature description"

9. git push origin feature/your-feature-name

10.  Create a Pull Request

    • Use the PR template

    • Link any related issues

    • Describe your changes clearly


# Styleguides

**Git Commit Messages**

• Use the present tense (“add feature” not “added feature”)

• Use the imperative mood (“move cursor to…” not “moves cursor to…”)

• Limit the first line to 72 characters or less

• Reference issues and pull requests liberally after the first line

• Use conventional commits:

    • feat: for new features

    • fix: for bug fixes

    • docs: for documentation

    • style: for formatting changes

    • refactor: for code refactoring

    • test: for test changes

    • chore: for build/dependency changes

Example:
feat: add code extraction for Python files

- Added Babel parser for Python syntax
- Integrated AST traversal logic
- Added unit tests


**TypeScript Styleguide**

• Use TypeScript for all new code

• Use 2-space indentation

• Use descriptive variable and function names

• Add JSDoc comments for public functions

• Use interfaces for type definitions

• Run npm run lint before committing

Example:
/**

 * Extracts functions from source code

 * @param code - Source code to parse

 * @returns Array of extracted functions

 */

export function extractFunctions(code: string): Function[] {
  // Implementation
}

**Documentation Styleguide**

• Use Markdown formatting

• Use code blocks with language specification

• Include clear examples

• Keep lines under 100 characters

• Use descriptive headers


**Testing**

• Add tests for any new functionality

• Ensure all tests pass: npm test

• Aim for >80% code coverage


**Additional Notes**

• Don’t include issue numbers in the PR title

• Include screenshots and animated GIFs for UI changes

• Follow the existing code style

• Be respectful and constructive in discussions


**Questions?**

Feel free to ask questions in GitHub Discussions or create an issue with the question label.

**Thank you for contributing!**