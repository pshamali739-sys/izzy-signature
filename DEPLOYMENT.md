# Deployment Guide - Izzy Signature Order System

## Environment Variables

### Frontend (Vite/React)
These variables are prefixed with `VITE_` and are exposed to the client-side code.

```
VITE_API_URL=https://your-vercel-app.vercel.app/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (Express/Serverless)
These variables are used in the serverless functions and are NOT exposed to the client.

```
PORT=3001
JWT_SECRET=your-long-random-secret-string
ADMIN_EMAIL=admin@izzy.com
ADMIN_PASSWORD=your-admin-password
ALLOWED_ORIGINS=https://izzysignature.lk,https://www.izzysignature.lk
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-secret-key
```

## How to Get These Values

### Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy:
   - `Project URL` → SUPABASE_URL
   - `anon public` key → VITE_SUPABASE_ANON_KEY
   - `service_role` key → SUPABASE_SERVICE_KEY (NEVER share this)

### JWT Secret
Generate a secure random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Admin Credentials
Choose secure credentials for the admin dashboard:
```
ADMIN_EMAIL=admin@izzy.com
ADMIN_PASSWORD=your-secure-password
```

## Vercel Deployment

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy
```bash
vercel
```

### Step 4: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

**Frontend Variables:**
- `VITE_API_URL` = Your deployed API URL
- `VITE_SUPABASE_URL` = Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key

**Backend Variables:**
- `JWT_SECRET` = Your generated JWT secret
- `ADMIN_EMAIL` = Your admin email
- `ADMIN_PASSWORD` = Your admin password
- `ALLOWED_ORIGINS` = `https://izzysignature.lk,https://www.izzysignature.lk`
- `SUPABASE_URL` = Your Supabase project URL
- `SUPABASE_SERVICE_KEY` = Your Supabase service role key

### Step 5: Redeploy
After adding environment variables, redeploy:
```bash
vercel --prod
```

## Custom Domain Setup

### 1. Add Domain in Vercel
- Go to Vercel Dashboard → Settings → Domains
- Add `izzysignature.lk`
- Add `www.izzysignature.lk`

### 2. Configure DNS Records
For `izzysignature.lk`:
```
Type: A
Name: @
Value: 76.76.21.21
```

For `www.izzysignature.lk`:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. Configure Redirect
In Vercel Dashboard → Settings → Domains:
- Add redirect from `www.izzysignature.lk` → `izzysignature.lk`

## Production Checklist

- [ ] Homepage loads correctly
- [ ] Product pages load
- [ ] Order form submits successfully
- [ ] Orders save to Supabase
- [ ] Admin login works
- [ ] Dashboard displays statistics
- [ ] Mobile responsive design
- [ ] HTTPS enabled
- [ ] No console errors
- [ ] No build errors
- [ ] Custom domain configured
- [ ] DNS records propagated
- [ ] SSL certificate active

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` is correct
- Verify CORS settings in backend
- Check environment variables are set in Vercel

### Supabase Connection Issues
- Verify `SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Verify RLS policies are correct

### Build Errors
- Check all dependencies are in package.json
- Verify Node.js version compatibility
- Check for missing environment variables
