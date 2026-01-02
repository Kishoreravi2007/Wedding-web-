# 🔧 Fix: Cannot Access Subdomains Directly (SPA Routing Issue)

## ❌ The Problem

When you try to directly visit URLs like:
- `weddingweb.co.in/parvathy/photobooth`
- `weddingweb.co.in/sreedevi/gallery`
- `weddingweb.co.in/photographer`

You get a **404 error** or **blank page**.

### Why This Happens

Your website is a **Single Page Application (SPA)**. When you directly access a route:

1. The browser requests `/parvathy/photobooth` from the server
2. Server looks for a file called `/parvathy/photobooth/index.html`
3. File doesn't exist → 404 error
4. React Router never gets a chance to handle the route

### The Solution

Tell the server: **"For any route, always serve index.html and let React Router handle it"**

---

## ✅ Solution by Hosting Platform

### 🔍 First: Identify Where Your Frontend is Hosted

Your domain is `weddingweb.co.in`. Let's find where it's hosted:

**Check using browser:**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Reload your homepage
4. Look at response headers for:
   - `server: netlify` → It's on Netlify
   - `x-vercel-id` → It's on Vercel
   - `cf-ray` → It's on Cloudflare Pages
   - `x-served-by` → Might be another CDN

---

## 📝 Fixes by Platform

### If Hosted on **Netlify**:

#### Option 1: Using `_redirects` file (Already done ✅)

Your `frontend/public/_redirects` file already has:
```
/* /index.html 200
```

**But check if it's being deployed:**

1. Build locally:
```bash
cd frontend
npm run build
```

2. Check if `_redirects` exists in `dist/`:
```bash
ls dist/_redirects
# Should see the file
```

3. If missing, the vite.config.ts needs fixing (but yours is already correct!)

#### Option 2: Using `netlify.toml` (Alternative)

Create `frontend/netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### If Hosted on **Vercel**:

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### If Hosted on **Cloudflare Pages**:

Create `frontend/public/_redirects`:
```
/* /index.html 200
```

(Same as Netlify - already done!)

### If Hosted on **Render** (Static Site):

Create `frontend/render.yaml`:
```yaml
services:
  - type: web
    name: wedding-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### If Hosted on **Apache Server**:

Create `frontend/public/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### If Hosted on **Nginx Server**:

Add to your nginx config:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## 🚀 Quick Fix Steps

### Step 1: Verify _redirects file exists

```bash
cd frontend
cat public/_redirects
```

Should show: `/* /index.html 200`

### Step 2: Rebuild and redeploy

```bash
# Build locally to test
cd frontend
npm run build

# Check _redirects in output
ls dist/_redirects
# OR on Windows:
dir dist\_redirects

# If it exists, commit and push
git add -A
git commit -m "Ensure _redirects is deployed for SPA routing"
git push origin main
```

### Step 3: Clear hosting platform cache

**For Netlify:**
1. Go to https://app.netlify.com
2. Find your site
3. Go to **Deploys**
4. Click **Trigger deploy** → **Clear cache and deploy site**

**For Vercel:**
1. Go to https://vercel.com/dashboard
2. Find your project
3. Go to **Deployments**
4. Click **...** → **Redeploy**

**For Cloudflare:**
1. Go to Cloudflare Dashboard
2. Find your Pages project
3. Go to **Deployments**
4. Click **Retry deployment**

### Step 4: Test after redeployment

Wait 2-3 minutes, then test:
- `weddingweb.co.in/parvathy/photobooth`
- `weddingweb.co.in/sreedevi/gallery`

Both should load correctly!

---

## 🔍 Debugging: If Still Not Working

### Test 1: Check if _redirects is deployed

Visit: `weddingweb.co.in/_redirects`

- **If you see the file content**: ✅ File is deployed
- **If you get 404**: ❌ File is not being deployed

### Test 2: Check build output locally

```bash
cd frontend
npm run build
ls -la dist/
```

Should see `_redirects` file in the list.

### Test 3: Manual verification

```bash
cat dist/_redirects
# Should show: /* /index.html 200
```

### Test 4: Check Vite config

Your `frontend/vite.config.ts` should have:
```typescript
import { viteStaticCopy } from "vite-plugin-static-copy";

plugins: [
  viteStaticCopy({
    targets: [
      {
        src: "public/_redirects",
        dest: "",
      },
    ],
  }),
],
```

✅ This is already correct in your code!

---

## 🎯 Most Likely Solution for Your Site

Since your `_redirects` file exists and vite config is correct, the issue is probably:

1. **Cache**: The old deployment without proper routing is cached
2. **Need to trigger a fresh deployment**

### Do this now:

```bash
# 1. Ensure clean build
cd frontend
rm -rf dist node_modules/.vite
npm run build

# 2. Verify _redirects in output
cat dist/_redirects

# 3. Force redeploy
git commit --allow-empty -m "Force redeploy for SPA routing fix"
git push origin main
```

### Then in your hosting dashboard:
1. **Clear all caches**
2. **Trigger new deployment**
3. **Wait 3-5 minutes**
4. **Test the routes**

---

## ✅ Success Indicators

After fixing, you should be able to:
- ✅ Directly visit `weddingweb.co.in/parvathy/photobooth`
- ✅ Refresh the page without getting 404
- ✅ Share direct links to any page
- ✅ Browser back/forward buttons work correctly
- ✅ Bookmarks to specific pages work

---

## 📞 Need More Help?

If still not working, tell me:
1. Where is your frontend hosted? (Check response headers)
2. What error do you see when accessing `/parvathy/photobooth`?
3. Can you access the root domain `weddingweb.co.in`?

This will help me give you the exact fix for your hosting setup!

