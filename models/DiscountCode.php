<?php
/**
 * DiscountCode Model
 * Handles discount code validation and management
 */

class DiscountCode {
    private $db;
    
    public function __construct() {
        $this->db = Database::getInstance();
    }
    
    /**
     * Validate and get discount code
     */
    public function validate($code, $orderAmount = 0) {
        try {
            $sql = "SELECT * FROM discount_codes 
                    WHERE code = ? 
                    AND is_active = 1 
                    AND (valid_from IS NULL OR valid_from <= NOW())
                    AND (valid_until IS NULL OR valid_until >= NOW())
                    AND (usage_limit IS NULL OR usage_count < usage_limit)
                    LIMIT 1";
            
            $discount = $this->db->fetchOne($sql, [strtoupper($code)]);
            
            if (!$discount) {
                return [
                    'valid' => false,
                    'error' => 'Invalid or expired discount code'
                ];
            }
            
            // Check minimum order amount
            if ($orderAmount > 0 && $discount['minimum_order_amount'] > $orderAmount) {
                return [
                    'valid' => false,
                    'error' => 'Order total must be at least ' . Utils::formatPrice($discount['minimum_order_amount'])
                ];
            }
            
            // Calculate discount amount
            $discountAmount = 0;
            
            if ($discount['discount_type'] === 'percentage') {
                $discountAmount = ($orderAmount * $discount['discount_value']) / 100;
            } else {
                $discountAmount = $discount['discount_value'];
            }
            
            // Apply maximum discount limit if set
            if ($discount['maximum_discount_amount'] && $discountAmount > $discount['maximum_discount_amount']) {
                $discountAmount = $discount['maximum_discount_amount'];
            }
            
            return [
                'valid' => true,
                'code' => $discount['code'],
                'type' => $discount['discount_type'],
                'value' => $discount['discount_value'],
                'discount_amount' => $discountAmount,
                'description' => $discount['description']
            ];
            
        } catch (Exception $e) {
            error_log("Discount validation failed: " . $e->getMessage());
            return [
                'valid' => false,
                'error' => 'Failed to validate discount code'
            ];
        }
    }
    
    /**
     * Increment usage count
     */
    public function incrementUsage($code) {
        try {
            $sql = "UPDATE discount_codes SET usage_count = usage_count + 1 WHERE code = ?";
            $this->db->query($sql, [strtoupper($code)]);
            return true;
        } catch (Exception $e) {
            error_log("Failed to increment discount usage: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Create new discount code
     */
    public function create($data) {
        try {
            $discountData = [
                'code' => strtoupper($data['code']),
                'description' => $data['description'] ?? null,
                'discount_type' => $data['discount_type'],
                'discount_value' => $data['discount_value'],
                'minimum_order_amount' => $data['minimum_order_amount'] ?? 0,
                'maximum_discount_amount' => $data['maximum_discount_amount'] ?? null,
                'usage_limit' => $data['usage_limit'] ?? null,
                'valid_from' => $data['valid_from'] ?? null,
                'valid_until' => $data['valid_until'] ?? null,
                'is_active' => $data['is_active'] ?? 1
            ];
            
            $id = $this->db->insert('discount_codes', $discountData);
            
            Utils::logActivity('discount_created', "Discount code {$discountData['code']} created");
            
            return $id;
        } catch (Exception $e) {
            error_log("Discount creation failed: " . $e->getMessage());
            throw new Exception("Failed to create discount code");
        }
    }
    
    /**
     * Get all discount codes
     */
    public function getAll($activeOnly = false) {
        $sql = "SELECT * FROM discount_codes";
        
        if ($activeOnly) {
            $sql .= " WHERE is_active = 1";
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        return $this->db->fetchAll($sql);
    }
    
    /**
     * Get discount by ID
     */
    public function getById($id) {
        $sql = "SELECT * FROM discount_codes WHERE id = ?";
        return $this->db->fetchOne($sql, [$id]);
    }
    
    /**
     * Update discount code
     */
    public function update($id, $data) {
        try {
            $this->db->update('discount_codes', $data, 'id = ?', [$id]);
            
            Utils::logActivity('discount_updated', "Discount code #{$id} updated");
            
            return true;
        } catch (Exception $e) {
            error_log("Discount update failed: " . $e->getMessage());
            throw new Exception("Failed to update discount code");
        }
    }
    
    /**
     * Delete discount code
     */
    public function delete($id) {
        try {
            $this->db->delete('discount_codes', 'id = ?', [$id]);
            Utils::logActivity('discount_deleted', "Discount code #{$id} deleted");
            return true;
        } catch (Exception $e) {
            error_log("Discount deletion failed: " . $e->getMessage());
            throw new Exception("Failed to delete discount code");
        }
    }
    
    /**
     * Toggle active status
     */
    public function toggleActive($id) {
        try {
            $sql = "UPDATE discount_codes SET is_active = NOT is_active WHERE id = ?";
            $this->db->query($sql, [$id]);
            return true;
        } catch (Exception $e) {
            error_log("Failed to toggle discount status: " . $e->getMessage());
            return false;
        }
    }
}
