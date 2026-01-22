<?php
/**
 * API Endpoints Handler
 * RESTful API for neon sign generator
 */

// Enable CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-API-Key, X-Idempotency-Key');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load configuration and dependencies
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/Utils.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/DiscountCode.php';

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$path = trim($path, '/');

// Get request body for POST/PUT requests
$requestBody = null;
if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $requestBody = file_get_contents('php://input');
    $requestData = json_decode($requestBody, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        Utils::errorResponse('Invalid JSON in request body', 400);
    }
}

// API Key validation (optional - can be enabled for production)
function validateAPIKey() {
    $apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
    
    if (APP_ENV === 'production' && $apiKey !== API_KEY) {
        Utils::errorResponse('Invalid API key', 401);
    }
}

// Route handler
try {
    switch ($path) {
        
        // ============================================
        // DISCOUNT CODE VALIDATION
        // ============================================
        case 'apply-discount':
            if ($method !== 'POST') {
                Utils::errorResponse('Method not allowed', 405);
            }
            
            $code = $requestData['discount_code'] ?? '';
            $orderAmount = $requestData['order_amount'] ?? 0;
            
            if (empty($code)) {
                Utils::errorResponse('Discount code is required');
            }
            
            $discountModel = new DiscountCode();
            $result = $discountModel->validate($code, $orderAmount);
            
            if ($result['valid']) {
                Utils::successResponse([
                    'discount' => $result
                ], 'Discount code applied successfully');
            } else {
                Utils::errorResponse($result['error'], 400);
            }
            break;
        
        // ============================================
        // CREATE DRAFT ORDER / CHECKOUT
        // ============================================
        case 'create-draft-order':
            if ($method !== 'POST') {
                Utils::errorResponse('Method not allowed', 405);
            }
            
            // Validate required fields
            $required = ['customer_email', 'totalPrice'];
            $validation = Utils::validateRequired($requestData, $required);
            
            if ($validation !== true) {
                Utils::errorResponse('Missing required fields: ' . implode(', ', $validation));
            }
            
            // Validate email
            if (!Utils::validateEmail($requestData['customer_email'])) {
                Utils::errorResponse('Invalid email address');
            }
            
            // Handle logo upload if present
            if (isset($_FILES['logo']) && $_FILES['logo']['error'] !== UPLOAD_ERR_NO_FILE) {
                try {
                    $logoFilename = Utils::uploadFile($_FILES['logo'], LOGO_PATH);
                    $requestData['logoImagePath'] = 'uploads/logos/' . $logoFilename;
                } catch (Exception $e) {
                    Utils::errorResponse('Logo upload failed: ' . $e->getMessage());
                }
            }
            
            // Handle preview image if sent as base64
            if (!empty($requestData['previewImageBase64'])) {
                try {
                    $imageData = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $requestData['previewImageBase64']));
                    $filename = uniqid() . '_preview.png';
                    $filepath = PREVIEW_PATH . '/' . $filename;
                    file_put_contents($filepath, $imageData);
                    $requestData['previewImagePath'] = 'uploads/previews/' . $filename;
                } catch (Exception $e) {
                    error_log("Preview image save failed: " . $e->getMessage());
                }
            }
            
            // Create order
            $orderModel = new Order();
            $order = $orderModel->create($requestData);
            
            // If discount code was used, increment usage
            if (!empty($requestData['discountCode'])) {
                $discountModel = new DiscountCode();
                $discountModel->incrementUsage($requestData['discountCode']);
            }
            
            // Send confirmation email (implement this based on your email system)
            // EmailService::sendOrderConfirmation($order['order_id']);
            
            // For now, return order details
            // In production, you would create a Stripe checkout session or payment link
            $checkoutUrl = APP_URL . '/checkout.php?order=' . $order['order_number'];
            
            Utils::successResponse([
                'order_id' => $order['order_id'],
                'order_number' => $order['order_number'],
                'checkout_url' => $checkoutUrl
            ], 'Order created successfully');
            break;
        
        // ============================================
        // GET ORDER BY ORDER NUMBER
        // ============================================
        case (preg_match('/^order\/([A-Z0-9]+)$/', $path, $matches) ? true : false):
            if ($method !== 'GET') {
                Utils::errorResponse('Method not allowed', 405);
            }
            
            $orderNumber = $matches[1];
            $orderModel = new Order();
            $order = $orderModel->getByOrderNumber($orderNumber);
            
            if (!$order) {
                Utils::errorResponse('Order not found', 404);
            }
            
            Utils::successResponse(['order' => $order]);
            break;
        
        // ============================================
        // UPLOAD LOGO
        // ============================================
        case 'upload-logo':
            if ($method !== 'POST') {
                Utils::errorResponse('Method not allowed', 405);
            }
            
            if (!isset($_FILES['logo'])) {
                Utils::errorResponse('No file uploaded');
            }
            
            try {
                $filename = Utils::uploadFile($_FILES['logo'], LOGO_PATH);
                
                Utils::successResponse([
                    'filename' => $filename,
                    'url' => APP_URL . '/uploads/logos/' . $filename
                ], 'Logo uploaded successfully');
            } catch (Exception $e) {
                Utils::errorResponse($e->getMessage());
            }
            break;
        
        // ============================================
        // CALCULATE PRICE (for dynamic pricing)
        // ============================================
        case 'calculate-price':
            if ($method !== 'POST') {
                Utils::errorResponse('Method not allowed', 405);
            }
            
            $widthIn = $requestData['width'] ?? 38;
            $heightIn = $requestData['height'] ?? 17;
            $isRgb = $requestData['isRgb'] ?? false;
            $fontKey = $requestData['fontKey'] ?? null;
            
            $price = Utils::calculatePlanPrice($widthIn, $heightIn, $isRgb, $fontKey);
            
            Utils::successResponse([
                'price' => $price,
                'formatted_price' => Utils::formatPrice($price)
            ]);
            break;
        
        // ============================================
        // HEALTH CHECK
        // ============================================
        case 'health':
        case '':
            Utils::successResponse([
                'status' => 'online',
                'version' => '1.0.0',
                'timestamp' => date('c')
            ], 'API is running');
            break;
        
        // ============================================
        // NOT FOUND
        // ============================================
        default:
            Utils::errorResponse('Endpoint not found: ' . $path, 404);
    }
    
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Utils::errorResponse('Internal server error: ' . $e->getMessage(), 500);
}
