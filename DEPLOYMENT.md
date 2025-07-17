# 🚀 Netlify Deployment Guide for BrainDead.site

## Quick Deploy to Netlify

### Option 1: Drag & Drop Deploy
1. Run `npm run build` to create the `dist` folder
2. Go to [Netlify](https://netlify.com)
3. Drag the `dist` folder to the deploy area
4. Your site will be live instantly!

### Option 2: Git Integration (Recommended)
1. Push your code to GitHub/GitLab
2. Connect your repository to Netlify
3. Netlify will auto-deploy on every push

### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy preview
npm run deploy:preview

# Deploy to production
npm run deploy
```

## 🔧 Build Configuration

### Build Settings in Netlify Dashboard:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18`

### Environment Variables (Optional):
```
VITE_APP_URL=https://your-site.netlify.app
VITE_APP_VERSION=1.0.0
NODE_ENV=production
```

## 📁 Files for Netlify

### Essential Files:
- ✅ `netlify.toml` - Main configuration
- ✅ `_redirects` - SPA routing and redirects
- ✅ `dist/` - Built application (auto-generated)

### Configuration Features:
- **SPA Routing**: Handles React Router properly
- **Security Headers**: XSS protection, frame options, etc.
- **Caching**: Optimized cache headers for assets
- **Redirects**: SEO-friendly URL handling

## 🌐 Custom Domain Setup

### After Deployment:
1. Go to Netlify Dashboard → Domain Settings
2. Add your custom domain (e.g., `braindead.site`)
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

### DNS Records:
```
Type: CNAME
Name: www
Value: your-site.netlify.app

Type: A
Name: @
Value: 75.2.60.5 (Netlify's IP)
```

## 🔒 Security Features

### Automatic HTTPS
- Netlify provides free SSL certificates
- Automatic renewal
- HTTP to HTTPS redirects

### Security Headers
- Content Security Policy
- XSS Protection
- Frame Options
- Referrer Policy

## 📊 Performance Optimizations

### Automatic Optimizations:
- **Asset Optimization**: Images, CSS, JS minification
- **Gzip Compression**: Automatic compression
- **CDN**: Global content delivery network
- **Preloading**: Critical resource preloading

### Build Optimizations:
- Tree shaking enabled
- Code splitting configured
- Source maps disabled in production
- Bundle analysis available

## 🚀 Deployment Checklist

### Before Deploying:
- [ ] Run `npm run build` locally to test
- [ ] Check `npm run preview` works correctly
- [ ] Verify all environment variables are set
- [ ] Test all routes work properly
- [ ] Run `npm run pre-commit` for quality checks

### After Deploying:
- [ ] Test the live site thoroughly
- [ ] Check all tools work correctly
- [ ] Verify PWA installation works
- [ ] Test on mobile devices
- [ ] Check SEO meta tags
- [ ] Verify analytics (if configured)

## 🔧 Troubleshooting

### Common Issues:

#### Build Fails
```bash
# Clear cache and reinstall
npm run clean
npm install
npm run build
```

#### 404 on Refresh
- Check `_redirects` file exists
- Verify SPA redirect rule: `/* /index.html 200`

#### Assets Not Loading
- Check `base` path in `vite.config.ts`
- Verify `public` folder structure

#### Environment Variables
- Prefix with `VITE_` for client-side access
- Set in Netlify Dashboard → Site Settings → Environment Variables

## 📈 Analytics & Monitoring

### Netlify Analytics:
- Built-in traffic analytics
- Performance monitoring
- Error tracking

### External Services:
- Google Analytics (add to environment variables)
- Error reporting services
- Performance monitoring tools

## 🔄 Continuous Deployment

### Auto-Deploy Setup:
1. Connect GitHub repository
2. Set branch to deploy (usually `main`)
3. Configure build settings
4. Enable auto-deploy on push

### Deploy Previews:
- Automatic preview deployments for PRs
- Test changes before merging
- Share preview links with team

## 🎯 Production Checklist

### Final Steps:
- [ ] Custom domain configured
- [ ] HTTPS enabled
- [ ] Analytics configured
- [ ] Error reporting set up
- [ ] Performance monitoring active
- [ ] SEO optimizations verified
- [ ] Social media cards tested
- [ ] PWA functionality confirmed

## 🆘 Support

### Resources:
- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router Deployment](https://reactrouter.com/en/main/guides/deploying)

### Need Help?
- Check Netlify build logs for errors
- Review browser console for client-side issues
- Test locally with `npm run preview`
- Verify all dependencies are in `package.json`

---

🎉 **Your BrainDead.site is ready for the world!**