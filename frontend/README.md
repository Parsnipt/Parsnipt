# Parsnipt Frontend

Production-ready React TypeScript frontend for code extraction.

## Features

✅ User authentication (register, login, logout)  
✅ Drag-and-drop file upload  
✅ Real-time code extraction  
✅ Syntax-highlighted code preview  
✅ Advanced filtering and search  
✅ Responsive design (mobile, tablet, desktop)  
✅ Accessibility (WCAG 2.1 AA)  
✅ Error boundaries and recovery  
✅ Comprehensive testing (unit, integration, E2E)  

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Syntax Highlighter** - Code highlighting
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on `http://localhost:5000`

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens http://localhost:3000 with hot reload.

### Testing

```bash
# Unit and component tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable components
│   │   ├── features/       # Feature-specific components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript types
│   ├── hooks/              # Custom hooks
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── e2e/                    # End-to-end tests
├── public/                 # Static assets
├── docs/                   # Documentation
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── playwright.config.ts
```

## API Integration

Frontend communicates with backend at `VITE_API_URL`:

```
GET  /api/v1/health              - Health check
POST /api/v1/auth/register       - User registration
POST /api/v1/auth/login          - User login
POST /api/v1/auth/logout         - User logout
POST /api/v1/auth/refresh        - Token refresh
GET  /api/v1/extractions         - List extractions
POST /api/v1/extractions         - Upload file
GET  /api/v1/extractions/:id     - Get extraction details
DELETE /api/v1/extractions/:id   - Delete extraction
```

## Environment Variables

Create `.env.local`:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_APP_NAME=Parsnipt
VITE_APP_VERSION=1.0.0
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment instructions.

Supported platforms:
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- Docker
- Self-hosted

## Documentation

- [User Guide](docs/USER_GUIDE.md) - For end users
- [Deployment Guide](docs/DEPLOYMENT.md) - For developers
- [Testing Checklist](TESTING_CHECKLIST.md) - QA checklist

## Contributing

1. Create feature branch
2. Follow existing code style
3. Write tests for new features
4. Ensure all tests pass
5. Create pull request

## Performance

- Lighthouse Score: 90+
- First Contentful Paint: < 2s
- Time to Interactive: < 3.5s
- Bundle Size: < 500KB (gzipped)

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome)

## License

MIT

## Support

- GitHub Issues: [parsnipt/parsnipt](https://github.com/parsnipt/parsnipt/issues)
- Email: support@parsnipt.app
- Discord: [Community](https://discord.gg/parsnipt)