<?php
/**
 * System Check Script
 * Run this file to verify your installation is ready
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$checks = [];
$allPassed = true;

// Check PHP Version
$phpVersion = phpversion();
$phpOk = version_compare($phpVersion, '7.4.0', '>=');
$checks[] = [
    'name' => 'PHP Version',
    'status' => $phpOk,
    'message' => "PHP $phpVersion " . ($phpOk ? '✓' : '✗ (Requires PHP 7.4+)')
];
if (!$phpOk) $allPassed = false;

// Check Required Extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'mbstring', 'openssl', 'curl'];
foreach ($requiredExtensions as $ext) {
    $loaded = extension_loaded($ext);
    $checks[] = [
        'name' => "Extension: $ext",
        'status' => $loaded,
        'message' => $loaded ? '✓ Loaded' : '✗ Not loaded'
    ];
    if (!$loaded) $allPassed = false;
}

// Check if config file exists
$configExists = file_exists(__DIR__ . '/config/config.php');
$checks[] = [
    'name' => 'Config File',
    'status' => $configExists,
    'message' => $configExists ? '✓ Found' : '✗ Missing config/config.php'
];
if (!$configExists) $allPassed = false;

// Load config if exists
if ($configExists) {
    require_once __DIR__ . '/config/config.php';
    
    // Check Database Connection
    try {
        $dsn = "mysql:host=" . DB_HOST . ";charset=" . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $checks[] = [
            'name' => 'MySQL Connection',
            'status' => true,
            'message' => '✓ Connected to MySQL server'
        ];
        
        // Check if database exists
        $result = $pdo->query("SHOW DATABASES LIKE '" . DB_NAME . "'");
        $dbExists = $result->rowCount() > 0;
        $checks[] = [
            'name' => 'Database: ' . DB_NAME,
            'status' => $dbExists,
            'message' => $dbExists ? '✓ Database exists' : '✗ Database not found - Import schema.sql'
        ];
        if (!$dbExists) $allPassed = false;
        
        // Check tables if database exists
        if ($dbExists) {
            $pdo->query("USE " . DB_NAME);
            $requiredTables = ['orders', 'discount_codes', 'admin_users'];
            foreach ($requiredTables as $table) {
                $result = $pdo->query("SHOW TABLES LIKE '$table'");
                $tableExists = $result->rowCount() > 0;
                $checks[] = [
                    'name' => "Table: $table",
                    'status' => $tableExists,
                    'message' => $tableExists ? '✓ Exists' : '✗ Missing - Import schema.sql'
                ];
                if (!$tableExists) $allPassed = false;
            }
        }
        
    } catch (PDOException $e) {
        $checks[] = [
            'name' => 'Database Connection',
            'status' => false,
            'message' => '✗ Connection failed: ' . $e->getMessage()
        ];
        $allPassed = false;
    }
}

// Check required files
$requiredFiles = [
    'index.php',
    'script.js',
    'styles.css',
    'database/schema.sql',
    'includes/Database.php',
    'models/Order.php'
];

foreach ($requiredFiles as $file) {
    $exists = file_exists(__DIR__ . '/' . $file);
    $checks[] = [
        'name' => "File: $file",
        'status' => $exists,
        'message' => $exists ? '✓ Exists' : '✗ Missing'
    ];
    if (!$exists) $allPassed = false;
}

// Check upload directories
$uploadDirs = ['uploads', 'uploads/previews', 'uploads/logos'];
foreach ($uploadDirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    $exists = is_dir($path);
    $writable = $exists && is_writable($path);
    
    if (!$exists) {
        // Try to create it
        @mkdir($path, 0755, true);
        $exists = is_dir($path);
        $writable = $exists && is_writable($path);
    }
    
    $checks[] = [
        'name' => "Directory: $dir",
        'status' => $exists && $writable,
        'message' => $exists ? ($writable ? '✓ Writable' : '✗ Not writable') : '✗ Created now'
    ];
}

// Output HTML
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Check - Neon Sign Generator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 100%;
            padding: 40px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        
        .status-banner {
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
            font-size: 18px;
            font-weight: 600;
        }
        
        .status-banner.success {
            background: #d4edda;
            color: #155724;
            border: 2px solid #c3e6cb;
        }
        
        .status-banner.error {
            background: #f8d7da;
            color: #721c24;
            border: 2px solid #f5c6cb;
        }
        
        .check-list {
            list-style: none;
        }
        
        .check-item {
            padding: 15px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .check-item:last-child {
            border-bottom: none;
        }
        
        .check-name {
            font-weight: 500;
            color: #333;
        }
        
        .check-message {
            color: #666;
            font-size: 14px;
        }
        
        .check-message.success {
            color: #28a745;
        }
        
        .check-message.error {
            color: #dc3545;
        }
        
        .actions {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin-right: 10px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: #667eea;
            color: white;
        }
        
        .btn-primary:hover {
            background: #5568d3;
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        .btn-success:hover {
            background: #218838;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
        
        .section {
            margin-bottom: 25px;
        }
        
        .section-title {
            font-size: 14px;
            text-transform: uppercase;
            color: #999;
            margin-bottom: 10px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 System Check</h1>
        <p class="subtitle">Neon Sign Generator Installation Verification</p>
        
        <?php if ($allPassed): ?>
            <div class="status-banner success">
                ✓ All checks passed! Your system is ready to run the application.
            </div>
        <?php else: ?>
            <div class="status-banner error">
                ✗ Some checks failed. Please fix the issues below before running the application.
            </div>
        <?php endif; ?>
        
        <div class="section">
            <h3 class="section-title">System Requirements</h3>
            <ul class="check-list">
                <?php foreach ($checks as $check): ?>
                    <li class="check-item">
                        <span class="check-name"><?php echo htmlspecialchars($check['name']); ?></span>
                        <span class="check-message <?php echo $check['status'] ? 'success' : 'error'; ?>">
                            <?php echo htmlspecialchars($check['message']); ?>
                        </span>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
        
        <div class="actions">
            <?php if ($allPassed): ?>
                <a href="index.php" class="btn btn-success">✓ Open Application</a>
                <a href="admin/" class="btn btn-primary">Open Admin Panel</a>
            <?php else: ?>
                <a href="README.md" class="btn btn-secondary">Read Setup Guide</a>
                <a href="system-check.php" class="btn btn-primary">Refresh Check</a>
            <?php endif; ?>
        </div>
        
        <?php if (!$allPassed): ?>
            <div class="section" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin-bottom: 15px; color: #333;">Quick Fix Guide:</h3>
                <ol style="margin-left: 20px; color: #666; line-height: 1.8;">
                    <li>Make sure <strong>XAMPP/WAMP/MAMP</strong> is running</li>
                    <li>Open <strong>phpMyAdmin</strong>: <a href="http://localhost/phpmyadmin" target="_blank" style="color: #667eea;">http://localhost/phpmyadmin</a></li>
                    <li>Click <strong>SQL</strong> tab</li>
                    <li>Copy contents from <code>database/schema.sql</code></li>
                    <li>Paste and click <strong>Go</strong></li>
                    <li>Refresh this page</li>
                </ol>
            </div>
        <?php endif; ?>
        
        <div style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
            PHP <?php echo phpversion(); ?> | 
            <?php echo date('Y-m-d H:i:s'); ?>
        </div>
    </div>
</body>
</html>
