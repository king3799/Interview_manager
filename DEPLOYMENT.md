# Deployment Guide - Interview Manager

This guide explains how to deploy the Interview Manager application to Vercel with Neon PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Git installed on your local machine

## Step 1: Prepare Your Repository

1. **Initialize Git repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `interview-manager`)
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/interview-manager.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Click "Add New..." → "Project"

2. **Import Repository**:
   - Select your GitHub account
   - Find and import your `interview-manager` repository
   - Click "Import"

3. **Configure Project**:
   - Framework Preset: **Next.js** (should be auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

## Step 3: Add Neon PostgreSQL Database

1. **In Vercel Project Settings**:
   - Go to your project
   - Click on "Storage" tab
   - Click "Create Database"
   - Select "Postgres" (Neon)
   - Click "Continue"
   - Choose region (select closest to your users)
   - Click "Create"

2. **Neon database will be automatically connected**:
   - Vercel will add `DATABASE_URL` environment variable
   - Vercel will also add other Neon-related variables

## Step 4: Configure Environment Variables

1. **In Vercel Project Settings**:
   - Go to "Settings" → "Environment Variables"
   - Add the following variables:

   **AUTH_SECRET**:
   ```
   Value: Generate a random secret (see below)
   Environment: Production, Preview, Development
   ```

   **AUTH_URL**:
   ```
   Value: https://your-app.vercel.app (use your actual Vercel URL)
   Environment: Production
   ```

   For Preview:
   ```
   Value: https://your-app-git-*.vercel.app
   Environment: Preview
   ```

2. **Generate AUTH_SECRET**:
   Run this command locally:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and use it as `AUTH_SECRET` value.

## Step 5: Run Database Migrations

After the first deployment, you need to set up the database schema:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

4. **Pull environment variables**:
   ```bash
   vercel env pull
   ```

5. **Run migrations**:
   ```bash
   npm run db:push
   ```

   Or if you prefer migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Step 6: Seed Admin User

Create the initial admin account:

```bash
npm run db:seed
```

This will create:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

## Step 7: Verify Deployment

1. Visit your Vercel app URL: `https://your-app.vercel.app`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. Change the password in Profile settings
4. Create additional users in Admin → Users

## Environment Variables Summary

Required environment variables for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Auto-added by Vercel |
| `AUTH_SECRET` | NextAuth secret key | Random 32-char string |
| `AUTH_URL` | Your app URL | `https://your-app.vercel.app` |

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check that `DATABASE_URL` is correctly set in Vercel
2. Verify Neon database is active
3. Check if migrations were run successfully

### Authentication Issues

If login doesn't work:

1. Verify `AUTH_SECRET` is set
2. Check `AUTH_URL` matches your domain
3. Clear browser cookies and try again

### Build Failures

If build fails:

1. Check build logs in Vercel dashboard
2. Verify all dependencies are in `package.json`
3. Run `npm run build` locally to test

## Post-Deployment Checklist

- [ ] Admin user created and password changed
- [ ] Additional users created
- [ ] Test all CRUD operations
- [ ] Test role-based permissions
- [ ] Test filters and search
- [ ] Test Excel export
- [ ] Verify timezone conversions
- [ ] Check mobile responsiveness

## Updating the Application

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Vercel will automatically deploy the changes.

## Database Backup

Neon provides automatic backups. To access:

1. Go to Neon Console: https://console.neon.tech
2. Select your project
3. Go to "Backups" tab
4. You can restore or download backups

## Support

For issues or questions:
- Check Vercel docs: https://vercel.com/docs
- Check Neon docs: https://neon.tech/docs
- Check Next.js docs: https://nextjs.org/docs

## Security Notes

1. **Change default admin password immediately**
2. Use strong passwords for all users
3. Keep `AUTH_SECRET` secure and never commit it
4. Regularly update dependencies
5. Monitor Vercel logs for suspicious activity
6. Consider adding rate limiting for production

## Costs

- **Vercel Hobby Plan**: Free for personal projects
- **Neon Free Tier**: 
  - 0.5 GB storage
  - 10 GB data transfer per month
  - Sufficient for small teams

For larger deployments, check pricing:
- Vercel: https://vercel.com/pricing
- Neon: https://neon.tech/pricing
