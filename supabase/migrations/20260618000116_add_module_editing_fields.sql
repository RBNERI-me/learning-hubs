ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS editing_modules text DEFAULT '[]';
