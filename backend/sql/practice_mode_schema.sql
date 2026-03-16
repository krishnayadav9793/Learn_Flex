CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS practice_subjects (
  subject_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_key TEXT NOT NULL UNIQUE CHECK (subject_key = lower(subject_key)),
  subject_label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS practice_topics (
  topic_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_id BIGINT NOT NULL REFERENCES practice_subjects(subject_id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  topic_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(subject_id, topic_name)
);

CREATE TABLE IF NOT EXISTS practice_assets (
  asset_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL DEFAULT 'image/png',
  content_hash TEXT UNIQUE,
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS practice_questions (
  question_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  legacy_question_code TEXT NOT NULL UNIQUE,
  topic_id BIGINT NOT NULL REFERENCES practice_topics(topic_id) ON DELETE RESTRICT,
  question_no INTEGER NOT NULL CHECK (question_no > 0),
  statement TEXT NOT NULL,
  answer_kind TEXT NOT NULL CHECK (answer_kind IN ('mcq', 'numeric', 'text')),
  display_mode TEXT NOT NULL CHECK (display_mode IN ('text_only', 'text_with_image', 'image_primary')),
  option_source TEXT NOT NULL CHECK (option_source IN ('parsed', 'generated', 'none')),
  correct_answer TEXT,
  image_asset_id BIGINT REFERENCES practice_assets(asset_id) ON DELETE SET NULL,
  source_file TEXT,
  source_page INTEGER CHECK (source_page IS NULL OR source_page >= 0),
  schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(topic_id, question_no)
);

CREATE TABLE IF NOT EXISTS practice_question_options (
  option_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES practice_questions(question_id) ON DELETE CASCADE,
  option_key SMALLINT NOT NULL CHECK (option_key BETWEEN 1 AND 4),
  option_text TEXT NOT NULL,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, option_key)
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  subject_id BIGINT NOT NULL REFERENCES practice_subjects(subject_id) ON DELETE RESTRICT,
  time_limit_minutes INTEGER NOT NULL CHECK (time_limit_minutes BETWEEN 1 AND 180),
  scoring_mode TEXT NOT NULL DEFAULT '+4/-1',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'submitted', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (expires_at > started_at)
);

CREATE TABLE IF NOT EXISTS practice_session_topics (
  session_id UUID NOT NULL REFERENCES practice_sessions(session_id) ON DELETE CASCADE,
  topic_id BIGINT NOT NULL REFERENCES practice_topics(topic_id) ON DELETE RESTRICT,
  PRIMARY KEY (session_id, topic_id)
);

CREATE TABLE IF NOT EXISTS practice_session_questions (
  session_id UUID NOT NULL REFERENCES practice_sessions(session_id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES practice_questions(question_id) ON DELETE RESTRICT,
  question_order INTEGER NOT NULL CHECK (question_order > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, question_id),
  UNIQUE (session_id, question_order)
);

CREATE TABLE IF NOT EXISTS practice_session_answers (
  session_id UUID NOT NULL,
  question_id UUID NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN,
  marks_awarded SMALLINT NOT NULL DEFAULT 0,
  evaluated BOOLEAN NOT NULL DEFAULT FALSE,
  answered_at TIMESTAMPTZ,
  PRIMARY KEY (session_id, question_id),
  FOREIGN KEY (session_id, question_id)
    REFERENCES practice_session_questions(session_id, question_id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practice_session_results (
  session_id UUID PRIMARY KEY REFERENCES practice_sessions(session_id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL CHECK (total_questions >= 0),
  attempted INTEGER NOT NULL CHECK (attempted >= 0),
  correct INTEGER NOT NULL CHECK (correct >= 0),
  wrong INTEGER NOT NULL CHECK (wrong >= 0),
  unanswered INTEGER NOT NULL CHECK (unanswered >= 0),
  unevaluated INTEGER NOT NULL CHECK (unevaluated >= 0),
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL CHECK (max_score >= 0),
  percentage NUMERIC(6, 2) NOT NULL CHECK (percentage >= 0),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS practice_session_topic_results (
  session_id UUID NOT NULL REFERENCES practice_sessions(session_id) ON DELETE CASCADE,
  topic_id BIGINT NOT NULL REFERENCES practice_topics(topic_id) ON DELETE RESTRICT,
  total INTEGER NOT NULL CHECK (total >= 0),
  attempted INTEGER NOT NULL CHECK (attempted >= 0),
  correct INTEGER NOT NULL CHECK (correct >= 0),
  score INTEGER NOT NULL,
  PRIMARY KEY (session_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_topics_subject
  ON practice_topics(subject_id);

CREATE INDEX IF NOT EXISTS idx_practice_questions_topic
  ON practice_questions(topic_id);

CREATE INDEX IF NOT EXISTS idx_practice_questions_display_mode
  ON practice_questions(display_mode);

CREATE INDEX IF NOT EXISTS idx_practice_question_options_question
  ON practice_question_options(question_id);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_submitted
  ON practice_sessions(user_id, submitted_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_practice_session_questions_order
  ON practice_session_questions(session_id, question_order);

CREATE INDEX IF NOT EXISTS idx_practice_session_answers_session
  ON practice_session_answers(session_id);
