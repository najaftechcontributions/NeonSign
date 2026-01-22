<?php
/**
 * Setup Verification Script
 * Checks if Turso DB configuration is correct
 */

require_once __DIR__ . '/config/config.php';

echo "========================================\n";
echo "Turso DB Setup Verification\n";
echo "========================================\n\n";

// Check DB Type
echo "1. Database Type: ";
if (defined('DB_TYPE')) {
    echo DB_TYPE . "\n";
    if (DB_TYPE === 'turso') {
        echo "   ✓ Configured for Turso\n\n";
    } else {
        echo "   ⚠ Currently set to: " . DB_TYPE . "\n";
        echo "   Set DB_TYPE=turso in config/config.local.php or environment variables\n\n";
    }
} else {
    echo "   ✗ Not configured\n\n";
}

// Check Turso URL
echo "2. Turso Database URL: ";
if (defined('TURSO_DB_URL') && !empty(TURSO_DB_URL)) {
    $url = TURSO_DB_URL;
    // Mask the URL for security
    if (strlen($url) > 20) {
        $maskedUrl = substr($url, 0, 15) . '...' . substr($url, -10);
    } else {
        $maskedUrl = $url;
    }
    echo $maskedUrl . "\n";
    echo "   ✓ Turso URL configured\n\n";
} else {
    echo "   ✗ Not configured\n";
    echo "   Set TURSO_DB_URL in config/config.local.php\n\n";
}

// Check Turso Auth Token
echo "3. Turso Auth Token: ";
if (defined('TURSO_AUTH_TOKEN') && !empty(TURSO_AUTH_TOKEN)) {
    echo "***" . substr(TURSO_AUTH_TOKEN, -10) . "\n";
    echo "   ✓ Auth token configured\n\n";
} else {
    echo "   ✗ Not configured\n";
    echo "   Set TURSO_AUTH_TOKEN in config/config.local.php\n\n";
}

// Check required PHP extensions
echo "4. Required PHP Extensions:\n";
$requiredExtensions = ['pdo', 'json', 'mbstring', 'curl', 'openssl'];
$allExtensionsLoaded = true;

foreach ($requiredExtensions as $ext) {
    echo "   - {$ext}: ";
    if (extension_loaded($ext)) {
        echo "✓ Loaded\n";
    } else {
        echo "✗ Missing\n";
        $allExtensionsLoaded = false;
    }
}

if ($allExtensionsLoaded) {
    echo "   ✓ All required extensions loaded\n\n";
} else {
    echo "   ⚠ Some extensions are missing\n\n";
}

// Check config file
echo "5. Configuration Files:\n";
echo "   - config/config.php: ";
echo file_exists(__DIR__ . '/config/config.php') ? "✓ Found\n" : "✗ Missing\n";
echo "   - config/config.local.php: ";
echo file_exists(__DIR__ . '/config/config.local.php') ? "✓ Found\n" : "⚠ Not found (optional)\n";

// Test database connection
echo "\n6. Database Connection Test:\n";
if (DB_TYPE === 'turso' && !empty(TURSO_DB_URL) && !empty(TURSO_AUTH_TOKEN)) {
    try {
        require_once __DIR__ . '/includes/Database.php';
        $db = Database::getInstance();
        
        echo "   Testing connection...\n";
        $result = $db->query('SELECT 1');
        echo "   ✓ Successfully connected to Turso database!\n";
        
    } catch (Exception $e) {
        echo "   ✗ Connection failed: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ⚠ Skipping (Turso not fully configured)\n";
}

echo "\n========================================\n";
echo "Setup Status Summary\n";
echo "========================================\n";

$checks = [
    'DB_TYPE configured' => defined('DB_TYPE') && DB_TYPE === 'turso',
    'TURSO_DB_URL configured' => defined('TURSO_DB_URL') && !empty(TURSO_DB_URL),
    'TURSO_AUTH_TOKEN configured' => defined('TURSO_AUTH_TOKEN') && !empty(TURSO_AUTH_TOKEN),
    'PHP extensions loaded' => $allExtensionsLoaded,
];

$passedChecks = count(array_filter($checks));
$totalChecks = count($checks);

echo "\nPassed: {$passedChecks}/{$totalChecks} checks\n\n";

if ($passedChecks === $totalChecks) {
    echo "✓ Your setup is complete!\n";
    echo "\nNext steps:\n";
    echo "1. Run: php database/init-turso.php (to initialize database)\n";
    echo "2. Deploy to Vercel\n";
    echo "3. Visit your admin panel and change the default password\n";
} else {
    echo "⚠ Please complete the missing configuration steps above.\n";
    echo "\nRefer to DEPLOYMENT.md for detailed instructions.\n";
}

echo "\n========================================\n";
