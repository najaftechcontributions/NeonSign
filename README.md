# Custom Neon Sign Generator

A web application for creating custom neon signs with real-time preview, pricing calculator, and order management.

## Features

- 🎨 Real-time neon sign preview with Fabric.js
- 🔤 50+ Google Fonts to choose from
- 🌈 15+ LED color options + custom colors
- 📏 Multiple size presets or custom dimensions
- 💰 Automatic pricing calculation
- 🖼️ Logo upload support
- 📱 Responsive design
- 🛒 Complete order management system
- 👨‍💼 Admin dashboard
- 📧 Email notifications
- 💳 Payment integration ready (Stripe)
- 📲 **PWA Support - Installable on Android/iOS devices**
- 🔌 **Offline functionality with Service Worker**
- 🚀 **Native app-like experience**

## Requirements

- **PHP** 7.4 or higher
- **MySQL** 5.7+ or **MariaDB** 10.2+
- **Apache** or **Nginx** web server
- **PHP Extensions:**
  - PDO
  - PDO_MySQL
  - GD or Imagick (for image processing)
  - mbstring
  - openssl
  - curl

## Installation Guide

### Step 1: Install Prerequisites

#### Option A: Using XAMPP (Recommended for beginners)
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start Apache and MySQL from XAMPP Control Panel

