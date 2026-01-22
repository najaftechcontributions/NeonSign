<?php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../includes/Database.php';
require_once __DIR__ . '/../includes/Utils.php';
require_once __DIR__ . '/../includes/AdminAuth.php';
require_once __DIR__ . '/../models/Order.php';

AdminAuth::requireLogin();

$currentUser = AdminAuth::getCurrentUser();
$orderModel = new Order();

// Get filter parameters
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$perPage = 20;
$filters = [
    'status' => $_GET['status'] ?? '',
    'payment_status' => $_GET['payment_status'] ?? '',
    'search' => $_GET['search'] ?? ''
];

// Get orders
$result = $orderModel->getAll($page, $perPage, $filters);
$orders = $result['orders'];
$totalPages = $result['total_pages'];

// Get statistics
$stats = $orderModel->getStatistics();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Admin Panel</title>
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
        
        .navbar .user-info {
            display: flex;
            gap: 20px;
            align-items: center;
            color: #999;
            font-size: 14px;
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
            max-width: 1400px;
            margin: 0 auto;
            padding: 30px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: #1a1a1a;
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #2a2a2a;
        }
        
        .stat-card h3 {
            color: #999;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        
        .stat-card .value {
            font-size: 32px;
            font-weight: 700;
            color: #C8FF00;
        }
        
        .filters {
            background: #1a1a1a;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: flex-end;
        }
        
        .filter-group {
            flex: 1;
            min-width: 200px;
        }
        
        .filter-group label {
            display: block;
            margin-bottom: 6px;
            font-size: 13px;
            color: #999;
        }
        
        .filter-group input,
        .filter-group select {
            width: 100%;
            padding: 10px;
            background: transparent;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            color: #fff;
            font-size: 14px;
        }
        
        .filter-group button {
            padding: 10px 20px;
            background: #C8FF00;
            border: none;
            border-radius: 6px;
            color: #000;
            font-weight: 600;
            cursor: pointer;
        }
        
        .orders-table {
            background: #1a1a1a;
            border-radius: 10px;
            overflow: hidden;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background: #2a2a2a;
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #2a2a2a;
        }
        
        th {
            font-size: 13px;
            color: #999;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        td {
            font-size: 14px;
        }
        
        tbody tr:hover {
            background: #222;
        }
        
        .status-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .status-pending { background: #ffc107; color: #000; }
        .status-processing { background: #2196F3; color: #fff; }
        .status-completed { background: #4CAF50; color: #fff; }
        .status-cancelled { background: #f44336; color: #fff; }
        .status-paid { background: #4CAF50; color: #fff; }
        
        .btn-view {
            padding: 6px 14px;
            background: transparent;
            border: 1px solid #C8FF00;
            color: #C8FF00;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            display: inline-block;
        }
        
        .btn-view:hover {
            background: #C8FF00;
            color: #000;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 30px;
        }
        
        .pagination a,
        .pagination span {
            padding: 8px 16px;
            background: #1a1a1a;
            border: 1px solid #2a2a2a;
            border-radius: 6px;
            color: #fff;
            text-decoration: none;
        }
        
        .pagination a:hover {
            background: #C8FF00;
            color: #000;
        }
        
        .pagination .current {
            background: #C8FF00;
            color: #000;
        }
    </style>
</head>
<body>
    <div class="navbar">
        <h1><?php echo APP_NAME; ?> - Admin</h1>
        <div class="user-info">
            <span>Welcome, <?php echo htmlspecialchars($currentUser['full_name'] ?? $currentUser['username']); ?></span>
            <a href="/admin/logout.php">Logout</a>
        </div>
    </div>
    
    <div class="container">
        <h2 style="margin-bottom: 30px; font-size: 28px;">Dashboard</h2>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Orders</h3>
                <div class="value"><?php echo number_format($stats['total_orders'] ?? 0); ?></div>
            </div>
            <div class="stat-card">
                <h3>Total Revenue</h3>
                <div class="value">$<?php echo number_format($stats['total_revenue'] ?? 0, 2); ?></div>
            </div>
            <div class="stat-card">
                <h3>Average Order</h3>
                <div class="value">$<?php echo number_format($stats['average_order_value'] ?? 0, 2); ?></div>
            </div>
            <div class="stat-card">
                <h3>Completed</h3>
                <div class="value"><?php echo number_format($stats['completed_orders'] ?? 0); ?></div>
            </div>
        </div>
        
        <h3 style="margin-bottom: 20px; font-size: 20px;">Orders</h3>
        
        <div class="filters">
            <form method="GET" style="display: contents;">
                <div class="filter-group">
                    <label>Search</label>
                    <input type="text" name="search" placeholder="Order number, email..." value="<?php echo htmlspecialchars($filters['search']); ?>">
                </div>
                <div class="filter-group">
                    <label>Order Status</label>
                    <select name="status">
                        <option value="">All</option>
                        <option value="pending" <?php echo $filters['status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                        <option value="processing" <?php echo $filters['status'] === 'processing' ? 'selected' : ''; ?>>Processing</option>
                        <option value="in_production" <?php echo $filters['status'] === 'in_production' ? 'selected' : ''; ?>>In Production</option>
                        <option value="shipped" <?php echo $filters['status'] === 'shipped' ? 'selected' : ''; ?>>Shipped</option>
                        <option value="completed" <?php echo $filters['status'] === 'completed' ? 'selected' : ''; ?>>Completed</option>
                        <option value="cancelled" <?php echo $filters['status'] === 'cancelled' ? 'selected' : ''; ?>>Cancelled</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Payment Status</label>
                    <select name="payment_status">
                        <option value="">All</option>
                        <option value="pending" <?php echo $filters['payment_status'] === 'pending' ? 'selected' : ''; ?>>Pending</option>
                        <option value="paid" <?php echo $filters['payment_status'] === 'paid' ? 'selected' : ''; ?>>Paid</option>
                        <option value="failed" <?php echo $filters['payment_status'] === 'failed' ? 'selected' : ''; ?>>Failed</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>&nbsp;</label>
                    <button type="submit">Apply Filters</button>
                </div>
            </form>
        </div>
        
        <div class="orders-table">
            <table>
                <thead>
                    <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Design</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($orders)): ?>
                        <tr>
                            <td colspan="8" style="text-align: center; padding: 40px; color: #666;">No orders found</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($orders as $order): ?>
                            <tr>
                                <td><strong><?php echo htmlspecialchars($order['order_number']); ?></strong></td>
                                <td>
                                    <?php echo htmlspecialchars($order['customer_email']); ?><br>
                                    <small style="color: #666;"><?php echo htmlspecialchars($order['customer_name'] ?? 'N/A'); ?></small>
                                </td>
                                <td>
                                    <?php echo htmlspecialchars(substr($order['text_content'] ?? 'Logo', 0, 30)); ?><br>
                                    <small style="color: #666;"><?php echo htmlspecialchars($order['plan_name']); ?> (<?php echo $order['width_inches']; ?>" x <?php echo $order['height_inches']; ?>")</small>
                                </td>
                                <td><strong><?php echo $order['total_price_formatted']; ?></strong></td>
                                <td><span class="status-badge status-<?php echo $order['order_status']; ?>"><?php echo ucfirst($order['order_status']); ?></span></td>
                                <td><span class="status-badge status-<?php echo $order['payment_status']; ?>"><?php echo ucfirst($order['payment_status']); ?></span></td>
                                <td><?php echo date('M d, Y', strtotime($order['created_at'])); ?></td>
                                <td>
                                    <a href="/admin/order-detail.php?id=<?php echo $order['id']; ?>" class="btn-view">View</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        
        <?php if ($totalPages > 1): ?>
            <div class="pagination">
                <?php if ($page > 1): ?>
                    <a href="?page=<?php echo $page - 1; ?>&<?php echo http_build_query($filters); ?>">← Previous</a>
                <?php endif; ?>
                
                <?php for ($i = 1; $i <= min($totalPages, 5); $i++): ?>
                    <?php if ($i === $page): ?>
                        <span class="current"><?php echo $i; ?></span>
                    <?php else: ?>
                        <a href="?page=<?php echo $i; ?>&<?php echo http_build_query($filters); ?>"><?php echo $i; ?></a>
                    <?php endif; ?>
                <?php endfor; ?>
                
                <?php if ($page < $totalPages): ?>
                    <a href="?page=<?php echo $page + 1; ?>&<?php echo http_build_query($filters); ?>">Next →</a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
