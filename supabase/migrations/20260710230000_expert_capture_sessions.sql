-- Expert Capture Interview — durable session persistence (Studio Institute)
-- Run in Supabase SQL Editor when deploying save/resume.

CREATE TABLE IF NOT EXISTS expert_capture_sessions (
  id TEXT PRIMARY KEY,
  session_version INTEGER NOT NULL DEFAULT 1,
  profile_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  interview_template_version TEXT NOT NULL DEFAULT '1',
  expert_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id TEXT,
  resume_token_hash TEXT,
  resume_token_expires_at TIMESTAMPTZ,
  expert_name TEXT NOT NULL DEFAULT 'Expert',
  expert_role TEXT NOT NULL DEFAULT 'Professional',
  organization_label TEXT NOT NULL DEFAULT 'Studio OS',
  status TEXT NOT NULL DEFAULT 'draft',
  recovery_status TEXT NOT NULL DEFAULT 'draft',
  consent_status TEXT NOT NULL DEFAULT 'pending',
  retention_status TEXT NOT NULL DEFAULT 'active',
  export_status TEXT NOT NULL DEFAULT 'none',
  session_summary_status TEXT NOT NULL DEFAULT 'none',
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  current_section_id TEXT,
  current_question_id TEXT,
  current_question_index INTEGER NOT NULL DEFAULT 0,
  current_workflow_stage TEXT NOT NULL DEFAULT 'landing',
  last_mutation_id TEXT,
  active_device_id TEXT,
  active_device_updated_at TIMESTAMPTZ,
  session_document JSONB NOT NULL DEFAULT '{}'::jsonb,
  device_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_opened_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_expert_capture_sessions_guest ON expert_capture_sessions(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_expert_capture_sessions_user ON expert_capture_sessions(expert_user_id);
CREATE INDEX IF NOT EXISTS idx_expert_capture_sessions_profile ON expert_capture_sessions(profile_id, status);
CREATE INDEX IF NOT EXISTS idx_expert_capture_sessions_resume_hash ON expert_capture_sessions(resume_token_hash);

CREATE TABLE IF NOT EXISTS expert_capture_media (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES expert_capture_sessions(id) ON DELETE CASCADE,
  answer_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  checksum_sha256 TEXT,
  upload_status TEXT NOT NULL DEFAULT 'pending',
  byte_size BIGINT,
  mime_type TEXT,
  is_partial BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_expert_capture_media_session ON expert_capture_media(session_id);

CREATE TABLE IF NOT EXISTS expert_capture_session_archives (
  id TEXT PRIMARY KEY,
  original_session_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  archived_document JSONB NOT NULL,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expert_capture_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expert_capture_audit_session ON expert_capture_audit(session_id, created_at DESC);

ALTER TABLE expert_capture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_capture_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_capture_session_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_capture_audit ENABLE ROW LEVEL SECURITY;

-- Service role / API handles all access; no direct client RLS policies in MVP.

COMMENT ON TABLE expert_capture_sessions IS 'Canonical Expert Capture interview sessions — server-side source of truth for save/resume.';
COMMENT ON TABLE expert_capture_media IS 'Per-answer media segments linked to sessions.';
COMMENT ON TABLE expert_capture_audit IS 'Non-training governance audit trail for Expert Capture sessions.';
