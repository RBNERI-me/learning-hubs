ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS weak_spots text DEFAULT '[]',
ADD COLUMN IF NOT EXISTS has_seen_onboarding boolean DEFAULT false;
