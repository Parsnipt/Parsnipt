# Parsnipt Development Roadmap

This roadmap outlines our planned features, improvements, and milestones for Parsnipt. We're committed to transparency and community input on our direction.

**Last Updated:** August 2026

---

## Overview

Parsnipt is being developed in three phases over the next 9+ months. Each phase builds on the previous, gradually expanding capabilities and introducing new features.

---

## Phase 1: MVP (Months 1-3) - Current Focus

**Goal:** Establish core functionality for intelligent code extraction with JavaScript/TypeScript support.

**Target Launch:** September/October 2026

### Features

#### Core Extraction
- Single file code extraction (JavaScript/TypeScript)
- Automatic function and component detection
- Utility function identification
- Constant and variable extraction
- React component detection (functional and class components)
- Support for JSX syntax

#### Display & Organization
- Static code preview with custom syntax highlighting (React Syntax Highlighter)
- Categorized results (Functions, Components, Utilities, Constants)
- Search and filter within uploaded file
- Copy-to-clipboard functionality
- Export results as JSON and Markdown

#### User Interface
- Intuitive upload interface (drag-and-drop & file browser)
- Real-time extraction progress
- Results visualization dashboard
- Responsive design for mobile/tablet/desktop

#### Authentication & Accounts
- Custom user registration and login (JWT & Bcrypt)
- Email verification via Resend integration
- Secure HTTP-only refresh tokens & token management
- Basic user profile management

#### Tier System
- Free tier with 10 extractions per day
- File size limit: 100KB
- Basic support via GitHub Issues

#### Platform
- Web application (React 18 + Vite + Tailwind CSS)
- Comprehensive API documentation & developer guides
- Open-source MIT license
- Community support via GitHub Discussions

### Deliverables
- [x] Frontend React application architecture & components
- [x] Backend Express API server & Knex.js PostgreSQL database integration
- [x] Custom authentication and email verification system
- [x] Code extraction engine (Babel AST parsing & pattern recognition)
- [x] Comprehensive test suites (Vitest unit tests, Playwright E2E tests)
- [x] Full documentation suite (API, Architecture, Troubleshooting, Deployment, Setup, User Guide)
- [x] Community guidelines (CONTRIBUTING.md, CODE_OF_CONDUCT.md)

### Technical Milestones
- Week 1-2: Project scaffolding, environment setup, and security baselines
- Week 3-5: Backend REST API development, Knex migrations, and AST parsing engine
- Week 6-8: Frontend UI, Zustand state management, and Tailwind styling
- Week 9-10: Integration testing, rate-limiting safeguards, and E2E coverage
- Week 11-12: Deployment configuration and launch readiness

---

## Phase 2: Expansion & Pro Tier (Months 4-6)

**Goal:** Expand capabilities, introduce live preview, and launch paid tier.

**Target Launch:** January 2027

### Features

#### Multi-File Support
- Folder and multi-file scanning
- File size limit increased to 10MB per upload
- Batch processing
- Directory structure preservation
- File dependency analysis

#### Live Component Preview
- React Sandpack integration
- Interactive component rendering
- Props manipulation in preview
- Live code execution (sandboxed)
- Screenshot/export of rendered components

#### GitHub Integration
- Connect GitHub repositories
- Automatic repository analysis
- Browse extraction history per repository
- Share results via link
- Version tracking

#### Account & Security Enhancements
- Self-service password reset and profile updates UI
- Advanced audit logging dashboard for user actions
- Enhanced rate-limiting management per subscription tier

#### Enhanced Search & Export
- Full-text search across extractions
- Advanced filtering and saved searches
- Export formats expansion (JSON, Markdown, CSV, PDF stubs)

#### Pro Tier
- Folder and multi-file scanning
- Live component preview
- GitHub integration
- AI-powered code explanations
- Up to 100 extractions per day
- Email support
- $9-15/month pricing

### Deliverables
- [ ] Multi-file extraction engine
- [ ] React Sandpack integration
- [ ] GitHub OAuth integration
- [ ] Account password reset workflows & UI
- [ ] Advanced search implementation
- [ ] Pro tier subscription system & Stripe integration
- [ ] Email notifications & usage analytics dashboard

---

## Phase 3: Enterprise & Multi-Language (Months 7-12)

**Goal:** Scale to enterprise customers, add multiple language support, and introduce advanced features.

**Target Launch:** April 2027+

### Features

#### AI-Powered Features (Beta)
- Automatic code explanation generation
- Smart naming suggestions
- Pattern recommendations

#### Backend Language Support
- Python extraction and analysis
- Java extraction and analysis
- Go extraction and analysis
- C# extraction and analysis
- Rust extraction and analysis

#### Enterprise Tier
- Unlimited extractions & custom extraction patterns
- API access for programmatic integration
- Team collaboration, workspaces, and role-based access control (Admin, Editor, Viewer)
- SAML/SSO authentication
- Advanced audit logging & compliance features
- Dedicated account manager & SLA support

#### API & Integrations
- RESTful API & GraphQL API options
- Webhook support for extraction events
- IDE plugins (VS Code, IntelliJ)
- CI/CD pipeline integration (GitHub Actions, GitLab CI)

---

## Future Considerations (Post Phase 3)

### Potential Features
- Mobile applications (iOS, Android)
- Browser extension for quick code extraction
- Integration with code review platforms
- Security vulnerability and code quality scanning
- Architecture visualization tools

---

## Community Input & Feedback

We welcome community feedback on our roadmap!

- **Request a Feature:** [GitHub Issues](https://github.com/parsnipt/parsnipt/issues/new?labels=enhancement)
- **Discuss Ideas:** [GitHub Discussions](https://github.com/parsnipt/parsnipt/discussions)

---

## Timeline Summary

| Phase | Focus | Timeline | Target Launch |
|-------|-------|----------|----------------|
| Phase 1 | MVP Core Features & Custom Auth | Months 1-3 | October 2026 |
| Phase 2 | Expansion, Password Flows & Pro Tier | Months 4-6 | January 2027 |
| Phase 3 | Enterprise & Languages | Months 7-12+ | April 2027+ |

---

## Questions?

- **Roadmap questions:** [GitHub Discussions](https://github.com/parsnipt/parsnipt/discussions)
- **Bug reports:** [GitHub Issues](https://github.com/parsnipt/parsnipt/issues)
- **Feature requests:** [GitHub Issues](https://github.com/parsnipt/parsnipt/issues/new?labels=enhancement)

---

**Last Updated:** August 27, 2026

*Note: This roadmap is subject to change based on community feedback, market conditions, and development priorities. We'll provide updates as plans evolve.*