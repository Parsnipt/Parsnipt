# Parsnipt Frontend - Deployment Guide

## Prerequisites

- Node.js 24+ and npm 9+
- Backend API running and accessible
- Environment variables configured

## Environment Setup

Create a `.env.local` file in the frontend directory:

```env
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Parsnipt
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

## Build Process

### Development Build

```bash
npm run dev
```

Starts development server at `http://localhost:3000` with hot reload.

### Production Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory.

Output:
- Minified JavaScript bundles
- Optimized CSS files
- Compressed images
- Source maps (optional)

### Preview Production Build Locally

```bash
npm run preview
```

Serves production build locally at `http://localhost:4173` for testing.

## Testing Before Deployment

### Run All Tests

```bash
npm test
```

- Unit tests
- Component tests
- Integration tests

### Run E2E Tests

```bash
npm run test:e2e
```

- Full user flows
- Cross-browser testing
- Visual regression testing

### Run Performance Tests

```bash
npm run test:coverage
```

- Bundle size analysis
- Load time testing
- Memory usage monitoring

## Deployment Targets

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Vercel auto-deploys on push

### Netlify

```bash
npm run build
# Deploy dist/ directory to Netlify
```

### Docker

Create `Dockerfile`:

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]


Build and run:
```bash
docker build -t parsnipt-frontend .
docker run -p 3000:3000 parsnipt-frontend
```

### AWS S3 + CloudFront

1. Build: `npm run build`
2. Upload `dist/` to S3 bucket
3. Configure CloudFront distribution
4. Set cache headers appropriately

## Production Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] Error boundaries in place
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Security headers configured
- [ ] SSL/TLS enabled
- [ ] Monitoring and logging setup
- [ ] Error tracking (Sentry/similar) configured
- [ ] CDN configured
- [ ] Database backups automated
- [ ] User feedback mechanism in place

## Monitoring & Analytics

### Performance Monitoring

- Page load times
- Time to interactive
- Resource loading times
- JavaScript errors
- Network requests

### User Analytics

- Page views
- User flow analysis
- Feature usage
- Conversion funnels

## Rollback Procedure

If issues occur in production:

1. Identify the problematic version
2. Revert to previous stable build
3. Investigate issue in development
4. Fix and test thoroughly
5. Deploy fixed version

## Support & Troubleshooting

### Common Issues

**Blank page on load:**
- Check browser console for errors
- Verify API is accessible
- Clear browser cache and reload

**API connection failures:**
- Check `VITE_API_URL` environment variable
- Verify backend is running
- Check network connectivity
- Review CORS configuration

**Slow load times:**
- Check bundle size: `npm run build -- --analyze`
- Enable CDN caching
- Optimize images
- Use lazy loading for routes

## Contact & Support

For deployment issues, contact the development team or refer to the main README.