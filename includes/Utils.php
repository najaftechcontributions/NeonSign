<?php
/**
 * Utility Helper Class
 * Common functions used throughout the application
 */

class Utils {
    
    /**
     * Generate a unique order number
     */
    public static function generateOrderNumber() {
        return 'NS' . date('Ymd') . strtoupper(substr(uniqid(), -6));
    }
    
    /**
     * Sanitize input data
     */
    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Validate email address
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * Generate CSRF token
     */
    public static function generateCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (!isset($_SESSION[CSRF_TOKEN_NAME])) {
            $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION[CSRF_TOKEN_NAME];
    }
    
    /**
     * Verify CSRF token
     */
    public static function verifyCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
    }
    
    /**
     * Send JSON response
     */
    public static function jsonResponse($data, $statusCode = 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    
    /**
     * Send error response
     */
    public static function errorResponse($message, $statusCode = 400) {
        self::jsonResponse([
            'success' => false,
            'error' => $message
        ], $statusCode);
    }
    
    /**
     * Send success response
     */
    public static function successResponse($data = [], $message = 'Success') {
        self::jsonResponse([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], 200);
    }
    
    /**
     * Validate required fields
     */
    public static function validateRequired($data, $requiredFields) {
        $missing = [];
        
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $missing[] = $field;
            }
        }
        
        return empty($missing) ? true : $missing;
    }
    
    /**
     * Upload file handler
     */
    public static function uploadFile($file, $destination, $allowedTypes = null) {
        if (!isset($file['error']) || is_array($file['error'])) {
            throw new Exception('Invalid file upload');
        }
        
        // Check upload errors
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                throw new Exception('File size exceeds limit');
            case UPLOAD_ERR_NO_FILE:
                throw new Exception('No file uploaded');
            default:
                throw new Exception('Upload error occurred');
        }
        
        // Check file size
        if ($file['size'] > MAX_UPLOAD_SIZE) {
            throw new Exception('File too large. Maximum size: ' . (MAX_UPLOAD_SIZE / 1024 / 1024) . 'MB');
        }
        
        // Check file type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        
        $allowedTypes = $allowedTypes ?? ALLOWED_IMAGE_TYPES;
        if (!in_array($mimeType, $allowedTypes)) {
            throw new Exception('Invalid file type. Allowed: ' . implode(', ', $allowedTypes));
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid() . '_' . time() . '.' . $extension;
        $filepath = $destination . '/' . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            throw new Exception('Failed to move uploaded file');
        }
        
        return $filename;
    }
    
    /**
     * Format price for display
     */
    public static function formatPrice($amount, $currency = 'USD') {
        return '$' . number_format($amount, 2);
    }
    
    /**
     * Calculate plan price based on dimensions
     */
    public static function calculatePlanPrice($widthIn, $heightIn, $isRgb = false, $fontKey = null) {
        $area = $widthIn * $heightIn;
        
        // Base product cost
        $costPerInchAdjusted = $isRgb ? COST_PER_INCH * 1.2 : COST_PER_INCH;
        $productCost = $area * $costPerInchAdjusted;
        $shippingCost = ($area * SHIPPING_PER_INCH) + LOCAL_SHIPPING_CONSTANT;
        $totalCosts = $productCost + $shippingCost;
        
        // Profit calculation
        $percentageProfit = $totalCosts * MIN_PROFIT_PERCENTAGE;
        $profit = max($percentageProfit, FIXED_MIN_PROFIT);
        
        // Base price
        $basePrice = $totalCosts + $profit;
        
        // Premium font multiplier
        $premiumFonts = [
            'abril-fatface' => 1.15,
            'playfair-display' => 1.1
        ];
        
        if ($fontKey && isset($premiumFonts[$fontKey])) {
            $basePrice *= $premiumFonts[$fontKey];
        }
        
        // Apply minimum floor
        $basePrice = max($basePrice, MINIMUM_PRICE_FLOOR);
        
        // Round to .99
        return floor($basePrice) + 0.99;
    }
    
    /**
     * Log activity
     */
    public static function logActivity($action, $description = null, $orderId = null, $adminUserId = null) {
        try {
            $db = Database::getInstance();
            $db->insert('activity_logs', [
                'admin_user_id' => $adminUserId,
                'order_id' => $orderId,
                'action' => $action,
                'description' => $description,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
        } catch (Exception $e) {
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
    
    /**
     * Get client IP address
     */
    public static function getClientIP() {
        $ip = '';
        
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        }
        
        return $ip;
    }
    
    /**
     * Redirect helper
     */
    public static function redirect($url, $statusCode = 302) {
        header("Location: $url", true, $statusCode);
        exit;
    }
}
