# Parsnipt

Intelligent code extraction and organization platform for developers.

Parsnipt enables developers to upload source code and request, extract, and visualize code snippets. Find the exact code snippet you need, whether it's a button style, an animation, a sorting algorithm, or a utility function, all across multiple languages and codebases.

## Features

- **Intelligent Extraction:** Automatically identify and extract functions, components, algorithms, and utilities from source code.
- **Visual Preview:** See rendered UI components in action with live interactive previews (Pro tier).
- **Smart Organization:** Code categorized by request, type, and purpose for easy discovery.
- **Multi-Language Support:** JavaScript/TypeScript in MVP, expanding to Python, Java, Go, and more.
- **Privacy First:** Your code stays yours; opt-in storage only with full transparency.
- **Open Source:** MIT licensed, community-driven development with transparent roadmap.
- **Flexible Pricing:** Free tier for individuals, Pro for professionals, Enterprise for teams.

## Quick Start

**Prerequisites**
- Node.js 18 or higher
- npm or yarn package manager
- Git

### Local Development Setup

**1. Clone the repository:**
    
    git clone https://github.com/parsnipt/parsnipt.git
    
    cd parsnipt

**2. Setup backend:**
    
    cd backend
    npm install
    npm run dev

**3. In a new terminal, setup frontend:**
    
    cd frontend
    npm install
    npm run dev

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

For more detailed setup instructions, see [SETUP.md](./docs/SETUP.md).

    parsnipt/
    ├── backend/            # Express.js REST API server
    ├── frontend/           # React web application interface
    ├── docs/               # Documentation and guides
    ├── .github/            # GitHub templates and workflows
    └── LICENSE             # MIT License

## Documentation

- [Contributing Guide](./docs/CONTRIBUTING.md) - How to contribute code, report bugs, and suggest features
- [Code of Conduct](./docs/CODE_OF_CONDUCT.md) - Community standards and expectations
- [Architecture](./docs/ARCHITECTURE.md) - Technical overview, design decisions, and system design
- [Setup Guide](./docs/SETUP.md) - Local development environment configuration
- [Roadmap](./docs/ROADMAP.md) - Feature timeline and development phases
- [API Documentation](./docs/API.md) - Backend API endpoints and usage

## How It Works

### For Users

1. **Upload Code** - Select a code file from your computer or link a GitHub repository.
2. **Instant Extraction** - Parsnipt automatically analyzes the code and identifies requested patterns.
3. **Browse Results** - See extracted functions, components, algorithms, and utilities organized by request.
4. **Preview & Copy** - View code previews and easily copy snippets to use in your projects.

### For Developers

Parsnipt uses several key technologies:

- **Babel Parser** - Parses JavaScript and TypeScript into an Abstract Syntax Tree (AST).
- **Pattern Recognition** - Analyzes the AST to identify code types and purposes.
- **Categorization Engine** - Organizes extracted code by function, type, and complexity.
- **React Sandpack** - Safely renders UI components in isolated sandboxes for preview.

## Development Roadmap

**Phase 1: MVP** *(Months 1-3)*

*Focus: Single file extraction with core functionality*
- Single file code extraction (JavaScript/TypeScript)
- Function, component, and utility extraction
- Static code preview and display
- Basic search and filtering
- Free tier launch

**Phase 2: Multi-File Support** *(Months 4-6)*

*Focus: Expand capabilities and launch Pro tier*
- Multi-file and folder scanning
- Live component preview with sandboxing
- GitHub repository integration
- AI-powered code explanations
- Pro tier with advanced features

**Phase 3: Enterprise Features** *(Months 7+)*

*Focus: Scale and support large organizations*
- Backend language support (Python, Java, Go, C#, Rust)
- Enterprise tier with custom features
- API access for programmatic integration
- Team collaboration tools
- Advanced audit logging

See [ROADMAP.md](./docs/ROADMAP.md) for comprehensive details.

## Pricing Tiers

### Free Tier
- Single JavaScript/TypeScript file uploads
- File size limit: 100KB
- Basic code extraction (functions, components, constants)
- Static code preview (no rendering)
- Search and filtering within uploaded file
- Up to 10 extractions per day
- Community support

### Pro Tier *($9-15/month)*
- Everything in Free tier
- Folder and multi-file scanning (up to 100 files)
- File size limit: 10MB total per upload
- Live component preview (sandboxed rendering)
- GitHub repository read access
- Support for multiple frontend frameworks
- AI-powered code explanations
- Export extractions to JSON, Markdown
- Up to 100 extractions per day
- Email support

### Enterprise Tier *(Custom Pricing)*
- Everything in Pro tier
- Backend language support (Python, Java, Go, etc.)
- Unlimited file scanning and extractions
- Custom pattern definitions
- Batch processing of multiple repositories
- API access for programmatic integration
- Team collaboration and access controls
- Audit logging and compliance features
- Dedicated account manager
- Priority support

## Privacy and Security

- Your code is never stored without explicit opt-in consent.
- All data is encrypted in transit using HTTPS.
- Component preview execution runs in isolated sandboxes with no access to parent resources.
- No user data is sold or monetized.
- All extraction operations are logged for audit purposes.
- Users can request deletion of stored data at any time.

*For comprehensive privacy information, see our privacy policy (coming soon).*

## Contributing

We welcome contributions of all types—bug reports, feature requests, documentation improvements, and code contributions.

**Before contributing, please read:**
- [Contributing Guide](./docs/CONTRIBUTING.md) - Contribution process and guidelines
- [Code of Conduct](./docs/CODE_OF_CONDUCT.md) - Community standards

**Quick Contribution Process**
1. Fork the repository on GitHub.
2. Create a feature branch for your changes.
3. Make your changes and test thoroughly.
4. Submit a pull request with a clear description.
5. Participate in code review discussion.
6. Merge when approved.

## Technology Stack

**Frontend**
- React 18+ with TypeScript
- React Syntax Highlighter for code display and syntax highlighting
- Custom JWT & Bcrypt Authentication with Resend Email Verification
- Tailwind CSS for styling
- Zustand for lightweight state management
- Axios or Fetch API for HTTP requests

**Backend**
- Node.js 18+ runtime
- Express.js framework
- TypeScript for type safety
- Babel parser for JavaScript/TypeScript AST generation
- PostgreSQL for persistent data storage
- Redis for caching and rate limiting
- Auth0 or Supabase for authentication

## Infrastructure

- Vercel or Netlify for frontend hosting
- Railway, Render, or AWS for backend hosting
- GitHub Actions for CI/CD automation
- Sentry for error tracking and monitoring

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for complete details.

*The MIT License is a permissive license that allows commercial use, modification, and distribution while providing liability protection.*

## Team

- **ChadCrowley-Tech** - Founder, Full-Stack Developer
- **xivix01** - Co-Founder, Full-Stack Developer

## Support and Community

- Report Bugs - GitHub Issues
- Feature Requests - GitHub Issues with "enhancement" label
- General Questions - GitHub Discussions
- Email - support@parsnipt.dev (coming soon)

## Acknowledgments

• Built with React, Express.js, and Babel

• Inspired by the developer community’s need for intelligent code organization

• Special thanks to all contributors and supporters

**Made with dedication by the Parsnipt Team**