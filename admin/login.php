<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/Utils.php';
require_once __DIR__ . '/../includes/AdminAuth.php';

session_start();

// Redirect if already logged in
if (AdminAuth::isLoggedIn()) {
    header('Location: /admin/dashboard.php');
    exit;
}

$error = '';

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = Utils::sanitize($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    if (empty($username) || empty($password)) {
        $error = 'Please enter both username and password';
    } else {
        $result = AdminAuth::login($username, $password);
        
        if ($result['success']) {
            header('Location: /admin/dashboard.php');
            exit;
        } else {
            $error = $result['error'];
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - <?php echo APP_NAME; ?></title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #000 0%, #1a1a1a 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
        }
        
        .login-container {
            background: #1a1a1a;
            padding: 50px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            width: 100%;
            max-width: 420px;
            border: 1px solid #2a2a2a;
        }
        
        .logo {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .logo h1 {
            font-size: 32px;
            color: #C8FF00;
            margin-bottom: 10px;
        }
        
        .logo p {
            color: #999;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #ddd;
            font-size: 14px;
            font-weight: 500;
        }
        
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 14px 16px;
            background: transparent;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
            color: #fff;
            font-size: 14px;
            transition: border-color 0.2s;
        }
        
        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #C8FF00;
        }
        
        .btn-login {
            width: 100%;
            padding: 14px;
            background: #C8FF00;
            border: none;
            border-radius: 8px;
            color: #000;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .btn-login:hover {
            background: #b8ef00;
            transform: translateY(-1px);
        }
        
        .error {
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            color: #ff6b6b;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1><?php echo APP_NAME; ?></h1>
            <p>Admin Panel</p>
        </div>
        
        <?php if ($error): ?>
            <div class="error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <form method="POST">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required autofocus value="<?php echo htmlspecialchars($username ?? ''); ?>">
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="btn-login">Sign In</button>
        </form>
        
        <div class="footer">
            <p>&copy; 2024 <?php echo APP_NAME; ?>. All rights reserved.</p>
            <p style="margin-top: 10px; color: #999;">Default credentials: admin / admin123</p>
        </div>
    </div>
</body>
</html>
