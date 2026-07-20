# Custom Domain Setup Instructions

## Domain: izzysignature.lk

### Step 1: Purchase Domain
If you haven't already, purchase the domain `izzysignature.lk` from a domain registrar like:
- Namecheap
- GoDaddy
- Domain.com
- Or a Sri Lankan registrar like .lk registrations

### Step 2: Add Domain in Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `izzy-signature`
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `izzysignature.lk`
6. Click **Add**

### Step 3: Configure DNS Records

For the root domain (`izzysignature.lk`):
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600 (or default)
```

For the www subdomain (`www.izzysignature.lk`):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or default)
```

### Step 4: Configure Redirect (Optional)
To redirect `www.izzysignature.lk` to `izzysignature.lk`:
1. In Vercel Dashboard → Settings → Domains
2. Find `www.izzysignature.lk`
3. Click **Edit**
4. Set **Redirect to** as `izzysignature.lk`
5. Click **Save**

### Step 5: Wait for DNS Propagation
DNS changes can take anywhere from a few minutes to 48 hours to propagate worldwide. You can check propagation status using:
- https://dnschecker.org/
- https://whatsmydns.net/

### Step 6: Verify SSL Certificate
Vercel will automatically provision an SSL certificate for your domain. Once DNS propagates:
1. Go to Vercel Dashboard → Settings → Domains
2. Check that the certificate status is **Valid**
3. The lock icon should appear in your browser

### Step 7: Update Environment Variables (If Needed)
If you need to update your `ALLOWED_ORIGINS` environment variable:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find `ALLOWED_ORIGINS`
3. Update to include your custom domain: `https://izzysignature.lk,https://www.izzysignature.lk`
4. Redeploy your application

### Step 8: Test Your Domain
Once DNS propagates, test:
- Homepage: `https://izzysignature.lk`
- Order form: `https://izzysignature.lk/order`
- Admin panel: `https://izzysignature.lk/admin`
- API health: `https://izzysignature.lk/api/health`

### Troubleshooting

**Domain not working:**
- Check DNS records are correct
- Wait for DNS propagation (use dnschecker.org)
- Verify domain is pointed to Vercel's servers

**SSL certificate not working:**
- Ensure DNS is fully propagated
- Check that domain is added correctly in Vercel
- Wait a bit longer for SSL provisioning

**Redirects not working:**
- Verify redirect configuration in Vercel Dashboard
- Check that both domains are added to the project

**API not working with custom domain:**
- Update `ALLOWED_ORIGINS` environment variable
- Redeploy the application
- Check CORS configuration

### Current Deployment URLs
- **Vercel URL**: https://izzy-signature.vercel.app
- **Custom Domain**: https://izzysignature.lk (once configured)
