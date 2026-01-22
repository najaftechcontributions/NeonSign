<?php
/**
 * Database Connection Class
 * Singleton pattern with PDO (MySQL) and Turso HTTP API support
 */

class Database {
    private static $instance = null;
    private $connection;
    private $dbType;
    private $tursoUrl;
    private $tursoToken;
    
    private function __construct() {
        $this->dbType = defined('DB_TYPE') ? DB_TYPE : 'mysql';
        
        if ($this->dbType === 'turso') {
            $this->initializeTurso();
        } else {
            $this->initializeMySQL();
        }
    }
    
    private function initializeMySQL() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            die("Database connection failed. Please check your configuration.");
        }
    }
    
    private function initializeTurso() {
        if (!defined('TURSO_DB_URL') || !defined('TURSO_AUTH_TOKEN')) {
            die("Turso configuration missing. Please set TURSO_DB_URL and TURSO_AUTH_TOKEN.");
        }
        
        // Convert libsql:// to https://
        $url = str_replace('libsql://', 'https://', TURSO_DB_URL);
        $this->tursoUrl = $url;
        $this->tursoToken = TURSO_AUTH_TOKEN;
        
        // Test connection
        try {
            $this->executeTursoQuery('SELECT 1');
        } catch (Exception $e) {
            error_log("Turso Connection Error: " . $e->getMessage());
            die("Turso connection failed. Please check your configuration.");
        }
    }
    
    private function executeTursoQuery($sql, $params = []) {
        $url = $this->tursoUrl;
        
        // Prepare the SQL with parameters
        if (!empty($params)) {
            // Replace ? placeholders with actual values (escaped)
            $paramIndex = 0;
            $sql = preg_replace_callback('/\?/', function() use ($params, &$paramIndex) {
                $value = $params[$paramIndex++];
                if (is_null($value)) {
                    return 'NULL';
                } elseif (is_numeric($value)) {
                    return $value;
                } elseif (is_bool($value)) {
                    return $value ? '1' : '0';
                } else {
                    return "'" . addslashes($value) . "'";
                }
            }, $sql);
        }
        
        $payload = json_encode([
            'statements' => [$sql]
        ]);
        
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $this->tursoToken,
                'Content-Type: application/json'
            ]
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new Exception("Turso API Error: " . $error);
        }
        
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("Turso API returned status code: " . $httpCode . " Response: " . $response);
        }
        
        $result = json_decode($response, true);
        
        if (isset($result[0]['error'])) {
            throw new Exception("Turso Query Error: " . $result[0]['error']['message']);
        }
        
        return $result[0] ?? [];
    }
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getConnection() {
        if ($this->dbType === 'turso') {
            throw new Exception("Direct connection not available for Turso. Use query methods instead.");
        }
        return $this->connection;
    }
    
    public function query($sql, $params = []) {
        if ($this->dbType === 'turso') {
            return $this->executeTursoQuery($sql, $params);
        }
        
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query Error: " . $e->getMessage() . " | SQL: " . $sql);
            throw $e;
        }
    }
    
    public function fetchAll($sql, $params = []) {
        if ($this->dbType === 'turso') {
            $result = $this->executeTursoQuery($sql, $params);
            return $result['results']['rows'] ?? [];
        }
        return $this->query($sql, $params)->fetchAll();
    }
    
    public function fetchOne($sql, $params = []) {
        if ($this->dbType === 'turso') {
            $result = $this->executeTursoQuery($sql, $params);
            $rows = $result['results']['rows'] ?? [];
            return !empty($rows) ? $rows[0] : null;
        }
        return $this->query($sql, $params)->fetch();
    }
    
    public function fetchColumn($sql, $params = []) {
        if ($this->dbType === 'turso') {
            $result = $this->executeTursoQuery($sql, $params);
            $rows = $result['results']['rows'] ?? [];
            if (!empty($rows) && isset($rows[0][0])) {
                return $rows[0][0];
            }
            return null;
        }
        return $this->query($sql, $params)->fetchColumn();
    }
    
    public function insert($table, $data) {
        $fields = array_keys($data);
        $values = array_values($data);
        $placeholders = array_fill(0, count($fields), '?');
        
        $sql = "INSERT INTO {$table} (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")";
        
        if ($this->dbType === 'turso') {
            $this->executeTursoQuery($sql, $values);
            // Get last insert ID
            $result = $this->executeTursoQuery('SELECT last_insert_rowid()');
            return $result['results']['rows'][0][0] ?? null;
        }
        
        $this->query($sql, $values);
        return $this->connection->lastInsertId();
    }
    
    public function update($table, $data, $where, $whereParams = []) {
        $setParts = [];
        $values = [];
        
        foreach ($data as $field => $value) {
            $setParts[] = "{$field} = ?";
            $values[] = $value;
        }
        
        $sql = "UPDATE {$table} SET " . implode(', ', $setParts) . " WHERE {$where}";
        
        if ($this->dbType === 'turso') {
            $this->executeTursoQuery($sql, array_merge($values, $whereParams));
            return true;
        }
        
        $this->query($sql, array_merge($values, $whereParams));
        return $this->connection->lastInsertId();
    }
    
    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM {$table} WHERE {$where}";
        return $this->query($sql, $params);
    }
    
    public function beginTransaction() {
        if ($this->dbType === 'turso') {
            $this->executeTursoQuery('BEGIN TRANSACTION');
            return true;
        }
        return $this->connection->beginTransaction();
    }
    
    public function commit() {
        if ($this->dbType === 'turso') {
            $this->executeTursoQuery('COMMIT');
            return true;
        }
        return $this->connection->commit();
    }
    
    public function rollBack() {
        if ($this->dbType === 'turso') {
            $this->executeTursoQuery('ROLLBACK');
            return true;
        }
        return $this->connection->rollBack();
    }
    
    // Prevent cloning
    private function __clone() {}
    
    // Prevent unserialization
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}
