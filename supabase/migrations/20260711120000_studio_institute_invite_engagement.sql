-- Studio Institute invites — link opened / interview started engagement tracking

ALTER TABLE studio_institute_invites
  ADD COLUMN IF NOT EXISTS link_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interview_started_at TIMESTAMPTZ;
