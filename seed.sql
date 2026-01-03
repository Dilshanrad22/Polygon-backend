-- =============================================
-- FarmInvest Lite Seed Data (MySQL)
-- =============================================
-- Run this script after schema.sql to populate sample data
-- Command: mysql -u root -p farminvestlite < seed.sql

USE farminvestlite;

-- ==================== SEED USERS ====================
-- Password for all users is: password123 (hashed with bcrypt)

DELETE FROM users;

INSERT INTO users (name, email, password) VALUES
('Demo User', 'demo@farminvest.com', '$2a$10$8K1p/a0dR1LXMIgpHZGzGOxvSg8KLBKTKvBz0YKQkO5yBYXvV8Kzu'),
('John Admin', 'admin@farminvest.com', '$2a$10$8K1p/a0dR1LXMIgpHZGzGOxvSg8KLBKTKvBz0YKQkO5yBYXvV8Kzu');

-- ==================== SEED INVESTMENTS ====================
DELETE FROM investments;

INSERT INTO investments (farmer_name, amount, crop, created_at) VALUES
('John Doe', 5000.00, 'Wheat', '2025-12-01 10:00:00'),
('Jane Smith', 7500.50, 'Rice', '2025-12-05 14:30:00'),
('Robert Johnson', 3200.00, 'Corn', '2025-12-10 09:15:00'),
('Emily Davis', 10000.00, 'Soybeans', '2025-12-15 16:45:00'),
('Michael Brown', 4500.75, 'Cotton', '2025-12-18 11:20:00'),
('Sarah Wilson', 6800.00, 'Sugarcane', '2025-12-20 08:00:00'),
('David Lee', 2500.00, 'Potatoes', '2025-12-22 13:10:00'),
('Lisa Anderson', 8900.25, 'Tomatoes', '2025-12-25 15:55:00'),
('James Taylor', 5500.00, 'Onions', '2025-12-28 10:30:00'),
('Jennifer Martinez', 12000.00, 'Grapes', '2025-12-30 17:00:00');

-- Verify data
SELECT 'Users:' AS '';
SELECT * FROM users;

SELECT 'Investments:' AS '';
SELECT * FROM investments ORDER BY created_at DESC;
