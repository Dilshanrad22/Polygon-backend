-- =============================================
-- FarmInvest Lite Database Schema (MySQL)
-- =============================================
-- Run this script to create the database and tables
-- Command: mysql -u root -p < schema.sql

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS farminvestlite;

-- Use the database
USE farminvestlite;

-- ==================== USERS TABLE ====================
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== INVESTMENTS TABLE ====================
DROP TABLE IF EXISTS investments;

CREATE TABLE investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_created_at (created_at),
    INDEX idx_farmer_name (farmer_name),
    INDEX idx_crop (crop)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables created
SHOW TABLES;
DESCRIBE users;
DESCRIBE investments;
