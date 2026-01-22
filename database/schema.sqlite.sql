-- Neon Sign Generator Database Schema (SQLite/Turso Compatible)
-- Compatible with SQLite 3.x and Turso (libSQL)

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    
    -- Design details
    text_content TEXT,
    font_key TEXT,
    font_family TEXT,
    color_name TEXT,
    color_value TEXT,
    
    -- Size and dimensions
    plan_id TEXT,
    plan_name TEXT,
    width_inches INTEGER,
    height_inches INTEGER,
    
    -- Options (using TEXT instead of ENUM)
    location_type TEXT DEFAULT 'indoor' CHECK(location_type IN ('indoor', 'outdoor')),
    shape_type TEXT,
    backboard_color TEXT,
    power_adapter TEXT,
    
    -- Extras (JSON stored as TEXT in SQLite)
    extras TEXT,
    
    -- Multicolor settings
    is_multicolor INTEGER DEFAULT 0,
    character_colors TEXT,
    
    -- Pricing
    base_price REAL,
    outdoor_surcharge REAL DEFAULT 0,
    rgb_surcharge REAL DEFAULT 0,
    cut_to_price REAL DEFAULT 0,
    extras_total REAL DEFAULT 0,
    subtotal REAL,
    discount_code TEXT,
    discount_amount REAL DEFAULT 0,
    total_price REAL,
    
    -- Design files
    svg_markup TEXT,
    preview_image_path TEXT,
    logo_image_path TEXT,
    
    -- Payment
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
    payment_method TEXT,
    payment_transaction_id TEXT,
    
    -- Order status
    order_status TEXT DEFAULT 'draft' CHECK(order_status IN ('draft', 'pending', 'processing', 'in_production', 'shipped', 'completed', 'cancelled')),
    
    -- Shipping
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_state TEXT,
    shipping_zip TEXT,
    shipping_country TEXT,
    tracking_number TEXT,
    
    -- Notes
    customer_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_created_at ON orders(created_at);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_orders_timestamp 
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Discount type
    discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed_amount')),
    discount_value REAL NOT NULL,
    
    -- Limits
    minimum_order_amount REAL DEFAULT 0,
    maximum_discount_amount REAL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    
    -- Validity
    valid_from DATETIME,
    valid_until DATETIME,
    is_active INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_is_active ON discount_codes(is_active);

CREATE TRIGGER IF NOT EXISTS update_discount_codes_timestamp 
AFTER UPDATE ON discount_codes
FOR EACH ROW
BEGIN
    UPDATE discount_codes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    
    -- Permissions
    role TEXT DEFAULT 'viewer' CHECK(role IN ('super_admin', 'admin', 'manager', 'viewer')),
    is_active INTEGER DEFAULT 1,
    
    -- Security
    last_login_at DATETIME,
    last_login_ip TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_email ON admin_users(email);

CREATE TRIGGER IF NOT EXISTS update_admin_users_timestamp 
AFTER UPDATE ON admin_users
FOR EACH ROW
BEGIN
    UPDATE admin_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Email notifications log
CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    email_type TEXT NOT NULL CHECK(email_type IN ('order_confirmation', 'payment_confirmation', 'shipping_notification', 'custom')),
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent' CHECK(status IN ('sent', 'failed')),
    error_message TEXT,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_recipient_email ON email_logs(recipient_email);

-- Activity logs for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id INTEGER,
    order_id INTEGER,
    action TEXT NOT NULL,
    description TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activity_admin_user_id ON activity_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_activity_order_id ON activity_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at);

-- Settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_setting_key ON settings(setting_key);

CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
AFTER UPDATE ON settings
FOR EACH ROW
BEGIN
    UPDATE settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Insert default admin user (password: admin123 - CHANGE THIS!)
INSERT OR IGNORE INTO admin_users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@neonsigns.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin');

-- Insert some sample discount codes
INSERT OR IGNORE INTO discount_codes (code, description, discount_type, discount_value, usage_limit, valid_until) VALUES
('WELCOME20', '20% off for new customers', 'percentage', 20.00, 100, datetime('now', '+30 days')),
('SAVE50', '$50 off orders over $500', 'fixed_amount', 50.00, 50, datetime('now', '+60 days')),
('FREESHIP', 'Free shipping discount', 'percentage', 10.00, NULL, datetime('now', '+90 days'));

-- Insert default settings
INSERT OR IGNORE INTO settings (setting_key, setting_value, description) VALUES
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
