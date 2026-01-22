-- Neon Sign Generator Database Schema
-- Compatible with MySQL 5.7+ and MariaDB 10.2+

-- Create database
CREATE DATABASE IF NOT EXISTS neon_sign_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE neon_sign_db;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    
    -- Design details
    text_content TEXT,
    font_key VARCHAR(100),
    font_family VARCHAR(255),
    color_name VARCHAR(100),
    color_value VARCHAR(50),
    
    -- Size and dimensions
    plan_id VARCHAR(50),
    plan_name VARCHAR(100),
    width_inches INT,
    height_inches INT,
    
    -- Options
    location_type ENUM('indoor', 'outdoor') DEFAULT 'indoor',
    shape_type VARCHAR(50),
    backboard_color VARCHAR(50),
    power_adapter VARCHAR(50),
    
    -- Extras (JSON for flexibility)
    extras JSON,
    
    -- Multicolor settings
    is_multicolor BOOLEAN DEFAULT 0,
    character_colors JSON,
    
    -- Pricing
    base_price DECIMAL(10, 2),
    outdoor_surcharge DECIMAL(10, 2) DEFAULT 0,
    rgb_surcharge DECIMAL(10, 2) DEFAULT 0,
    cut_to_price DECIMAL(10, 2) DEFAULT 0,
    extras_total DECIMAL(10, 2) DEFAULT 0,
    subtotal DECIMAL(10, 2),
    discount_code VARCHAR(50),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2),
    
    -- Design files
    svg_markup LONGTEXT,
    preview_image_path VARCHAR(255),
    logo_image_path VARCHAR(255),
    
    -- Payment
    payment_status ENUM('pending', 'processing', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_transaction_id VARCHAR(255),
    
    -- Order status
    order_status ENUM('draft', 'pending', 'processing', 'in_production', 'shipped', 'completed', 'cancelled') DEFAULT 'draft',
    
    -- Shipping
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_zip VARCHAR(20),
    shipping_country VARCHAR(100),
    tracking_number VARCHAR(255),
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    INDEX idx_order_number (order_number),
    INDEX idx_customer_email (customer_email),
    INDEX idx_order_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    
    -- Discount type
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    
    -- Limits
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    maximum_discount_amount DECIMAL(10, 2),
    usage_limit INT UNSIGNED,
    usage_count INT UNSIGNED DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    
    -- Permissions
    role ENUM('super_admin', 'admin', 'manager', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT 1,
    
    -- Security
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email notifications log
CREATE TABLE IF NOT EXISTS email_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id INT UNSIGNED,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    email_type ENUM('order_confirmation', 'payment_confirmation', 'shipping_notification', 'custom') NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'failed') DEFAULT 'sent',
    error_message TEXT,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_recipient_email (recipient_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity logs for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT UNSIGNED,
    order_id INT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_admin_user_id (admin_user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@neonsigns.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin');

-- Insert some sample discount codes
INSERT INTO discount_codes (code, description, discount_type, discount_value, usage_limit, valid_until) VALUES
('WELCOME20', '20% off for new customers', 'percentage', 20.00, 100, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('SAVE50', '$50 off orders over $500', 'fixed_amount', 50.00, 50, DATE_ADD(NOW(), INTERVAL 60 DAY)),
('FREESHIP', 'Free shipping discount', 'percentage', 10.00, NULL, DATE_ADD(NOW(), INTERVAL 90 DAY));

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('site_name', 'Custom Neon Signs', 'Website name'),
('admin_email', 'admin@neonsigns.com', 'Admin notification email'),
('smtp_host', 'smtp.gmail.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_username', '', 'SMTP username'),
('smtp_password', '', 'SMTP password'),
('currency', 'USD', 'Default currency'),
('tax_rate', '0', 'Tax rate percentage'),
('stripe_public_key', '', 'Stripe publishable key'),
('stripe_secret_key', '', 'Stripe secret key'),
('base_promotion_percentage', '20', 'Default promotion discount percentage');
