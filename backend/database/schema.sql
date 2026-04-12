-- ============================================================
--  NexusLaw — MySQL Schema
--  Run this once in MySQL Workbench to create your database
-- ============================================================

CREATE DATABASE IF NOT EXISTS nexuslaw CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexuslaw;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Users (
  user_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(180)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin','legal_user') NOT NULL DEFAULT 'legal_user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Cases ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Cases (
  case_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_number VARCHAR(50)  NOT NULL UNIQUE,
  title       VARCHAR(300) NOT NULL,
  case_type   VARCHAR(80)  NOT NULL,
  court       VARCHAR(120) NOT NULL,
  status      ENUM('Open','Pending','Closed','Appealed') NOT NULL DEFAULT 'Open',
  date_filed  DATE,
  description TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_case_type (case_type),
  INDEX idx_court     (court),
  INDEX idx_status    (status),
  INDEX idx_date      (date_filed)
) ENGINE=InnoDB;

-- ── Parties ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Parties (
  party_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(200) NOT NULL,
  party_type ENUM('Plaintiff','Defendant','Petitioner','Respondent','Intervenor') NOT NULL,
  lawyer     VARCHAR(200),
  FOREIGN KEY (case_id) REFERENCES Cases(case_id) ON DELETE CASCADE,
  INDEX idx_party_case (case_id)
) ENGINE=InnoDB;

-- ── Witnesses ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Witnesses (
  witness_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_id    INT UNSIGNED NOT NULL,
  name       VARCHAR(200) NOT NULL,
  statement  TEXT,
  FOREIGN KEY (case_id) REFERENCES Cases(case_id) ON DELETE CASCADE,
  INDEX idx_witness_case (case_id)
) ENGINE=InnoDB;

-- ── Judgements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Judgements (
  judgement_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_id      INT UNSIGNED NOT NULL UNIQUE,
  judge        VARCHAR(200),
  date         DATE,
  summary      TEXT,
  FOREIGN KEY (case_id) REFERENCES Cases(case_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Keywords (normalized) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS Keywords (
  keyword_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  keyword    VARCHAR(100) NOT NULL UNIQUE,
  INDEX idx_keyword (keyword)
) ENGINE=InnoDB;

-- ── CaseKeywords (mapping) ────────────────────────────────
CREATE TABLE IF NOT EXISTS CaseKeywords (
  case_id    INT UNSIGNED NOT NULL,
  keyword_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (case_id, keyword_id),
  FOREIGN KEY (case_id)    REFERENCES Cases(case_id)    ON DELETE CASCADE,
  FOREIGN KEY (keyword_id) REFERENCES Keywords(keyword_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Precedents (many-to-many self-referencing) ────────────
CREATE TABLE IF NOT EXISTS Precedents (
  precedent_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  case_id          INT UNSIGNED NOT NULL,
  precedent_case_id INT UNSIGNED NOT NULL,
  notes            TEXT,
  UNIQUE KEY uq_precedent (case_id, precedent_case_id),
  FOREIGN KEY (case_id)           REFERENCES Cases(case_id) ON DELETE CASCADE,
  FOREIGN KEY (precedent_case_id) REFERENCES Cases(case_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── View: Full Precedent Info ────────────────────────────
CREATE OR REPLACE VIEW v_precedents AS
SELECT
  p.case_id,
  p.precedent_case_id,
  c.case_number  AS precedent_case_number,
  c.title        AS precedent_title,
  c.case_type    AS precedent_case_type,
  c.court        AS precedent_court,
  c.status       AS precedent_status,
  p.notes
FROM Precedents p
JOIN Cases c ON c.case_id = p.precedent_case_id;
