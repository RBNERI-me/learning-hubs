CREATE TABLE IF NOT EXISTS user_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp integer DEFAULT 0,
  streak integer DEFAULT 1,
  last_active_date text DEFAULT '',
  hearts integer DEFAULT 5,
  gems integer DEFAULT 0,
  crowns integer DEFAULT 0,
  active_module text DEFAULT 'english-impromptu',
  modules text DEFAULT '[]',
  completed_answers text DEFAULT '[]',
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_progress_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "select_own_progress" ON user_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_progress" ON user_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_progress" ON user_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_progress" ON user_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
