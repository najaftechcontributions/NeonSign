<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/Utils.php';
require_once __DIR__ . '/../includes/AdminAuth.php';
require_once __DIR__ . '/../models/Order.php';

AdminAuth::requireLogin();

$currentUser = AdminAuth::getCurrentUser();
$orderModel = new Order();

$orderId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$orderId) {
    header('Location: /admin/dashboard.php');
    exit;
}

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];
    
    if ($action === 'update_status') {
        $newStatus = Utils::sanitize($_POST['order_status'] ?? '');
        $result = $orderModel->updateStatus($orderId, $newStatus);
        $message = $result['success'] ? 'Order status updated successfully' : $result['error'];
    } elseif ($action === 'update_payment') {
        $newStatus = Utils::sanitize($_POST['payment_status'] ?? '');
        $result = $orderModel->updatePaymentStatus($orderId, $newStatus);
        $message = $result['success'] ? 'Payment status updated successfully' : $result['error'];
    }
}

// Get order details
$order = $orderModel->getById($orderId);

if (!$order) {
    header('Location: /admin/dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order #<?php echo htmlspecialchars($order['order_number']); ?> - Admin Panel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0a0a0a;
            color: #fff;
        }
        
        .navbar {
            background: #1a1a1a;
            padding: 15px 30px;
            border-bottom: 1px solid #2a2a2a;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .navbar h1 {
            color: #C8FF00;
            font-size: 20px;
        }
        
        .navbar .nav-links {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        
        .navbar a {
            color: #C8FF00;
            text-decoration: none;
            padding: 8px 16px;
            border: 1px solid #C8FF00;
            border-radius: 6px;
            transition: all 0.2s;
        }
        
        .navbar a:hover {
            background: #C8FF00;
            color: #000;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 30px;
        }
        
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #999;
            text-decoration: none;
            font-size: 14px;
        }
        
        .back-link:hover {
            color: #C8FF00;
        }
        
        .order-header {
            background: #1a1a1a;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid #2a2a2a;
        }
        
        .order-header h2 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .order-meta {
            color: #999;
            font-size: 14px;
        }
        
        .message {
            background: rgba(200, 255, 0, 0.1);
            border: 1px solid rgba(200, 255, 0, 0.3);
            color: #C8FF00;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .grid-2 {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
        }
        
        .card {
            background: #1a1a1a;
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #2a2a2a;
        }
        
        .card h3 {
            margin-bottom: 20px;
            font-size: 18px;
            color: #C8FF00;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #2a2a2a;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            color: #999;
            font-size: 14px;
        }
        
        .info-value {
            font-weight: 600;
        }
        
        .status-badge {
            padding: 6px 14px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
        }
        
        .status-pending { background: #ffc107; color: #000; }
        .status-processing { background: #2196F3; color: #fff; }
        .status-in_production { background: #9C27B0; color: #fff; }
        .status-shipped { background: #FF9800; color: #fff; }
        .status-completed { background: #4CAF50; color: #fff; }
        .status-cancelled { background: #f44336; color: #fff; }
        .status-paid { background: #4CAF50; color: #fff; }
        .status-failed { background: #f44336; color: #fff; }
        
        .design-preview {
            background: #000;
            padding: 40px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .design-text {
            font-size: 48px;
            margin-bottom: 20px;
        }
        
        .design-info {
            color: #999;
            font-size: 14px;
        }
        
        form {
            margin-top: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #ddd;
            font-size: 14px;
            font-weight: 500;
        }
        
        select {
            width: 100%;
            padding: 12px;
            background: transparent;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            color: #fff;
            font-size: 14px;
        }
        
        button {
            width: 100%;
            padding: 12px;
            background: #C8FF00;
            border: none;
            border-radius: 6px;
            color: #000;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        button:hover {
            background: #b8ef00;
        }
        
        @media (max-width: 768px) {
            .grid-2 {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1><?php echo APP_NAME; ?> - Admin</h1>
        <div class="nav-links">
            <a href="/admin/dashboard.php">Dashboard</a>
            <a href="/admin/logout.php">Logout</a>
        </div>
    </div>
    
    <div class="container">
        <a href="/admin/dashboard.php" class="back-link">← Back to Dashboard</a>
        
        <div class="order-header">
            <h2>Order #<?php echo htmlspecialchars($order['order_number']); ?></h2>
            <div class="order-meta">
                Placed on <?php echo date('F j, Y \a\t g:i A', strtotime($order['created_at'])); ?>
            </div>
        </div>
        
        <?php if (isset($message)): ?>
            <div class="message"><?php echo htmlspecialchars($message); ?></div>
        <?php endif; ?>
        
        <div class="grid-2">
            <div>
                <!-- Order Details -->
                <div class="card">
                    <h3>Order Information</h3>
                    
                    <div class="info-row">
                        <span class="info-label">Order Status</span>
                        <span class="info-value">
                            <span class="status-badge status-<?php echo $order['order_status']; ?>">
                                <?php echo ucfirst(str_replace('_', ' ', $order['order_status'])); ?>
                            </span>
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Payment Status</span>
                        <span class="info-value">
                            <span class="status-badge status-<?php echo $order['payment_status']; ?>">
                                <?php echo ucfirst($order['payment_status']); ?>
                            </span>
                        </span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Plan</span>
                        <span class="info-value"><?php echo htmlspecialchars($order['plan_name']); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Dimensions</span>
                        <span class="info-value"><?php echo $order['width_inches']; ?>" × <?php echo $order['height_inches']; ?>"</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Base Price</span>
                        <span class="info-value"><?php echo $order['base_price_formatted']; ?></span>
                    </div>
                    
                    <?php if ($order['discount_amount'] > 0): ?>
                    <div class="info-row">
                        <span class="info-label">Discount</span>
                        <span class="info-value">-<?php echo $order['discount_amount_formatted']; ?></span>
                    </div>
                    <?php endif; ?>
                    
                    <div class="info-row">
                        <span class="info-label">Total Amount</span>
                        <span class="info-value" style="font-size: 18px; color: #C8FF00;"><?php echo $order['total_price_formatted']; ?></span>
                    </div>
                </div>
                
                <!-- Design Preview -->
                <div class="card" style="margin-top: 30px;">
                    <h3>Design Details</h3>
                    
                    <div class="design-preview">
                        <div class="design-text" style="color: <?php echo htmlspecialchars($order['neon_color'] ?? '#C8FF00'); ?>; font-family: <?php echo htmlspecialchars($order['font_family'] ?? 'Inter'); ?>; text-shadow: 0 0 20px <?php echo htmlspecialchars($order['neon_color'] ?? '#C8FF00'); ?>;">
                            <?php echo htmlspecialchars($order['text_content'] ?? 'Logo'); ?>
                        </div>
                        <div class="design-info">
                            Font: <?php echo htmlspecialchars($order['font_family'] ?? 'Inter'); ?> | 
                            Color: <?php echo htmlspecialchars($order['neon_color'] ?? '#C8FF00'); ?>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Text Content</span>
                        <span class="info-value"><?php echo htmlspecialchars($order['text_content'] ?? 'Logo'); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Shape</span>
                        <span class="info-value"><?php echo htmlspecialchars(ucfirst($order['sign_shape'] ?? 'rectangle')); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Backing Type</span>
                        <span class="info-value"><?php echo htmlspecialchars(ucfirst($order['backing_type'] ?? 'acrylic')); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Mounting</span>
                        <span class="info-value"><?php echo htmlspecialchars(ucfirst($order['mounting_type'] ?? 'wall')); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Remote Control</span>
                        <span class="info-value"><?php echo $order['remote_control'] ? 'Yes' : 'No'; ?></span>
                    </div>
                </div>
            </div>
            
            <div>
                <!-- Customer Information -->
                <div class="card">
                    <h3>Customer Information</h3>
                    
                    <div class="info-row">
                        <span class="info-label">Name</span>
                        <span class="info-value"><?php echo htmlspecialchars($order['customer_name'] ?? 'N/A'); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Email</span>
                        <span class="info-value"><?php echo htmlspecialchars($order['customer_email']); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Phone</span>
                        <span class="info-value"><?php echo htmlspecialchars($order['customer_phone'] ?? 'N/A'); ?></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="info-label">Address</span>
                        <span class="info-value"><?php echo htmlspecialchars($order['shipping_address'] ?? 'N/A'); ?></span>
                    </div>
                </div>
                
                <!-- Update Order Status -->
                <div class="card" style="margin-top: 30px;">
                    <h3>Update Status</h3>
                    
                    <form method="POST">
                        <input type="hidden" name="action" value="update_status">
                        
                        <div class="form-group">
                            <label>Order Status</label>
                            <select name="order_status">
                                <option value="pending" <?php echo $order['order_status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="processing" <?php echo $order['order_status'] === 'processing' ? 'selected' : ''; ?>>Processing</option>
                                <option value="in_production" <?php echo $order['order_status'] === 'in_production' ? 'selected' : ''; ?>>In Production</option>
                                <option value="shipped" <?php echo $order['order_status'] === 'shipped' ? 'selected' : ''; ?>>Shipped</option>
                                <option value="completed" <?php echo $order['order_status'] === 'completed' ? 'selected' : ''; ?>>Completed</option>
                                <option value="cancelled" <?php echo $order['order_status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                            </select>
                        </div>
                        
                        <button type="submit">Update Order Status</button>
                    </form>
                    
                    <form method="POST" style="margin-top: 20px;">
                        <input type="hidden" name="action" value="update_payment">
                        
                        <div class="form-group">
                            <label>Payment Status</label>
                            <select name="payment_status">
                                <option value="pending" <?php echo $order['payment_status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                                <option value="paid" <?php echo $order['payment_status'] === 'paid' ? 'selected' : ''; ?>>Paid</option>
                                <option value="failed" <?php echo $order['payment_status'] === 'failed' ? 'selected' : ''; ?>>Failed</option>
                            </select>
                        </div>
                        
                        <button type="submit">Update Payment Status</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
