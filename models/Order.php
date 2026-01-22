<?php
/**
 * Order Model
 * Handles all order-related database operations
 */

class Order {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Create a new order
     */
    public function create($data) {
        try {
            $this->db->beginTransaction();
            
            // Generate unique order number
            $orderNumber = Utils::generateOrderNumber();
            
            // Prepare order data
            $orderData = [
                'order_number' => $orderNumber,
                'customer_name' => $data['customer_name'] ?? null,
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'] ?? null,
                
                // Design details
                'text_content' => $data['text'] ?? null,
                'font_key' => $data['font'] ?? null,
                'font_family' => $data['fontFamily'] ?? null,
                'color_name' => $data['color'] ?? null,
                'color_value' => $data['colorValue'] ?? null,
                
                // Size and dimensions
                'plan_id' => $data['plan']['id'] ?? null,
                'plan_name' => $data['plan']['name'] ?? null,
                'width_inches' => $data['plan']['widthIn'] ?? null,
                'height_inches' => $data['plan']['heightIn'] ?? null,
                
                // Options
                'location_type' => $data['type'] ?? 'indoor',
                'shape_type' => $data['cutTo'] ?? null,
                'backboard_color' => $data['backboard'] ?? null,
                'power_adapter' => $data['powerAdapter'] ?? null,
                
                // Extras (JSON)
                'extras' => json_encode($data['extras'] ?? []),
                
                // Multicolor
                'is_multicolor' => isset($data['multicolor']) && $data['multicolor'] ? 1 : 0,
                'character_colors' => isset($data['characterColors']) ? json_encode($data['characterColors']) : null,
                
                // Pricing
                'base_price' => $data['plan']['price'] ?? 0,
                'outdoor_surcharge' => $data['outdoorSurcharge'] ?? 0,
                'rgb_surcharge' => $data['rgbSurcharge'] ?? 0,
                'cut_to_price' => $data['cutToPrice'] ?? 0,
                'extras_total' => $this->calculateExtrasTotal($data['extras'] ?? []),
                'subtotal' => $data['totalPrice'] ?? 0,
                'discount_code' => $data['discountCode'] ?? null,
                'discount_amount' => isset($data['totalPrice']) && isset($data['discountPrice']) 
                    ? $data['totalPrice'] - $data['discountPrice'] 
                    : 0,
                'total_price' => $data['discountPrice'] ?? $data['totalPrice'] ?? 0,
                
                // Design files
                'svg_markup' => $data['svgMarkup'] ?? null,
                'preview_image_path' => $data['previewImagePath'] ?? null,
                'logo_image_path' => $data['logoImagePath'] ?? null,
                
                // Status
                'order_status' => 'pending',
                'payment_status' => 'pending'
            ];
            
            // Insert order
            $orderId = $this->db->insert('orders', $orderData);
            
            // Log activity
            Utils::logActivity('order_created', "Order {$orderNumber} created", $orderId);
            
            $this->db->commit();
            
            return [
                'order_id' => $orderId,
                'order_number' => $orderNumber
            ];
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Order creation failed: " . $e->getMessage());
            throw new Exception("Failed to create order: " . $e->getMessage());
        }
    }
    
    /**
     * Get order by ID
     */
    public function getById($id) {
        $sql = "SELECT * FROM orders WHERE id = ?";
        $order = $this->db->fetchOne($sql, [$id]);
        
        if ($order) {
            $order = $this->formatOrder($order);
        }
        
        return $order;
    }
    
    /**
     * Get order by order number
     */
    public function getByOrderNumber($orderNumber) {
        $sql = "SELECT * FROM orders WHERE order_number = ?";
        $order = $this->db->fetchOne($sql, [$orderNumber]);
        
        if ($order) {
            $order = $this->formatOrder($order);
        }
        
        return $order;
    }
    
    /**
     * Get all orders with pagination and filters
     */
    public function getAll($page = 1, $perPage = 20, $filters = []) {
        $offset = ($page - 1) * $perPage;
        
        $where = [];
        $params = [];
        
        // Apply filters
        if (!empty($filters['status'])) {
            $where[] = "order_status = ?";
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['payment_status'])) {
            $where[] = "payment_status = ?";
            $params[] = $filters['payment_status'];
        }
        
