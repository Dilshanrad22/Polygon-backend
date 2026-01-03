-- Add user_id column to investments table
-- Run this SQL in your MySQL database

USE farminvestlite;

-- Add user_id column
ALTER TABLE investments 
ADD COLUMN user_id INT AFTER crop;

-- Add foreign key constraint
ALTER TABLE investments
ADD CONSTRAINT fk_investments_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_investments_user_id ON investments(user_id);

-- Update existing investments to assign them to the first user (optional)
-- This is for existing data migration
UPDATE investments 
SET user_id = (SELECT id FROM users LIMIT 1)
WHERE user_id IS NULL;
