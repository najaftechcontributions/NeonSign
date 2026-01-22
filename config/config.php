<?php
/**
 * Neon Sign Generator - Configuration File
 * 
 * Copy this file to config.local.php and update with your settings
 */

// Error reporting (set to 0 in production)
$appEnv = getenv('APP_ENV') ?: 'development';
if ($appEnv === 'production') {
    error_reporting(0);
    ini_set('display_errors', 0);
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

// Timezone
date_default_timezone_set('America/New_York');

// Database Configuration (support environment variables for Vercel)
define('DB_TYPE', getenv('DB_TYPE') ?: 'mysql');
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'neon_sign_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_CHARSET', 'utf8mb4');

// Turso Configuration (only used when DB_TYPE = 'turso')
if (!defined('TURSO_DB_URL')) {
    define('TURSO_DB_URL', getenv('TURSO_DB_URL') ?: '');
}
if (!defined('TURSO_AUTH_TOKEN')) {
    define('TURSO_AUTH_TOKEN', getenv('TURSO_AUTH_TOKEN') ?: '');
}

// Application Configuration
define('APP_NAME', getenv('APP_NAME') ?: 'Custom Neon Signs');
define('APP_URL', getenv('APP_URL') ?: 'http://localhost');
define('APP_ENV', $appEnv);

// Paths
define('BASE_PATH', dirname(__DIR__));
define('UPLOAD_PATH', BASE_PATH . '/uploads');
define('PREVIEW_PATH', UPLOAD_PATH . '/previews');
define('LOGO_PATH', UPLOAD_PATH . '/logos');

// API Configuration
define('API_KEY', getenv('API_KEY') ?: 'your-secret-api-key-change-this');
define('API_URL', getenv('API_URL') ?: 'http://localhost/api');

// Email Configuration
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', getenv('SMTP_PORT') ?: 587);
define('SMTP_USERNAME', getenv('SMTP_USERNAME') ?: 'your-email@gmail.com');
define('SMTP_PASSWORD', getenv('SMTP_PASSWORD') ?: 'your-app-password');
define('SMTP_FROM_EMAIL', getenv('SMTP_FROM_EMAIL') ?: 'noreply@neonsigns.com');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'Custom Neon Signs');

// Payment Gateway (Stripe)
define('STRIPE_PUBLIC_KEY', getenv('STRIPE_PUBLIC_KEY') ?: 'pk_test_your_key_here');
define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY') ?: 'sk_test_your_key_here');
define('STRIPE_WEBHOOK_SECRET', getenv('STRIPE_WEBHOOK_SECRET') ?: 'whsec_your_webhook_secret');

// Session Configuration
define('SESSION_LIFETIME', 7200); // 2 hours
define('SESSION_NAME', 'neon_sign_session');

// Security
define('CSRF_TOKEN_NAME', 'csrf_token');
define('PASSWORD_HASH_ALGO', PASSWORD_BCRYPT);
define('PASSWORD_HASH_COST', 10);

// File Upload Settings
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']);

// Pricing Configuration (can be moved to database)
define('BASE_PROMOTION_PERCENTAGE', 0.20); // 20% default discount
define('COST_PER_INCH', 1.9);
define('SHIPPING_PER_INCH', 0.4);
define('LOCAL_SHIPPING_CONSTANT', 15);
define('MIN_PROFIT_PERCENTAGE', 0.25);
define('FIXED_MIN_PROFIT', 100);
define('MINIMUM_PRICE_FLOOR', 438.99);
define('RGB_SURCHARGE', 50);
define('OUTDOOR_SURCHARGE', 65);

// Pagination
define('ORDERS_PER_PAGE', 20);

// Auto-load configuration from local file if exists
if (file_exists(__DIR__ . '/config.local.php')) {
    require_once __DIR__ . '/config.local.php';
}

// Create upload directories if they don't exist
$dirs = [UPLOAD_PATH, PREVIEW_PATH, LOGO_PATH];
foreach ($dirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}
