# Deployment Guide

## GitHub Pages Deployment

This application is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Prerequisites

1. **GitHub Secret**: Ensure the repository has a secret named `gemini_key` with your Gemini API key
   - Go to Repository Settings → Secrets and variables → Actions
   - Add a new repository secret: `gemini_key`
   - Value: Your Gemini API key

2. **GitHub Pages**: Enable GitHub Pages in repository settings
   - Go to Repository Settings → Pages
   - Source: Deploy from a branch
   - Select: `gh-pages` branch (will be created automatically)

### Automatic Deployment

The deployment workflow (`.github/workflows/deploy.yml`) will automatically:
1. Trigger on push to `main` branch
2. Install dependencies
3. Build the app with the `gemini_key` secret
4. Deploy to GitHub Pages

### Manual Deployment

To manually trigger deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy CISA Dashboard" workflow
3. Click "Run workflow"

### Accessing the Deployed App

After successful deployment, access the app at:
```
https://parag-samant.github.io/vulnchecknew/
```

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev

# Build for production
npm run build
```

## Configuration

The application uses:
- **Base URL**: `/vulnchecknew/` (configured in `vite.config.ts`)
  - Can be overridden by setting `BASE_URL` environment variable
  - For local development with root path, set `BASE_URL=/`
- **API Key**: Injected at build time from environment variable
- **Port**: 3000 (development server)

## Troubleshooting

### Build Fails
- Ensure `gemini_key` secret is set in GitHub repository
- Check GitHub Actions logs for specific errors

### API Key Not Working
- Verify the secret name is exactly `gemini_key` (lowercase)
- Regenerate the API key if needed

### Pages Not Updating
- Check the Actions tab for deployment status
- Clear browser cache and hard refresh (Ctrl+Shift+R)