        if (!empty($filters['search'])) {
            $where[] = "(order_number LIKE ? OR customer_email LIKE ? OR customer_name LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        if (!empty($filters['date_from'])) {
            $where[] = "created_at >= ?";
            $params[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $where[] = "created_at <= ?";
            $params[] = $filters['date_to'] . ' 23:59:59';
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        // Get total count
        $countSql = "SELECT COUNT(*) FROM orders {$whereClause}";
        $totalOrders = $this->db->fetchColumn($countSql, $params);
        
        // Get orders
        $sql = "SELECT * FROM orders {$whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $perPage;
        $params[] = $offset;
        
        $orders = $this->db->fetchAll($sql, $params);
        
        // Format orders
        $formattedOrders = array_map([$this, 'formatOrder'], $orders);
        
        return [
            'orders' => $formattedOrders,
            'total' => $totalOrders,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($totalOrders / $perPage)
        ];
    }
    
    /**
     * Update order
     */
    public function update($id, $data) {
        try {
            $this->db->update('orders', $data, 'id = ?', [$id]);
            
            Utils::logActivity('order_updated', "Order #{$id} updated", $id);
            
            return true;
        } catch (Exception $e) {
            error_log("Order update failed: " . $e->getMessage());
            throw new Exception("Failed to update order");
        }
    }
    
    /**
     * Update order status
     */
    public function updateStatus($id, $status) {
        $validStatuses = ['draft', 'pending', 'processing', 'in_production', 'shipped', 'completed', 'cancelled'];
        
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid order status");
        }
        
        $data = ['order_status' => $status];
        
        if ($status === 'completed') {
            $data['completed_at'] = date('Y-m-d H:i:s');
        }
        
        return $this->update($id, $data);
    }
    
    /**
     * Update payment status
     */
    public function updatePaymentStatus($id, $status, $transactionId = null) {
        $validStatuses = ['pending', 'processing', 'paid', 'failed', 'refunded'];
        
        if (!in_array($status, $validStatuses)) {
            throw new Exception("Invalid payment status");
        }
        
        $data = ['payment_status' => $status];
        
        if ($transactionId) {
            $data['payment_transaction_id'] = $transactionId;
        }
        
        return $this->update($id, $data);
    }
    
    /**
     * Delete order
     */
    public function delete($id) {
        try {
            $this->db->delete('orders', 'id = ?', [$id]);
            Utils::logActivity('order_deleted', "Order #{$id} deleted", $id);
            return true;
        } catch (Exception $e) {
            error_log("Order deletion failed: " . $e->getMessage());
            throw new Exception("Failed to delete order");
        }
    }
    
    /**
     * Get recent orders
     */
    public function getRecent($limit = 10) {
        $sql = "SELECT * FROM orders ORDER BY created_at DESC LIMIT ?";
        $orders = $this->db->fetchAll($sql, [$limit]);
        
        return array_map([$this, 'formatOrder'], $orders);
    }
    
    /**
     * Get order statistics
     */
    public function getStatistics($dateFrom = null, $dateTo = null) {
        $where = "WHERE payment_status = 'paid'";
        $params = [];
        
        if ($dateFrom) {
            $where .= " AND created_at >= ?";
            $params[] = $dateFrom;
        }
        
        if ($dateTo) {
            $where .= " AND created_at <= ?";
            $params[] = $dateTo . ' 23:59:59';
        }
        
        $sql = "SELECT 
                    COUNT(*) as total_orders,
                    SUM(total_price) as total_revenue,
                    AVG(total_price) as average_order_value,
                    SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) as completed_orders
                FROM orders {$where}";
        
        return $this->db->fetchOne($sql, $params);
    }
    
    /**
     * Calculate extras total
     */
    private function calculateExtrasTotal($extras) {
        $total = 0;
        
        if (is_array($extras)) {
            foreach ($extras as $extra) {
                $total += $extra['price'] ?? 0;
            }
        }
        
        return $total;
    }
    
    /**
     * Format order data (decode JSON fields)
     */
    private function formatOrder($order) {
        if (!$order) return null;
        
        // Decode JSON fields
        if (isset($order['extras'])) {
            $order['extras'] = json_decode($order['extras'], true) ?? [];
        }
        
        if (isset($order['character_colors'])) {
            $order['character_colors'] = json_decode($order['character_colors'], true) ?? [];
        }
        
        // Format prices
        $order['base_price_formatted'] = Utils::formatPrice($order['base_price']);
        $order['total_price_formatted'] = Utils::formatPrice($order['total_price']);
        
        // Format dates
        $order['created_at_formatted'] = date('M d, Y h:i A', strtotime($order['created_at']));
        
        return $order;
    }
}
