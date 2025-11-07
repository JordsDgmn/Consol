-- Add hints_used column to sessions table
-- Run this SQL command in your PostgreSQL database

ALTER TABLE sessions 
ADD COLUMN hints_used INTEGER DEFAULT 0;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN sessions.hints_used IS 'Number of hints used during the study session';