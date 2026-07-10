-- Living Knowledge Mirror™ — governed knowledge programs (Studio Institute Expert Capture)

CREATE TABLE IF NOT EXISTS expert_capture_knowledge_programs (
  program_id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  expert_name TEXT NOT NULL,
  program_document JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ec_knowledge_programs_profile ON expert_capture_knowledge_programs(profile_id, company_id);

ALTER TABLE expert_capture_knowledge_programs ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE expert_capture_knowledge_programs IS 'Living Knowledge Mirror programs — versioned expert knowledge, packets, competencies (API/service role access).';
