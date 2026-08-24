# Parsnipt Frontend - Testing Checklist

## Functional Testing

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Invalid login shows error
- [ ] Logout removes tokens
- [ ] Protected routes redirect to login
- [ ] Session persists on page reload

### File Upload
- [ ] Drag and drop uploads file
- [ ] Browse button selects file
- [ ] Invalid file type shows error
- [ ] File too large shows error
- [ ] Empty file shows error
- [ ] Progress bar appears during upload
- [ ] Upload completes successfully

### Results Display
- [ ] Results page loads after extraction
- [ ] Summary statistics display correctly
- [ ] Filter buttons work
- [ ] Search filters results
- [ ] Code items expand/collapse
- [ ] Copy button works
- [ ] Syntax highlighting displays properly
- [ ] Metadata displays correctly

### Navigation
- [ ] Home page accessible
- [ ] Upload page accessible
- [ ] Results page accessible
- [ ] Header navigation works
- [ ] Back buttons work
- [ ] Breadcrumb navigation works (if present)

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab navigation works throughout app
- [ ] Focus indicators visible
- [ ] Enter activates buttons
- [ ] Escape closes modals

### Screen Reader
- [ ] Page headings semantic
- [ ] Form labels associated
- [ ] Error messages announced
- [ ] Button purposes clear
- [ ] Images have alt text

### Visual
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Text readable at zoom levels
- [ ] Responsive on mobile
- [ ] Touch targets appropriately sized

## Performance Testing

### Load Time
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

### Bundle Size
- [ ] JavaScript bundle < 500KB (gzipped)
- [ ] CSS bundle < 100KB (gzipped)
- [ ] Total resources < 2MB

### Runtime Performance
- [ ] No memory leaks
- [ ] Smooth animations (60fps)
- [ ] No console errors
- [ ] API requests optimized

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Responsive Design

- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1920px)
- [ ] Ultra-wide (2560px)

## Security Testing

- [ ] No sensitive data in localStorage
- [ ] HTTPS enforced
- [ ] XSS protection in place
- [ ] CSRF protection implemented
- [ ] Input sanitized
- [ ] API calls authenticated

## Error Handling

- [ ] Network error displays gracefully
- [ ] API errors show user-friendly messages
- [ ] Error boundary catches crashes
- [ ] Retry options provided
- [ ] Loading states prevent double-clicks

## E2E Test Coverage

- [ ] Complete registration flow
- [ ] Complete login flow
- [ ] File upload flow
- [ ] Results viewing flow
- [ ] Account deletion flow (if applicable)

## Final Sign-off

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Accessibility standards met
- [ ] Documentation complete
- [ ] Ready for production

**Tested By:** ___________________  
**Date:** ___________________  
**Browser/Device:** ___________________