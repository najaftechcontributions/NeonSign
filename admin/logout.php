<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/AdminAuth.php';

session_start();

// Perform logout
AdminAuth::logout();

// Redirect to login page
header('Location: /admin/login.php');
exit;
