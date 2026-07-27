# Parsnipt Frontend

React TypeScript web application for the Parsnipt code extraction platform.

---

## Overview

The frontend provides:
- User-friendly code upload interface
- Real-time extraction progress tracking
- Interactive results display with code preview
- Search and filtering capabilities
- User authentication and profile management
- Responsive design for all devices
- Dark/light mode support (coming Phase 2)

---

## Technology Stack

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite or Create React App
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Code Editor:** Monaco Editor
- **Component Preview:** React Sandpack (Phase 2)
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint
- **Code Formatting:** Prettier

---

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Button.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   └── AuthLayout.tsx
│   │   └── features/         # Feature-specific components
│   │       ├── UploadForm.tsx
│   │       ├── ResultsDisplay.tsx
│   │       └── CodePreview.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Upload.tsx
│   │   ├── Results.tsx
│   │   ├── Profile.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── NotFound.tsx
│   ├── hooks/
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useExtractions.ts # Extractions data hook
│   │   └── useFetch.ts       # Generic fetch hook
│   ├── types/
│   │   ├── index.ts          # TypeScript interfaces
│   │   ├── api.ts            # API response types
│   │   └── extraction.ts     # Extraction types
│   ├── services/
│   │   ├── api.ts            # API client setup
│   │   ├── auth.ts           # Authentication service
│   │   ├── extractions.ts    # Extraction API calls
│   │   └── users.ts          # User API calls
│   ├── store/
│   │   ├── authStore.ts      # Auth state management
│   │   ├── extractionStore.ts # Extraction state
│   │   └── uiStore.ts        # UI state
│   ├── utils/
│   │   ├── formatters.ts     # Data formatting utilities
│   │   ├── validators.ts     # Form validation
│   │   ├── constants.ts      # App constants
│   │   └── errors.ts         # Error handling
│   ├── styles/
│   │   ├── variables.css     # CSS variables
│   │   └── tailwind.config.js # Tailwind config
│   └── tests/                # Test files
├── public/
│   ├── index.html
│   └── favicon.ico
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts or craco.config.js  # Build configuration
└── README.md                 # This file
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running at http://localhost:5000

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Environment Variables

Edit `.env` with your configuration:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_API_TIMEOUT=10000

# Authentication
REACT_APP_AUTH0_DOMAIN=your-auth0-domain.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your-client-id
REACT_APP_AUTH0_CALLBACK_URL=http://localhost:3000/callback

# Feature Flags
REACT_APP_ENABLE_PREVIEW=true
REACT_APP_ENABLE_GITHUB_INTEGRATION=false
REACT_APP_ENABLE_DARK_MODE=false
```

### Development Server

```bash
npm run dev
```

Application will start at `http://localhost:3000`

---

## Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build locally
npm run start         # Start production server
npm run test          # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
npm run type-check    # Run TypeScript compiler check
```

---

## Project Features

### Phase 1 (Current)

#### Upload Interface
- Drag-and-drop file upload
- File type validation
- File size indication
- Clear error messages
- Upload progress indicator

#### Results Display
- Categorized code extraction results
- Functions list
- Components list
- Utilities list
- Constants list
- Syntax-highlighted code preview
- Copy-to-clipboard functionality

#### Authentication
- User registration form
- Login form
- Password reset (coming Phase 2)
- User profile page
- Session management

#### Search & Filter
- Search within extraction results
- Filter by code type
- Sort results
- Save searches (coming Phase 2)

### Phase 2 (Planned)

#### Live Preview
- React component rendering
- Interactive props editing
- Component showcase
- Screenshot export

#### Dark Mode
- System preference detection
- Manual toggle
- Persistent preference

#### GitHub Integration
- Connect GitHub account
- Browse repositories
- Auto-extract on upload

---

## Component Architecture

### Layout Components
```
App
├── MainLayout
│   ├── Header
│   ├── PageContent
│   └── Footer
└── AuthLayout
    ├── AuthHeader
    └── AuthContent
```

### Feature Components
```
Upload
├── UploadForm
├── FileInput
├── ProgressBar
└── ValidationMessages

Results
├── ResultsHeader
├── ResultsNav
├── CodeList
│   ├── CodeItem
│   └── CodePreview
└── CodeExport
```

---

## State Management with Zustand

### Store Examples

```typescript
// authStore.ts
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (email, password) => { /* ... */ },
  logout: () => { /* ... */ },
}));

// extractionStore.ts
export const useExtractionStore = create((set) => ({
  extractions: [],
  loading: false,
  fetchExtractions: () => { /* ... */ },
}));
```

---

## API Integration

### API Client Setup

```typescript
// services/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

### API Service Example

```typescript
// services/extractions.ts
export const submitExtraction = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/extractions', formData);
  return response.data;
};
```

---

## Custom Hooks

### useAuth Hook

```typescript
const { user, login, logout, isLoading } = useAuth();
```

### useExtractions Hook

```typescript
const { extractions, fetchExtractions, deleteExtraction } = useExtractions();
```

---

## Styling with Tailwind CSS

### Tailwind Configuration

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
      },
    },
  },
};
```

### Component Styling Example

```tsx
export const Button = ({ children, variant = 'primary' }) => {
  const baseClasses = 'px-4 py-2 rounded font-semibold';
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
};
```

---

## Testing

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

### Test Structure

```typescript
// Example: Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Deploy the 'dist' folder to Netlify
```

### Environment Variables for Production
Set these in your hosting platform:
- `REACT_APP_API_URL=https://api.parsnipt.dev/api/v1`
- `REACT_APP_AUTH0_DOMAIN=your-domain.auth0.com`
- `REACT_APP_AUTH0_CLIENT_ID=your-production-client-id`

---

## Performance Optimization

### Code Splitting
- Lazy load pages with React.lazy()
- Suspense boundaries for loading states

### Memoization
- Use React.memo() for expensive components
- useMemo() for expensive calculations

### Image Optimization
- Use next-gen formats (WebP)
- Lazy load images below fold

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Find process
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### API Connection Error
- Verify backend is running at `http://localhost:5000`
- Check `REACT_APP_API_URL` in `.env`
- Check browser console for CORS errors

### Dependencies Installation Fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## Contributing

See [CONTRIBUTING.md](../docs/CONTRIBUTING.md) for contribution guidelines.

---

## Architecture

See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for detailed system design.
---

## Support

- Issues: [GitHub Issues](https://github.com/parsnipt/parsnipt/issues)
- Questions: [GitHub Discussions](https://github.com/parsnipt/parsnipt/discussions)
- Documentation: [Docs](../docs/)

---

**Made with dedication by the Parsnipt Team**