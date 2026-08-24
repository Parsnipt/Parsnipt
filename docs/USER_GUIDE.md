# Parsnipt User Guide

## Getting Started

### Account Creation

1. Visit [https://parsnipt.app](https://parsnipt.app)
2. Click "Register" on the login page
3. Enter your information:
   - **Full Name**: Your name
   - **Email**: Valid email address
   - **Password**: Strong password (8+ chars, uppercase, lowercase, number)
4. Agree to terms and click "Create Account"
5. You're ready to upload!

### Logging In

1. Visit login page
2. Enter your email and password
3. Click "Login"
4. Redirected to home page

### Password Reset

*(Coming in Phase 2)*

## Uploading Code

### Uploading a File

**Method 1: Drag and Drop**
1. Go to Upload page
2. Drag your JavaScript/TypeScript file onto the upload area
3. Release to upload
4. Wait for processing to complete

**Method 2: Browse Button**
1. Go to Upload page
2. Click "Choose File"
3. Select your file from computer
4. Upload starts automatically

### Supported File Types

- `.js` - JavaScript
- `.jsx` - React Components
- `.ts` - TypeScript
- `.tsx` - TypeScript React

### File Size Limits

- **Free Tier**: 50KB per file, 10 files/day
- **Pro Tier**: 10MB per file, unlimited daily
- **Enterprise**: 100MB per file, unlimited daily

### Upgrade Your Plan

*(Coming in Phase 2)*

## Viewing Results

### Results Page

After uploading, your file is analyzed and results appear:

1. **Summary Section**: Shows counts of extracted items by type
2. **Filter Section**: Filter by type or search by name
3. **Code Items**: Expandable cards showing each extracted item

### Understanding Results

Each code item shows:

- **Type Badge**: Function, Component, Utility, or Constant
- **Item Name**: Name of the function/component
- **Metadata**: Parameters, return type, complexity, lines of code
- **Complexity**: Simple, Moderate, or Complex

### Expanding Code Items

1. Click any code item card to expand
2. View full code with syntax highlighting
3. See parameters and return types
4. View documentation comments if available
5. Copy code with copy button

### Searching Results

1. Use search box at top of results
2. Search by:
   - Item name (e.g., "greeting")
   - Type (e.g., "component")
   - Code content (e.g., "async")
3. Results filter in real-time

### Filtering Results

Click filter buttons to show only:
- **All Items**: Show everything
- **Functions**: Regular functions only
- **Components**: React components
- **Utilities**: Helper/utility functions
- **Constants**: Constants and variables

## Account & Settings

### View Profile

1. Click your name in header
2. See your account information
3. View your tier level

### Change Password

*(Coming in Phase 2)*

### Delete Account

*(Coming in Phase 2)*

## Troubleshooting

### Upload Fails

**"Invalid file type"**
- Only `.js`, `.jsx`, `.ts`, `.tsx` files supported
- Check file extension

**"File too large"**
- Exceeded tier limit
- Upgrade your plan or split file

**"File is empty"**
- File has no content
- Add code and try again

### Processing Fails

**"Extraction failed"**
- Code has syntax errors
- Check file for typos
- Try smaller file first

### Results Not Showing

**"No items extracted"**
- File may not have extractable items
- Only functions, components, utilities, constants are extracted

## Limits & Quotas

### Free Tier
- 50KB per file
- 10 extractions per day
- 30-day file history

### Pro Tier
- 10MB per file
- Unlimited daily extractions
- 1-year file history
- Email support

### Enterprise
- 100MB per file
- Unlimited everything
- Priority support
- Custom integrations

## Tips & Best Practices

1. **Organize Your Code**: Use consistent naming conventions
2. **Add Documentation**: JSDoc comments are extracted
3. **Split Large Files**: Upload smaller, focused files
4. **Use TypeScript**: Type annotations help with extraction
5. **Export Public APIs**: Only exported items are extracted

## Getting Help

- **Documentation**: See [docs](https://github.com/parsnipt/parsnipt)
- **Issues**: Report bugs on [GitHub](https://github.com/parsnipt/parsnipt/issues)
- **Feedback**: Send feedback via email or in-app form
- **Community**: Join our Discord server

## FAQ

**Q: Can I download my results?**
A: Coming in Phase 2! You'll be able to export as JSON, CSV, or PDF.

**Q: Is my code stored?**
A: Results are stored for 30 days (free tier) or 1 year (pro). We don't store original files.

**Q: Can I use this offline?**
A: Not yet, but desktop app is planned for Phase 2.

**Q: How accurate is the extraction?**
A: We use Babel AST parser for 95%+ accuracy on valid JavaScript/TypeScript.

**Q: What languages do you support?**
A: Currently JavaScript/TypeScript. Python and Go coming in Phase 2.