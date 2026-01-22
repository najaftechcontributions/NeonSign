<?php
/**
 * Email Service Class
 * Handles sending emails with PHPMailer or native mail()
 */

class EmailService {
    
    /**
     * Send email using PHP mail() function
     * For production, consider using PHPMailer or SendGrid
     */
    public static function send($to, $subject, $body, $isHTML = true) {
        try {
            $headers = [];
            $headers[] = 'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>';
            $headers[] = 'Reply-To: ' . SMTP_FROM_EMAIL;
            $headers[] = 'X-Mailer: PHP/' . phpversion();
            
            if ($isHTML) {
                $headers[] = 'MIME-Version: 1.0';
                $headers[] = 'Content-Type: text/html; charset=UTF-8';
            }
            
            $success = mail($to, $subject, $body, implode("\r\n", $headers));
            
            if ($success) {
                self::logEmail($to, $subject, 'sent');
            } else {
                self::logEmail($to, $subject, 'failed', 'Mail function returned false');
            }
            
            return $success;
            
        } catch (Exception $e) {
            error_log("Email send failed: " . $e->getMessage());
            self::logEmail($to, $subject, 'failed', $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send order confirmation email
     */
    public static function sendOrderConfirmation($orderId) {
        try {
            $orderModel = new Order();
            $order = $orderModel->getById($orderId);
            
            if (!$order) {
                throw new Exception("Order not found");
            }
            
            $to = $order['customer_email'];
            $subject = "Order Confirmation - " . $order['order_number'];
            
            $body = self::getOrderConfirmationTemplate($order);
            
            return self::send($to, $subject, $body, true);
            
        } catch (Exception $e) {
            error_log("Order confirmation email failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send payment confirmation email
     */
    public static function sendPaymentConfirmation($orderId) {
        try {
            $orderModel = new Order();
            $order = $orderModel->getById($orderId);
            
            if (!$order) {
                throw new Exception("Order not found");
            }
            
            $to = $order['customer_email'];
            $subject = "Payment Received - " . $order['order_number'];
            
            $body = self::getPaymentConfirmationTemplate($order);
            
            return self::send($to, $subject, $body, true);
            
        } catch (Exception $e) {
            error_log("Payment confirmation email failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Send shipping notification email
     */
    public static function sendShippingNotification($orderId) {
        try {
            $orderModel = new Order();
            $order = $orderModel->getById($orderId);
            
            if (!$order) {
                throw new Exception("Order not found");
            }
            
            $to = $order['customer_email'];
            $subject = "Your Order Has Shipped - " . $order['order_number'];
            
            $body = self::getShippingNotificationTemplate($order);
            
            return self::send($to, $subject, $body, true);
            
        } catch (Exception $e) {
            error_log("Shipping notification email failed: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Order confirmation email template
     */
    private static function getOrderConfirmationTemplate($order) {
        $logoUrl = APP_URL . '/assets/logo.png';
        $orderUrl = APP_URL . '/track-order.php?order=' . $order['order_number'];
        
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #C8FF00; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: #fff; padding: 15px; margin: 20px 0; border-left: 4px solid #C8FF00; }
        .button { display: inline-block; padding: 12px 30px; background: #C8FF00; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation</h1>
        </div>
        
        <div class="content">
            <p>Thank you for your order!</p>
            
            <p>We've received your custom neon sign order and we're excited to create it for you.</p>
            
            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order Number:</strong> {$order['order_number']}</p>
                <p><strong>Text:</strong> {$order['text_content']}</p>
                <p><strong>Font:</strong> {$order['font_key']}</p>
                <p><strong>Color:</strong> {$order['color_name']}</p>
                <p><strong>Size:</strong> {$order['plan_name']} ({$order['width_inches']}" x {$order['height_inches']}")</p>
                <p><strong>Total:</strong> {$order['total_price_formatted']}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{$orderUrl}" class="button">Track Your Order</a>
            </p>
            
            <p>You will receive another email once your payment is processed and your neon sign goes into production.</p>
        </div>
        
        <div class="footer">
            <p>&copy; 2024 Custom Neon Signs. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }
    
    /**
     * Payment confirmation email template
     */
    private static function getPaymentConfirmationTemplate($order) {
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #C8FF00; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .success { background: #C8FF00; color: #000; padding: 15px; text-align: center; font-weight: bold; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Received!</h1>
        </div>
        
        <div class="content">
            <div class="success">
                ✓ Your payment has been successfully processed
            </div>
            
            <p>Great news! We've received your payment for order <strong>{$order['order_number']}</strong>.</p>
            
            <p>Your custom neon sign is now being prepared for production. We'll send you another update once it's ready to ship.</p>
            
            <p><strong>Amount Paid:</strong> {$order['total_price_formatted']}</p>
        </div>
    </div>
</body>
</html>
HTML;
    }
    
    /**
     * Shipping notification email template
     */
    private static function getShippingNotificationTemplate($order) {
        $trackingNumber = $order['tracking_number'] ?? 'N/A';
        
        return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #C8FF00; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Order Has Shipped!</h1>
        </div>
        
        <div class="content">
            <p>Exciting news! Your custom neon sign has been shipped.</p>
            
            <p><strong>Order Number:</strong> {$order['order_number']}</p>
            <p><strong>Tracking Number:</strong> {$trackingNumber}</p>
            
            <p>Your beautiful custom neon sign is on its way to you. Please allow 3-7 business days for delivery.</p>
        </div>
    </div>
</body>
</html>
HTML;
    }
    
    /**
     * Log email to database
     */
    private static function logEmail($to, $subject, $status = 'sent', $error = null, $orderId = null) {
        try {
            $db = Database::getInstance();
            $db->insert('email_logs', [
                'order_id' => $orderId,
                'recipient_email' => $to,
                'subject' => $subject,
                'email_type' => 'custom',
                'status' => $status,
                'error_message' => $error
            ]);
        } catch (Exception $e) {
            error_log("Failed to log email: " . $e->getMessage());
        }
    }
}
