CREATE TABLE IF NOT EXISTS mailtriage_users (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mailtriage_style_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL REFERENCES mailtriage_users (email) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mailtriage_analyses (
  user_email TEXT NOT NULL REFERENCES mailtriage_users (email) ON DELETE CASCADE,
  message_id TEXT NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER NOT NULL,
  summary TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  draft TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_email, message_id)
);
