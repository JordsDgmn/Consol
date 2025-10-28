-- Add profile picture URL column to users table
-- Run this SQL command in your PostgreSQL database

ALTER TABLE users 
ADD COLUMN profile_picture_url VARCHAR(500) DEFAULT NULL;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN users.profile_picture_url IS 'URL to user profile picture (Cloudinary or local storage)';