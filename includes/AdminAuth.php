<?php
/**
 * Admin Authentication Class
 * Handles admin user login, session management, and permissions
 */

class AdminAuth {
    
    /**
     * Login admin user
     */
    public static function login($username, $password) {
        try {
            $db = Database::getInstance();
            
            $sql = "SELECT * FROM admin_users WHERE username = ? AND is_active = 1 LIMIT 1";
            $admin = $db->fetchOne($sql, [$username]);
            
            if (!$admin) {
                self::incrementFailedAttempts($username);
                return [
                    'success' => false,
                    'error' => 'Invalid credentials'
                ];
            }
            
            // Check if account is locked
            if ($admin['locked_until'] && strtotime($admin['locked_until']) > time()) {
                return [
                    'success' => false,
                    'error' => 'Account is locked. Please try again later.'
                ];
            }
            
            // Verify password
            if (!password_verify($password, $admin['password_hash'])) {
                self::incrementFailedAttempts($username);
                return [
                    'success' => false,
                    'error' => 'Invalid credentials'
                ];
            }
            
            // Reset failed attempts
            $db->update('admin_users', [
                'failed_login_attempts' => 0,
                'locked_until' => null,
                'last_login_at' => date('Y-m-d H:i:s'),
                'last_login_ip' => Utils::getClientIP()
            ], 'id = ?', [$admin['id']]);
            
            // Set session
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            $_SESSION['admin_user_id'] = $admin['id'];
            $_SESSION['admin_username'] = $admin['username'];
            $_SESSION['admin_role'] = $admin['role'];
            $_SESSION['admin_full_name'] = $admin['full_name'];
            $_SESSION['admin_logged_in'] = true;
            
            // Regenerate session ID for security
            session_regenerate_id(true);
            
            Utils::logActivity('admin_login', "Admin {$admin['username']} logged in", null, $admin['id']);
            
            return [
                'success' => true,
                'user' => [
                    'id' => $admin['id'],
                    'username' => $admin['username'],
                    'role' => $admin['role'],
                    'full_name' => $admin['full_name']
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Admin login failed: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Login failed. Please try again.'
            ];
        }
    }
    
    /**
     * Logout admin user
     */
    public static function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $adminId = $_SESSION['admin_user_id'] ?? null;
        
        if ($adminId) {
            Utils::logActivity('admin_logout', "Admin logged out", null, $adminId);
        }
        
        session_unset();
        session_destroy();
        
        return true;
    }
    
    /**
     * Check if admin is logged in
     */
    public static function isLoggedIn() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
    }
    
    /**
     * Get current admin user
     */
    public static function getCurrentUser() {
        if (!self::isLoggedIn()) {
            return null;
        }
        
        return [
            'id' => $_SESSION['admin_user_id'] ?? null,
            'username' => $_SESSION['admin_username'] ?? null,
            'role' => $_SESSION['admin_role'] ?? null,
            'full_name' => $_SESSION['admin_full_name'] ?? null
        ];
    }
    
    /**
     * Require admin login (middleware)
     */
    public static function requireLogin() {
        if (!self::isLoggedIn()) {
            header('Location: /admin/login.php');
            exit;
        }
    }
    
    /**
     * Check if user has permission
     */
    public static function hasPermission($requiredRole) {
        if (!self::isLoggedIn()) {
            return false;
        }
        
        $userRole = $_SESSION['admin_role'] ?? 'viewer';
        
        $roleHierarchy = [
            'super_admin' => 4,
            'admin' => 3,
            'manager' => 2,
            'viewer' => 1
        ];
        
        $userLevel = $roleHierarchy[$userRole] ?? 0;
        $requiredLevel = $roleHierarchy[$requiredRole] ?? 0;
        
        return $userLevel >= $requiredLevel;
    }
    
    /**
     * Increment failed login attempts
     */
    private static function incrementFailedAttempts($username) {
        try {
            $db = Database::getInstance();
            
            $sql = "UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1 WHERE username = ?";
            $db->query($sql, [$username]);
            
            // Lock account after 5 failed attempts
            $sql = "UPDATE admin_users SET locked_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE) 
                    WHERE username = ? AND failed_login_attempts >= 5";
            $db->query($sql, [$username]);
            
        } catch (Exception $e) {
            error_log("Failed to increment login attempts: " . $e->getMessage());
        }
    }
    
    /**
     * Create new admin user
     */
    public static function createUser($username, $email, $password, $fullName, $role = 'viewer') {
        try {
            $db = Database::getInstance();
            
            // Check if username exists
            $existing = $db->fetchOne("SELECT id FROM admin_users WHERE username = ?", [$username]);
            if ($existing) {
                throw new Exception("Username already exists");
            }
            
            // Check if email exists
            $existing = $db->fetchOne("SELECT id FROM admin_users WHERE email = ?", [$email]);
            if ($existing) {
                throw new Exception("Email already exists");
            }
            
            // Hash password
            $passwordHash = password_hash($password, PASSWORD_HASH_ALGO, ['cost' => PASSWORD_HASH_COST]);
            
            // Insert user
            $userId = $db->insert('admin_users', [
                'username' => $username,
                'email' => $email,
                'password_hash' => $passwordHash,
                'full_name' => $fullName,
                'role' => $role,
                'is_active' => 1
            ]);
            
            Utils::logActivity('admin_user_created', "Admin user {$username} created");
            
            return $userId;
            
        } catch (Exception $e) {
            error_log("Admin user creation failed: " . $e->getMessage());
            throw $e;
        }
    }
}
