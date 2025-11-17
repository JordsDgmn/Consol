-- Add session_group_id column to sessions table
-- Run this SQL command in your PostgreSQL database

ALTER TABLE sessions 
ADD COLUMN session_group_id VARCHAR(255) DEFAULT NULL;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN sessions.session_group_id IS 'Identifier for grouping retry sessions together. Sessions with the same group_id are part of the same retry sequence.';