#### Option B: Using WAMP
1. Download and install [WAMP](https://www.wampserver.com/)
2. Start WAMP server

#### Option C: Using MAMP (for Mac)
1. Download and install [MAMP](https://www.mamp.info/)
2. Start MAMP server

### Step 2: Clone/Download the Project

If using XAMPP, place the project folder in:
- Windows: `C:\xampp\htdocs\neon-sign-generator`
- Mac/Linux: `/Applications/XAMPP/htdocs/neon-sign-generator`

### Step 3: Setup Database

1. Open **phpMyAdmin** in your browser:
   - XAMPP: `http://localhost/phpmyadmin`
   
2. Click on **SQL** tab

3. Copy and paste the entire content from `database/schema.sql`

4. Click **Go** to execute

This will create:
- Database: `neon_sign_db`
- Tables: orders, discount_codes, admin_users, email_logs, activity_logs, settings
- Default admin user
- Sample discount codes

### Step 4: Configure the Application

The configuration is already set up in `config/config.php` with default values that work with XAMPP/WAMP.

**Default Database Settings (already configured):**
- Host: `localhost`
- Database: `neon_sign_db`
- Username: `root`
- Password: (empty)

If you need to change settings, edit `config/config.php`

### Step 5: Create Upload Directories

The application will automatically create these folders when you first run it:
- `uploads/`
- `uploads/previews/`
- `uploads/logos/`

Make sure the web server has write permissions to these folders.

### Step 6: Access the Application

Open your browser and navigate to:
```
http://localhost/neon-sign-generator/
```

Or if you placed it directly in htdocs:
```
http://localhost/index.php
```

## Admin Panel Access

Access the admin panel at:
```
http://localhost/neon-sign-generator/admin/
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **IMPORTANT:** Change the default password immediately after first login!

## Project Structure

```
neon-sign-generator/
├── admin/                  # Admin panel files
│   ├── dashboard.php      # Main dashboard
│   ├── login.php         # Admin login
│   ├── logout.php        # Logout handler
│   └── order-detail.php  # Order details
├── api/                   # API endpoints
│   └── index.php         # Main API handler
├── config/               # Configuration files
│   └── config.php        # Main configuration
├── database/             # Database files
│   └── schema.sql        # Database schema
├── includes/             # PHP classes
│   ├── AdminAuth.php     # Admin authentication
│   ├── Database.php      # Database connection
│   ├── EmailService.php  # Email handling
│   └── Utils.php         # Utility functions
├── models/               # Data models
│   ├── DiscountCode.php  # Discount code model
│   └── Order.php         # Order model
├── uploads/              # Uploaded files (auto-created)
│   ├── previews/        # Preview images
│   └── logos/           # Uploaded logos
├── index.php            # Main application (PHP version)
├── index.html           # Static HTML version
├── script.js            # JavaScript functionality
├── styles.css           # Stylesheets
└── image.png           # Background image

```

## Usage

### For Customers

1. **Step 1 - Text & Color:**
   - Enter your text or upload a logo
   - Choose from 50+ fonts
   - Select LED color (15+ options)
   - Enable multicolor for different colors per letter

2. **Step 2 - Sign Size:**
   - Choose from preset sizes (Mini to 4XL)
   - Or enter custom dimensions
   - Select indoor/outdoor usage

3. **Step 3 - Sign Shape:**
   - Choose backboard shape (cut to shape, cut to letter, rectangle, open box)
   - Select backboard color (clear, white, black, silver, gold)

4. **Step 4 - More Options:**
   - Select power adapter region
   - Choose hanging options
   - Add remote/dimmer
   - Apply discount code
   - View final price and preview

### For Administrators

1. **Login** to admin panel
2. **View all orders** in dashboard
3. **Manage order status**
4. **Process payments**
5. **Update shipping information**
6. **Manage discount codes**

## Troubleshooting

### Common Issues

**1. Blank Page or Errors**
- Check if PHP is running: create a file `test.php` with `<?php phpinfo(); ?>` and open it
- Enable error reporting in `config/config.php` (already enabled)
- Check Apache error logs

**2. Database Connection Error**
- Verify MySQL is running in XAMPP/WAMP
- Check database credentials in `config/config.php`
- Ensure database was created using `schema.sql`

**3. Images Not Loading**
- Check if `image.png` exists in the root folder
- Verify upload folders have write permissions

**4. JavaScript Not Working**
- Check browser console for errors (F12)
- Ensure `script.js` is loading correctly
- Verify Fabric.js CDN is accessible

**5. Can't Login to Admin**
- Verify database was created with default admin user
- Try resetting password by running this SQL in phpMyAdmin:
  ```sql
  UPDATE admin_users SET password_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE username = 'admin';
  ```

## Configuration Options

### Email Setup (Optional)

To enable email notifications, update in `config/config.php`:

```php
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'your-email@gmail.com');
define('SMTP_PASSWORD', 'your-app-password');
```

### Payment Gateway Setup (Optional)

For Stripe integration, add your keys in `config/config.php`:

```php
define('STRIPE_PUBLIC_KEY', 'pk_live_your_key');
define('STRIPE_SECRET_KEY', 'sk_live_your_key');
```

## Development

### File Permissions

Ensure these folders are writable:
```bash
chmod -R 755 uploads/
```

### Testing Mode

The app is in development mode by default. For production:

```php
// In config/config.php
define('APP_ENV', 'production');
error_reporting(0);
ini_set('display_errors', 0);
```

## Security Notes

1. **Change default admin password** immediately
2. **Update API_KEY** in config.php
3. **Use strong database passwords** in production
4. **Enable HTTPS** in production
5. **Keep PHP and MySQL updated**

## Support

For issues or questions:
- Check the troubleshooting section above
- Review PHP error logs
- Check browser console for JavaScript errors

## License

This project is for educational and commercial use.

---

## 📱 Install as Android/iOS App (PWA)

This app is now a **Progressive Web App** and can be installed on mobile devices!

**Quick Install on Android:**
1. Open the app in Chrome browser on your phone
2. Look for the "Install App" button (bottom-right) or
3. Tap Chrome menu (⋮) → "Add to Home screen"
4. Confirm installation
5. App appears on your home screen like a native app!

**📖 Detailed Guides:**
- **Full Android Setup:** See [`ANDROID_SETUP_GUIDE.md`](ANDROID_SETUP_GUIDE.md)
- **Quick Start (15 min):** See [`QUICK_START.md`](QUICK_START.md)
- **Create App Icons:** See [`CREATE_ICONS.md`](CREATE_ICONS.md)

**PWA Features:**
- ✅ Install on home screen
- ✅ Works offline (cached pages)
- ✅ Native app experience
- ✅ No browser controls
- ✅ Faster loading

---

**Quick Start Summary:**
1. Install XAMPP
2. Place project in `htdocs` folder
3. Import `database/schema.sql` in phpMyAdmin
4. **Create app icons** (see `CREATE_ICONS.md`)
5. Open `http://localhost/neon-sign-generator/`
6. Admin login: `admin` / `admin123`
7. **Install on Android** (see `QUICK_START.md`)
