# Railway Deployment Guide - Mosaic-Me Web Application

This guide will walk you through deploying the Mosaic-Me web application to Railway. Railway provides an all-in-one platform for hosting the frontend, backend, and PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Railway Account Setup](#railway-account-setup)
3. [Prepare Your Project](#prepare-your-project)
4. [Deploy to Railway](#deploy-to-railway)
5. [Configure Environment Variables](#configure-environment-variables)
6. [Run Database Migrations](#run-database-migrations)
7. [Create Admin User](#create-admin-user)
8. [Update Frontend Configuration](#update-frontend-configuration)
9. [Testing Your Deployment](#testing-your-deployment)
10. [Troubleshooting](#troubleshooting)
11. [Post-Deployment](#post-deployment)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ A GitHub account
- ✅ Your Mosaic-Me project pushed to a GitHub repository
- ✅ A credit/debit card (required for Railway account, even on free tier)
- ✅ Access to your project's GitHub repository
- ✅ Basic understanding of environment variables

**Estimated Time**: 30-45 minutes

---

## Railway Account Setup

### Step 1: Create Railway Account

1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"** in the top right
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub account
5. You'll be redirected to the Railway dashboard

### Step 2: Add Payment Method

**Important**: Railway requires a payment method even for the free tier. You won't be charged unless you exceed the free tier limits.

1. Click on your profile icon (top right)
2. Select **"Account Settings"**
3. Go to **"Billing"** tab
4. Click **"Add Payment Method"**
5. Enter your credit/debit card details
6. Click **"Save"**

**Free Tier Limits**:
- $5 of usage per month (includes compute, memory, and database)
- Typically sufficient for small to medium traffic applications

---

## Prepare Your Project

### Step 1: Verify Deployment Files

Ensure the following files exist in your project (they should have been created):

```bash
# Backend files
backend/Dockerfile
backend/.dockerignore
backend/scripts/run_migrations.sh

# Frontend files
frontend/Dockerfile
frontend/.dockerignore
frontend/nginx.conf
```

### Step 2: Make Migration Script Executable

```bash
chmod +x backend/scripts/run_migrations.sh
chmod +x backend/scripts/create_admin.py
```

### Step 3: Commit and Push All Changes

```bash
# Add all deployment files
git add .

# Commit
git commit -m "Add Railway deployment configuration"

# Push to GitHub
git push origin main
```

**Important**: Ensure your `.env` files are in `.gitignore` and NOT pushed to GitHub.

---

## Deploy to Railway

### Step 1: Create a New Project

1. Go to your Railway dashboard: [https://railway.app/dashboard](https://railway.app/dashboard)
2. Click **"+ New Project"**
3. Select **"Deploy from GitHub repo"**
4. If prompted, click **"Configure GitHub App"** and grant access to your repository
5. Select your **mosaic-me-web** repository from the list

### Step 2: Add PostgreSQL Database

1. In your project dashboard, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway will automatically provision a PostgreSQL database
5. Wait for the database to be ready (status shows "Active")

### Step 3: Deploy Backend Service

1. In your project dashboard, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your **mosaic-me-web** repository
4. Railway will detect your project structure

**Configure Backend Service**:

1. Click on the newly created service
2. Go to **"Settings"** tab
3. Under **"Build"**, set:
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `backend/Dockerfile`
4. Under **"Deploy"**, enable:
   - ✅ **Watch Paths**: `backend/**`
5. Click **"Save"**

**Add Domain** (optional but recommended):

1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Railway will provide a URL like: `https://your-backend-production.up.railway.app`
5. **Copy this URL** - you'll need it for the frontend configuration

### Step 4: Deploy Frontend Service

1. In your project dashboard, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your **mosaic-me-web** repository again

**Configure Frontend Service**:

1. Click on the service
2. Go to **"Settings"** tab
3. Under **"Build"**, set:
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `frontend/Dockerfile`
4. Under **"Deploy"**, enable:
   - ✅ **Watch Paths**: `frontend/**`
5. Under **"Networking"**, set:
   - **Port**: `80`
6. Click **"Save"**

**Add Domain**:

1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Railway will provide a URL like: `https://your-frontend-production.up.railway.app`
5. **Copy this URL** - this is your public application URL

---

## Configure Environment Variables

### Step 1: Backend Environment Variables

1. Go to your **Backend service** in Railway
2. Click on **"Variables"** tab
3. Click **"+ New Variable"**
4. Add the following variables one by one:

#### Required Backend Variables:

```bash
# Server Configuration
HOST=0.0.0.0
PORT=${PORT}
CORS_ORIGINS=https://your-frontend-production.up.railway.app

# Database (Railway auto-generates this, but verify it's set)
DATABASE_URL=${DATABASE_URL}

# Security - Generate these with the commands below
JWT_SECRET_KEY=<paste-your-generated-key>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Analytics
ANALYTICS_SALT=<paste-your-generated-salt>
```

**Generate Secure Keys**:

On your local machine, run:

```bash
# Generate JWT secret key
openssl rand -hex 32

# Generate analytics salt
openssl rand -hex 16
```

Copy the output and paste it into the respective Railway environment variables.

**Important Notes**:
- Replace `https://your-frontend-production.up.railway.app` with your actual frontend URL from Step 4
- `${DATABASE_URL}` is automatically provided by Railway when you add PostgreSQL
- `${PORT}` is automatically provided by Railway

### Step 2: Frontend Environment Variables

1. Go to your **Frontend service** in Railway
2. Click on **"Variables"** tab
3. Click **"+ New Variable"**
4. Add the following variable:

```bash
VITE_API_URL=https://your-backend-production.up.railway.app/api/v1
```

Replace `https://your-backend-production.up.railway.app` with your actual backend URL from Step 3.

### Step 3: Trigger Redeploy

After adding environment variables:

1. Go to **"Deployments"** tab for both services
2. Click **"Redeploy"** button (or Railway will auto-deploy)
3. Wait for both services to finish deploying (status shows "Success")

---

## Run Database Migrations

### Step 1: Access Backend Shell

1. Go to your **Backend service** in Railway
2. Click on **"Deployments"** tab
3. Find the latest successful deployment
4. Click on the three dots (**...**) next to the deployment
5. Select **"Open Shell"** or **"View Logs"**

**If "Open Shell" is not available**, you can run migrations locally:

### Option A: Using Railway CLI (Recommended)

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   railway link
   ```
   Select your project from the list.

4. Run migrations:
   ```bash
   railway run bash backend/scripts/run_migrations.sh
   ```

### Option B: Using Database Client (Alternative)

1. Go to your **PostgreSQL database** service in Railway
2. Click on **"Connect"** tab
3. Copy the **"Postgres Connection URL"**
4. On your local machine, run:

```bash
# Run migration 001
psql "postgresql://..." -f backend/migrations/001_initial_schema.sql

# Run migration 002
psql "postgresql://..." -f backend/migrations/002_admin_auth_analytics.sql
```

Replace `"postgresql://..."` with your actual connection URL.

### Step 2: Verify Migrations

Check if migrations ran successfully:

```bash
# Using Railway CLI
railway run psql $DATABASE_URL -c "\dt"

# Or using connection URL
psql "postgresql://..." -c "\dt"
```

You should see tables like: `admins`, `analytics_events`, `visitor_sessions`, etc.

---

## Create Admin User

### Step 1: Run Admin Creation Script

#### Using Railway CLI:

```bash
railway run python backend/scripts/create_admin.py
```

Follow the prompts:
- **Email**: Enter your admin email (e.g., `admin@yourdomain.com`)
- **Password**: Enter a strong password
- **Full Name**: Enter your name

#### Using Railway Shell:

1. Open shell for backend service
2. Run:
   ```bash
   python scripts/create_admin.py
   ```

### Step 2: Verify Admin User Created

```bash
railway run psql $DATABASE_URL -c "SELECT email, full_name FROM admins;"
```

You should see your admin user listed.

---

## Update Frontend Configuration

### Important: CORS Update

Since Railway provides specific URLs for your services, you need to ensure CORS is properly configured.

1. Go to **Backend service** → **"Variables"**
2. Find the `CORS_ORIGINS` variable
3. Update it to include your frontend URL:
   ```
   https://your-frontend-production.up.railway.app
   ```
4. If you plan to use a custom domain later, add it here (comma-separated):
   ```
   https://your-frontend-production.up.railway.app,https://yourdomain.com
   ```
5. Save and redeploy

---

## Testing Your Deployment

### Step 1: Access Your Application

1. Go to your **Frontend service** in Railway
2. Copy the **domain URL** (e.g., `https://your-frontend-production.up.railway.app`)
3. Open it in your browser

### Step 2: Test Basic Functionality

**Test Image Upload**:
1. Upload a test image
2. Select baseplate size and piece type
3. Click "Generate Mosaic"
4. Verify the mosaic generates successfully
5. Try downloading exports (PNG, CSV)

**Test Mosaic Editor**:
1. After generating a mosaic, click "Edit Mosaic"
2. Test brush tool (select pixels)
3. Test fill tool (select connected regions)
4. Select a color from the palette
5. Test undo/redo
6. Save changes and verify preview updates

**Test Admin Dashboard**:
1. Navigate to `/admin` (e.g., `https://your-frontend-production.up.railway.app/admin`)
2. Login with your admin credentials
3. Verify analytics dashboard loads
4. Check that visitor data is being tracked

### Step 3: Monitor Logs

**Backend Logs**:
1. Go to **Backend service** → **"Deployments"**
2. Click on latest deployment
3. View logs for any errors

**Frontend Logs**:
1. Go to **Frontend service** → **"Deployments"**
2. Click on latest deployment
3. View logs for any errors

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **Backend Returns 500 Error**

**Symptoms**: API calls fail, backend logs show errors

**Solutions**:
- Check `DATABASE_URL` is set correctly
- Verify migrations ran successfully
- Check backend logs for specific error messages
- Ensure `CORS_ORIGINS` includes your frontend URL

**Fix**:
```bash
# Re-run migrations
railway run bash backend/scripts/run_migrations.sh

# Check database connection
railway run psql $DATABASE_URL -c "SELECT 1;"
```

#### 2. **CORS Errors in Browser**

**Symptoms**: Browser console shows CORS policy errors

**Solutions**:
- Verify `CORS_ORIGINS` in backend includes correct frontend URL
- Ensure frontend `VITE_API_URL` points to correct backend URL
- Check for trailing slashes (should NOT have trailing slash)

**Fix**:
1. Backend → Variables → Update `CORS_ORIGINS`
2. Frontend → Variables → Update `VITE_API_URL`
3. Redeploy both services

#### 3. **Frontend Shows Blank Page**

**Symptoms**: Application loads but shows nothing

**Solutions**:
- Check browser console for errors
- Verify `VITE_API_URL` is set correctly
- Ensure frontend built successfully

**Fix**:
1. Check frontend deployment logs
2. Rebuild frontend service
3. Clear browser cache and reload

#### 4. **Admin Login Fails**

**Symptoms**: Cannot login to admin dashboard

**Solutions**:
- Verify admin user was created successfully
- Check `JWT_SECRET_KEY` is set in backend variables
- Ensure password was entered correctly during creation

**Fix**:
```bash
# Recreate admin user
railway run python backend/scripts/create_admin.py
```

#### 5. **Database Connection Issues**

**Symptoms**: Backend can't connect to database

**Solutions**:
- Verify PostgreSQL service is running
- Check `DATABASE_URL` is set correctly
- Ensure database is in same Railway project

**Fix**:
1. Go to PostgreSQL service → Verify it's "Active"
2. Backend → Variables → Check `DATABASE_URL` is set
3. Restart backend service

#### 6. **Image Upload Fails**

**Symptoms**: Mosaic generation fails during upload

**Solutions**:
- Check file size (max 10MB)
- Verify backend has enough memory
- Check backend logs for specific errors

**Fix**:
- Upgrade Railway plan if memory limits exceeded
- Check backend deployment logs

---

## Post-Deployment

### 1. Custom Domain (Optional)

#### Add Custom Domain to Frontend:

1. Purchase a domain (e.g., from Namecheap, Google Domains)
2. Go to **Frontend service** → **"Settings"** → **"Domains"**
3. Click **"Custom Domain"**
4. Enter your domain (e.g., `mosaic-me.com`)
5. Railway will provide DNS records (CNAME or A record)
6. Add these DNS records in your domain registrar
7. Wait for DNS propagation (5-60 minutes)
8. Update backend `CORS_ORIGINS` to include new domain

#### Add Custom Domain to Backend (Optional):

1. Go to **Backend service** → **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Enter subdomain (e.g., `api.mosaic-me.com`)
4. Add DNS records
5. Update frontend `VITE_API_URL` to use new domain

### 2. Enable HTTPS (Automatic)

Railway automatically provides SSL certificates for all domains (both Railway and custom). No additional configuration needed.

### 3. Monitoring and Alerts

**Set Up Usage Alerts**:
1. Go to **Account Settings** → **"Billing"**
2. Set usage threshold alerts
3. Railway will email you if you approach limits

**Monitor Service Health**:
1. Check **"Deployments"** tab regularly
2. Review logs for errors
3. Monitor database usage in PostgreSQL service

### 4. Backup Database

**Export Database Regularly**:

```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Or using connection URL
pg_dump "postgresql://..." > backup-$(date +%Y%m%d).sql
```

Store backups in a secure location (e.g., Google Drive, Dropbox).

### 5. Scaling (If Needed)

If your application grows:

1. Go to **Backend service** → **"Settings"**
2. Adjust **"Resources"**:
   - Increase memory
   - Add replicas for high availability
3. Upgrade to **Railway Pro** for:
   - More resources
   - Priority support
   - Higher usage limits

### 6. Environment Management

**Best Practices**:
- Never commit `.env` files to GitHub
- Rotate `JWT_SECRET_KEY` periodically for security
- Use different secrets for staging/production if you create multiple environments
- Document all environment variables

### 7. Continuous Deployment

Railway automatically deploys when you push to GitHub:

1. Make changes to your code locally
2. Commit and push to GitHub
3. Railway automatically detects changes
4. Services rebuild and redeploy automatically
5. Check deployment logs to verify success

---

## Cost Estimation

### Railway Pricing (as of 2024)

**Free Tier**:
- $5 credit per month
- Suitable for:
  - Low traffic sites (< 1000 visitors/month)
  - Development/testing
  - Personal projects

**Typical Usage for Mosaic-Me**:
- PostgreSQL: ~$1-2/month
- Backend service: ~$2-3/month
- Frontend service: ~$1/month
- **Total**: ~$4-6/month

**If you exceed free tier**, Railway charges:
- Compute: ~$0.000008/GB-second
- Memory: ~$0.000002/GB-second
- Database storage: ~$0.25/GB-month

**Cost-Saving Tips**:
1. Optimize Docker images (use multi-stage builds)
2. Implement caching to reduce compute
3. Monitor usage regularly
4. Scale down during low-traffic periods

---

## Deployment Checklist

Use this checklist to ensure everything is set up correctly:

### Pre-Deployment
- [ ] GitHub repository is up to date
- [ ] All deployment files committed and pushed
- [ ] Railway account created with payment method
- [ ] Generated secure keys (JWT_SECRET_KEY, ANALYTICS_SALT)

### Railway Setup
- [ ] PostgreSQL database created and active
- [ ] Backend service deployed with correct Dockerfile
- [ ] Frontend service deployed with correct Dockerfile
- [ ] Backend domain generated and copied
- [ ] Frontend domain generated and copied

### Environment Variables
- [ ] Backend variables configured (DATABASE_URL, JWT_SECRET_KEY, CORS_ORIGINS, etc.)
- [ ] Frontend variables configured (VITE_API_URL)
- [ ] Both services redeployed after adding variables

### Database
- [ ] Migrations ran successfully (001 and 002)
- [ ] Tables verified with `\dt` command
- [ ] Admin user created
- [ ] Admin user verified in database

### Testing
- [ ] Frontend loads without errors
- [ ] Image upload and mosaic generation works
- [ ] Mosaic editor works (brush, fill, undo/redo)
- [ ] Downloads work (PNG, CSV)
- [ ] Admin login works
- [ ] Analytics dashboard shows data
- [ ] No CORS errors in browser console

### Optional
- [ ] Custom domain configured
- [ ] DNS records added
- [ ] Database backup scheduled
- [ ] Usage alerts configured

---

## Support and Resources

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)

### Mosaic-Me Resources
- [GitHub Repository](https://github.com/jonathantiedchen/mosaic-me-web)
- [Project README](./README.md)
- [Technical Specifications](./SPECIFICATIONS.md)

### Getting Help

If you encounter issues:

1. **Check logs** first (Railway → Service → Deployments → View Logs)
2. **Review this guide's troubleshooting section**
3. **Search Railway Discord** for similar issues
4. **Create GitHub issue** with detailed error messages
5. **Contact Railway support** (Pro plan includes priority support)

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Share your application URL
3. ✅ Monitor usage and performance
4. ✅ Set up regular database backups
5. ✅ Consider adding custom domain
6. ✅ Implement analytics monitoring
7. ✅ Plan for scaling if traffic grows

**Congratulations!** Your Mosaic-Me application is now live on Railway! 🎉

---

*Last Updated: December 2024*
*Mosaic-Me Version: 2.0.0*
