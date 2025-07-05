# JoyTrips Testing Guide

## Pre-Deployment Testing (Local)

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Local Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` and test:
- [ ] Landing page loads correctly
- [ ] All buttons are clickable and functional
- [ ] Navigation between pages works
- [ ] JavaScript console shows no errors
- [ ] All CSS styles are applied correctly

### 3. Test Build Process
```bash
npm run build
```
Check that:
- [ ] `public/` directory is created
- [ ] All HTML files are copied to `public/`
- [ ] All CSS files are copied to `public/`
- [ ] JavaScript files are copied to `public/js/`
- [ ] No build errors occur

### 4. Test Built Version
```bash
npx serve -s public
```
Visit the served URL and verify:
- [ ] Landing page loads from built files
- [ ] All buttons work correctly
- [ ] Navigation functions properly
- [ ] No 404 errors for resources

## GitHub Pages Deployment Testing

### 1. Repository Setup
1. Push all changes to your GitHub repository
2. Go to repository Settings → Pages
3. Select "GitHub Actions" as source
4. Wait for the deployment workflow to complete

### 2. Deployment Verification
Check the Actions tab for:
- [ ] Build workflow completes successfully
- [ ] No errors in the build logs
- [ ] Deployment to gh-pages branch succeeds

### 3. Live Site Testing
Visit your GitHub Pages URL (usually `https://username.github.io/repository-name/`) and test:

#### Landing Page Functionality
- [ ] Page loads without errors
- [ ] "Explore Nearby" button navigates to login.html
- [ ] "Start Your Journey" button navigates to signup.html
- [ ] Footer links work correctly
- [ ] All CSS styles are applied
- [ ] No JavaScript console errors

#### Button Interactions
- [ ] Buttons show loading state when clicked
- [ ] Button hover effects work
- [ ] Button animations are smooth
- [ ] No broken functionality

#### Navigation Flow
- [ ] Landing → Login → Map (after authentication)
- [ ] Landing → Signup → Map (after registration)
- [ ] All internal links work correctly
- [ ] No 404 errors for any pages

#### Mobile Responsiveness
- [ ] Site works on mobile devices
- [ ] Buttons are touch-friendly
- [ ] Layout adapts to different screen sizes
- [ ] No horizontal scrolling issues

## Common Issues and Solutions

### Issue: Buttons Not Working
**Symptoms:** Buttons don't respond to clicks, no navigation occurs
**Solutions:**
1. Check browser console for JavaScript errors
2. Verify all script files are loading (Network tab)
3. Ensure Firebase scripts load before custom scripts
4. Check for case sensitivity in file names

### Issue: 404 Errors for Resources
**Symptoms:** CSS/JS files not found, broken styling
**Solutions:**
1. Verify file paths are relative (not absolute)
2. Check that build process copies all files
3. Ensure file names match exactly (case sensitive)

### Issue: Firebase Authentication Not Working
**Symptoms:** Login/signup buttons don't function
**Solutions:**
1. Check Firebase configuration is correct
2. Verify Firebase scripts load in correct order
3. Check browser console for Firebase errors
4. Ensure Firebase project settings allow your domain

### Issue: Redirect Loops or Wrong Pages
**Symptoms:** Pages redirect incorrectly or infinitely
**Solutions:**
1. Check all href attributes use relative paths
2. Verify index.html redirects correctly
3. Remove any absolute paths (starting with /)

## Performance Testing

### 1. Page Load Speed
- [ ] Landing page loads in under 3 seconds
- [ ] Images load efficiently
- [ ] No render-blocking resources

### 2. JavaScript Performance
- [ ] No memory leaks in console
- [ ] Smooth animations and transitions
- [ ] Responsive button interactions

### 3. Mobile Performance
- [ ] Touch interactions work smoothly
- [ ] No lag on mobile devices
- [ ] Efficient resource loading

## Security Testing

### 1. Input Validation
- [ ] Form inputs are properly sanitized
- [ ] XSS protection is working
- [ ] No sensitive data in console logs

### 2. Authentication Security
- [ ] Firebase security rules are properly configured
- [ ] No API keys exposed inappropriately
- [ ] Secure authentication flow

## Automated Testing Commands

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build for production
npm run build

# Test built version locally
npx serve -s public

# Deploy to GitHub Pages (if configured)
npm run deploy
```

## Troubleshooting Checklist

If buttons are not working on the deployed site:

1. **Check Console Errors**
   - Open browser developer tools
   - Look for JavaScript errors in Console tab
   - Check Network tab for failed resource loads

2. **Verify File Paths**
   - Ensure all links use relative paths
   - Check that referenced files exist
   - Verify case sensitivity matches

3. **Test JavaScript Loading**
   - Confirm Firebase scripts load first
   - Check that custom scripts load after Firebase
   - Verify no syntax errors in JavaScript files

4. **Check GitHub Pages Settings**
   - Ensure Pages is enabled in repository settings
   - Verify correct branch is selected for deployment
   - Check that workflow has proper permissions

5. **Test Different Browsers**
   - Try Chrome, Firefox, Safari, Edge
   - Test on both desktop and mobile
   - Check for browser-specific issues

## Success Criteria

The deployment is successful when:
- [ ] All buttons on landing page work correctly
- [ ] Navigation between pages functions properly
- [ ] No JavaScript console errors
- [ ] All CSS styles are applied correctly
- [ ] Site works on multiple browsers and devices
- [ ] Authentication flow works end-to-end
- [ ] No 404 errors for any resources
