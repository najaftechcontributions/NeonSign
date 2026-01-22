<?php
/**
 * Initialize Turso Database Schema
 * Run this script once to set up your Turso database with the required tables
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';

if (DB_TYPE !== 'turso') {
    die("Error: This script is for Turso database only. Current DB_TYPE: " . DB_TYPE . "\n");
}

echo "Initializing Turso Database...\n\n";

// Read the SQLite schema file
$schemaFile = __DIR__ . '/schema.sqlite.sql';
if (!file_exists($schemaFile)) {
    die("Error: Schema file not found at {$schemaFile}\n");
}

$schema = file_get_contents($schemaFile);

// Split into individual statements
$statements = array_filter(
    array_map('trim', explode(';', $schema)),
    function($stmt) {
        // Filter out empty statements and comments
        return !empty($stmt) && 
               strpos($stmt, '--') !== 0 && 
               strpos($stmt, 'PRAGMA') !== 0;
    }
);

$db = Database::getInstance();
$successCount = 0;
$errorCount = 0;

foreach ($statements as $statement) {
    // Skip pure comment lines
    if (preg_match('/^\s*--/', $statement)) {
        continue;
    }
    
    try {
        $db->query($statement . ';');
        $successCount++;
        
        // Extract table name from CREATE TABLE or INSERT statements for logging
        if (preg_match('/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i', $statement, $matches)) {
            echo "✓ Created table: {$matches[1]}\n";
        } elseif (preg_match('/CREATE\s+INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)/i', $statement, $matches)) {
            echo "✓ Created index: {$matches[1]}\n";
        } elseif (preg_match('/CREATE\s+TRIGGER\s+IF\s+NOT\s+EXISTS\s+(\w+)/i', $statement, $matches)) {
            echo "✓ Created trigger: {$matches[1]}\n";
        } elseif (preg_match('/INSERT\s+OR\s+IGNORE\s+INTO\s+(\w+)/i', $statement, $matches)) {
            echo "✓ Inserted data into: {$matches[1]}\n";
        }
    } catch (Exception $e) {
        $errorCount++;
        echo "✗ Error executing statement: " . substr($statement, 0, 50) . "...\n";
        echo "  Error: " . $e->getMessage() . "\n";
    }
}

echo "\n";
echo "======================================\n";
echo "Database Initialization Complete\n";
echo "======================================\n";
echo "Success: {$successCount} statements executed\n";
echo "Errors: {$errorCount} statements failed\n";

if ($errorCount === 0) {
    echo "\n✓ Your Turso database is ready to use!\n";
} else {
    echo "\n⚠ Some errors occurred. Please review the output above.\n";
}
