# Deployment Guide - Turso DB + Vercel

This guide explains how to deploy your Neon Sign Generator application to Vercel using Turso DB.

## Prerequisites

1. [Vercel Account](https://vercel.com/signup)
2. [Turso Account](https://turso.tech/) with database created
3. [Vercel CLI](https://vercel.com/docs/cli) (optional, for local testing)

## Turso Database Setup

### 1. Your Turso Credentials

You've been provided with:
- **Database URL**: `libsql://hnhapp-kashmiroptics.aws-ap-south-1.turso.io`
- **Auth Token**: Already configured in `config/config.local.php`

### 2. Initialize Your Turso Database

Run the initialization script to create all required tables:

```bash
php database/init-turso.php
```

This will:
- Create all tables (orders, discount_codes, admin_users, etc.)
- Set up indexes for performance
- Create triggers for auto-updating timestamps
- Insert default admin user and sample data

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123` (⚠️ **CHANGE THIS IMMEDIATELY**)

## Vercel Deployment

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Import project in Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your repository

3. **Configure Environment Variables**
   
   Add these environment secrets in Vercel project settings:
   
   ```
   DB_TYPE=turso
   TURSO_DB_URL=libsql://hnhapp-kashmiroptics.aws-ap-south-1.turso.io
   TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjkwNzc5OTAsImlkIjoiNjJhYzY0ZDUtOTU2YS00YWVlLTk0YTctZDUzOGZlYzBkZDRhIiwicmlkIjoiZGUzYjcwN2MtZjExZC00NGIyLWEzMGQtMTRjMTE1YTI4NTIwIn0.7Ke8CeAuV2QnGkmNuNk9iYrs96i95ajhk6909IcXU0n00y8zeKPNX277uv9jrCe91q8LmXaXG-UZVaBjKya9AA
   APP_ENV=production
   API_KEY=your-secret-api-key
   STRIPE_PUBLIC_KEY=your-stripe-public-key
   STRIPE_SECRET_KEY=your-stripe-secret-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Set Environment Variables**
   ```bash
   vercel env add TURSO_DB_URL
   vercel env add TURSO_AUTH_TOKEN
   vercel env add DB_TYPE
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

### 1. Initialize the Database (if not done locally)

After deployment, you can initialize the database by:

**Option A:** Run locally (recommended)
```bash
php database/init-turso.php
```

**Option B:** Create a temporary setup endpoint
- Create `api/setup.php` with the initialization script
- Visit `https://your-app.vercel.app/api/setup.php` once
- Delete the file immediately after setup

### 2. Verify Database Connection

Visit your deployed site and check:
- `/api/health` - Should return database connection status
- `/admin/` - Admin login should work

### 3. Change Default Admin Password

1. Login to `/admin/` with:
   - Username: `admin`
   - Password: `admin123`
2. Change password immediately in admin settings

### 4. Configure Stripe (if using payments)

Update environment variables with your Stripe keys:
```
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## File Structure

```
├── api/                    # API endpoints
├── admin/                  # Admin panel
├── config/
│   ├── config.php         # Main configuration
│   └── config.local.php   # Local overrides (Turso config)
├── database/
│   ├── schema.sql         # MySQL schema (legacy)
│   ├── schema.sqlite.sql  # SQLite/Turso schema
│   └── init-turso.php     # Database initialization script
├── includes/
│   └── Database.php       # Database class (supports MySQL & Turso)
├── vercel.json            # Vercel configuration
└── composer.json          # PHP dependencies
```

## Configuration Files

### config/config.local.php
Contains Turso-specific configuration. This file is already set up with your credentials.

### vercel.json
Configures Vercel routing and PHP runtime. No changes needed.

## Troubleshooting

### Database Connection Errors

**Error: "Turso connection failed"**
- Verify `TURSO_DB_URL` and `TURSO_AUTH_TOKEN` are correctly set
- Check that your Turso database is active

**Error: "Table not found"**
- Run the initialization script: `php database/init-turso.php`

### Vercel Deployment Issues

**Error: "Function execution timeout"**
- Increase timeout in `vercel.json` (max 10s on Hobby plan, 60s on Pro)
- Optimize database queries

**Error: "Missing PHP extension"**
- Check `composer.json` for required extensions
- Vercel's PHP runtime includes: PDO, JSON, mbstring, curl, openssl

### Performance Issues

1. **Add indexes** for frequently queried columns
2. **Enable caching** for static assets
3. **Optimize queries** to reduce API calls to Turso

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_TYPE` | Database type (`turso` or `mysql`) | Yes |
| `TURSO_DB_URL` | Turso database URL | Yes (if using Turso) |
| `TURSO_AUTH_TOKEN` | Turso authentication token | Yes (if using Turso) |
| `APP_ENV` | Environment (`production` or `development`) | Yes |
| `API_KEY` | Secret API key | Yes |
| `STRIPE_PUBLIC_KEY` | Stripe publishable key | For payments |
| `STRIPE_SECRET_KEY` | Stripe secret key | For payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | For webhooks |
| `SMTP_HOST` | SMTP server host | For emails |
| `SMTP_PORT` | SMTP server port | For emails |
| `SMTP_USERNAME` | SMTP username | For emails |
| `SMTP_PASSWORD` | SMTP password | For emails |

## Security Considerations

1. **Never commit** `config/config.local.php` or `.env` files
2. **Use environment variables** for sensitive data in production
3. **Change default admin password** immediately after setup
4. **Use HTTPS** (Vercel provides this automatically)
5. **Rotate API keys** regularly
6. **Enable CORS** only for trusted domains

## Support

- [Turso Documentation](https://docs.turso.tech/)
- [Vercel Documentation](https://vercel.com/docs)
- [PHP on Vercel](https://vercel.com/docs/runtimes#official-runtimes/php)

## Next Steps

1. ✅ Initialize Turso database
2. ✅ Deploy to Vercel
3. ⬜ Change admin password
4. ⬜ Configure Stripe keys
5. ⬜ Set up custom domain
6. ⬜ Test order workflow
7. ⬜ Configure email notifications
