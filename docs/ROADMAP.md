# Parsnipt Development Roadmap

This roadmap outlines our planned features, improvements, and milestones for Parsnipt. We're committed to transparency and community input on our direction.

**Last Updated:** July 2026

---

## Overview

Parsnipt is being developed in three phases over the next 9+ months. Each phase builds on the previous, gradually expanding capabilities and introducing new features.

---

## Phase 1: MVP (Months 1-3) - Current Focus

**Goal:** Establish core functionality for intelligent code extraction with JavaScript/TypeScript support.

**Target Launch:** September 2026

### Features

#### Core Extraction
- Single file code extraction (JavaScript/TypeScript)
- Automatic function and component detection
- Utility function identification
- Constant and variable extraction
- React component detection (functional and class components)
- Support for JSX syntax

#### Display & Organization
- Static code preview with syntax highlighting
- Categorized results (Functions, Components, Utilities, Constants)
- Search and filter within uploaded file
- Copy-to-clipboard functionality
- Export results as JSON

#### User Interface
- Intuitive upload interface (drag-and-drop)
- Real-time extraction progress
- Results visualization dashboard
- Code syntax highlighting with Monaco Editor
- Responsive design for mobile/tablet/desktop

#### Authentication & Accounts
- User registration and login
- Email verification
- Basic user profile management
- Session management

#### Tier System
- Free tier with 10 extractions per day
- File size limit: 100KB
- Basic support via GitHub Issues

#### Platform
- Web application (React)
- API documentation (auto-generated)
- Basic GitHub repository
- Open-source MIT license
- Community support via GitHub Discussions

### Deliverables
- [ ] Frontend React application deployed
- [ ] Backend API server deployed
- [ ] PostgreSQL database with user management
- [ ] Authentication system (Auth0 or Supabase)
- [ ] Code extraction engine (Babel AST parsing)
- [ ] Pattern recognition for JavaScript/TypeScript
- [ ] Test coverage >80%
- [ ] Comprehensive documentation
- [ ] Community guidelines (CONTRIBUTING.md, CODE_OF_CONDUCT.md)

### Technical Milestones
- Week 1-2: Project scaffolding and setup
- Week 3-5: Backend API development
- Week 6-8: Frontend UI development
- Week 9-10: Integration and testing
- Week 11-12: Deployment and launch

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

#### Enhanced Search
- Full-text search across extractions
- Advanced filtering options
- Saved searches
- Search history

#### Export Formats
- JSON export
- Markdown export
- JavaScript files
- React component stubs

#### Pro Tier
- Folder and multi-file scanning
- Live component preview
- GitHub integration
- AI explanations
- Up to 100 extractions per day
- Email support
- $9-15/month pricing

### Deliverables
- [ ] Multi-file extraction engine
- [ ] React Sandpack integration
- [ ] GitHub OAuth integration
- [ ] Advanced search implementation
- [ ] Export system (multiple formats)
- [ ] Pro tier subscription system
- [ ] Payment processing (Stripe)
- [ ] Email notifications
- [ ] Usage analytics dashboard

### Technical Milestones
- Month 4: Multi-file support and Sandpack integration
- Month 5: GitHub integration and pro tier setup
- Month 6: Payment processing

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
- Language detection and auto-switching

#### Advanced Pattern Recognition
- Machine learning-based pattern detection
- Custom pattern definitions
- Domain-specific extraction rules
- Architecture pattern detection

#### Enterprise Tier
- Unlimited extractions
- Custom extraction patterns
- AI explanations
- API access for programmatic integration
- Team collaboration and access controls
- SAML/SSO authentication
- Advanced audit logging
- SLA and priority support
- Dedicated account manager
- On-premise deployment option (custom)

#### Team Collaboration
- Multiple user access per account
- Role-based permissions (Admin, Editor, Viewer)
- Team workspaces
- Shared extraction libraries
- Collaborative comments and notes

#### API & Integrations
- RESTful API for programmatic access
- GraphQL API option
- Webhook support
- IDE plugin (VS Code, IntelliJ)
- CI/CD pipeline integration (GitHub Actions, GitLab CI)
- Slack integration for notifications

#### Advanced Analytics
- Extraction analytics dashboard
- Team usage reports
- Code pattern trending
- Repository insights

#### Performance Improvements
- Parallel processing for large codebases
- Caching optimization
- CDN deployment
- Regional servers

### Deliverables
- [ ] Multi-language AST parsers (Tree-sitter)
- [ ] Machine learning model training
- [ ] AI integration (OpenAI or similar)
- [ ] API with full documentation
- [ ] IDE plugin development
- [ ] Team management system
- [ ] Enterprise billing system
- [ ] On-premise deployment guide
- [ ] Advanced analytics platform

### Technical Milestones
- Month 7-8: Python, Java, Go support
- Month 9: C#, Rust support
- Month 10: API and IDE plugins
- Month 11: Team collaboration features, AI features
- Month 12: Enterprise deployment options

---

## Future Considerations (Post Phase 3)

### Potential Features
- Mobile applications (iOS, Android)
- Browser extension for quick extraction
- Integration with code review platforms (GitHub, GitLab)
- Machine learning for code quality analysis
- Code clone detection
- Security vulnerability scanning
- Performance analysis suggestions
- Architecture visualization tools

### Potential Partnerships
- Cloud providers (AWS, Azure, Google Cloud)
- Code hosting platforms (GitHub, GitLab, Bitbucket)
- IDE providers (JetBrains, Microsoft)
- Development tool ecosystems

---

## Known Limitations & Future Improvements

### Phase 1 Limitations
- Single file uploads only
- JavaScript/TypeScript only
- No component rendering (static preview)
- No repository integration
- Limited search capabilities

### Future Improvements
- Incremental loading for large files
- Real-time collaboration
- Version control integration
- Advanced caching strategies
- Offline mode capability

---

## Community Input & Feedback

We welcome community feedback on our roadmap!

- **Request a Feature:** [GitHub Issues](https://github.com/parsnipt/parsnipt/issues/new?labels=enhancement)
- **Discuss Ideas:** [GitHub Discussions](https://github.com/parsnipt/parsnipt/discussions)
- **Vote on Features:** Coming soon (feature voting system in Phase 2)

---

## Timeline Summary

| Phase | Focus | Timeline | Target Launch |
|-------|-------|----------|----------------|
| Phase 1 | MVP Core Features | Months 1-3 | October 2026 |
| Phase 2 | Expansion & Pro Tier | Months 4-6 | January 2027 |
| Phase 3 | Enterprise & Languages | Months 7-12+ | April 2027+ |

---

## Reporting Progress

We'll maintain regular updates on progress:
- **Monthly blog posts** with phase updates (coming soon)
- **GitHub Releases** for version announcements
- **GitHub Discussions** for milestone announcements
- **Email newsletter** for subscribers (Phase 2)

---

## How to Contribute

We're always looking for contributors! Areas where we need help:

- **Code:** Backend development, frontend components, testing
- **Documentation:** Guides, API docs, tutorials
- **Design:** UI/UX improvements, component design
- **Testing:** Bug reporting, QA, user testing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get involved.

---

## Questions?

- **Roadmap questions:** [GitHub Discussions](https://github.com/parsnipt/parsnipt/discussions)
- **Bug reports:** [GitHub Issues](https://github.com/parsnipt/parsnipt/issues)
- **Feature requests:** [GitHub Issues](https://github.com/parsnipt/parsnipt/issues/new?labels=enhancement)

---

**Last Updated:** July 25, 2026

*Note: This roadmap is subject to change based on community feedback, market conditions, and development priorities. We'll provide updates as plans evolve.*