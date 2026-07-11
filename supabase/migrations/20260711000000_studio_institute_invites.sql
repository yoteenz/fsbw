-- Studio Institute — Private Expert Invite System (Phase 1)

CREATE TABLE IF NOT EXISTS studio_institute_invites (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  invitee_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  role TEXT NOT NULL,
  worker_being_created TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  session_id TEXT,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  current_question_label TEXT,
  current_question_index INTEGER,
  time_spent_minutes NUMERIC(8,2) NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  latest_lesson TEXT,
  knowledge_extracted_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_studio_institute_invites_token ON studio_institute_invites(token);
CREATE INDEX IF NOT EXISTS idx_studio_institute_invites_status ON studio_institute_invites(status, updated_at DESC);

ALTER TABLE studio_institute_invites ENABLE ROW LEVEL SECURITY;
