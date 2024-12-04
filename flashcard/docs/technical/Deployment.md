# Deployment and Setup Guide

## Prerequisites
- Node.js 16.x or higher
- MongoDB 4.4 or higher
- Git

## Local Development Setup

1. **Clone the Repository**
```bash
git clone https://github.com/Ghafli/flashcard.git
cd flashcard
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/flashcard

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-ga-id
```

4. **Verify Setup**
```bash
npm run verify
```
This will check:
- Required files existence
- Node.js version
- Dependencies installation
- MongoDB configuration
- Build configuration

5. **Start Development Server**
```bash
npm run dev
```

## Production Deployment

### GitHub Pages Deployment

1. **Automated Deployment (GitHub Actions)**
- Push to main branch
- GitHub Actions will automatically:
  - Build the application
  - Deploy to gh-pages branch
  - Update the live site

2. **Manual Deployment**
```bash
npm run deploy
```

### Configuration Files

1. **next.config.js**
```javascript
{
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/flashcard' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/flashcard/' : ''
}
```

2. **next-sitemap.config.js**
```javascript
{
  siteUrl: 'https://ghafli.github.io/flashcard',
  generateRobotsTxt: true,
  outDir: 'out'
}
```

3. **.github/workflows/deploy.yml**
- Automated deployment workflow
- Runs on push to main
- Handles build and deployment

## Quality Assurance

### Pre-commit Hooks
```bash
# Runs automatically before each commit
- Linting
- Type checking
- Tests
- Build verification
```

### Continuous Integration
- GitHub Actions workflow
- Automated testing
- Build verification
- Deployment checks

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| MONGODB_URI | MongoDB connection string | Yes | - |
| NEXTAUTH_SECRET | Session encryption key | Yes | - |
| NEXTAUTH_URL | Authentication callback URL | Yes | - |
| NODE_ENV | Environment mode | No | development |

## Security Considerations

1. **API Security**
   - Rate limiting enabled
   - CORS configured
   - Authentication required
   - Input validation

2. **Database Security**
   - Connection string in env vars
   - Indexes for performance
   - Access control configured

3. **Frontend Security**
   - XSS protection
   - CSRF protection
   - Secure cookie handling

## Maintenance Scripts

1. **Cleanup**
```bash
npm run clean
```

2. **Verify Setup**
```bash
npm run verify
```

3. **Type Check**
```bash
npm run type-check
```

## Troubleshooting

1. **Build Issues**
   - Run `npm run clean`
   - Delete node_modules and reinstall
   - Check Node.js version

2. **Deployment Issues**
   - Verify GitHub Pages settings
   - Check GitHub Actions logs
   - Verify environment variables

3. **Local Development Issues**
   - Run verify script
   - Check MongoDB connection
   - Clear Next.js cache
