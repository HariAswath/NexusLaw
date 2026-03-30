-- ============================================================
--  NexusLaw — Seed Data
--  Run AFTER schema.sql to populate sample data
--  Passwords are bcrypt of "password123"
-- ============================================================
USE nexuslaw;

-- ── Users ─────────────────────────────────────────────────
INSERT IGNORE INTO Users (name, email, password_hash, role) VALUES
('Admin User',    'admin@nexuslaw.com', '$2a$12$OFeDkWAozxXghUawU1xSSXf.G.CYVTtTIRhv2smV.qj0rYpS', 'admin'),
('Legal Counsel', 'user@nexuslaw.com',  '$2a$12$OFeDkWAozxXghUawU1xSSXf.G.CYVTtTIRhv2smV.qj0rYpS', 'legal_user');

-- ── Cases ─────────────────────────────────────────────────
INSERT IGNORE INTO Cases (case_number, title, case_type, court, status, date_filed, description) VALUES
('CIV-2024-001', 'State v. Rajan Kumar',          'Criminal',             'Supreme Court',   'Open',     '2024-01-15', 'Murder charge under IPC 302'),
('CIV-2024-002', 'Mehta Corp v. Alpha Ltd',        'Civil',                'High Court',      'Pending',  '2024-02-20', 'Breach of commercial contract'),
('CIV-2023-087', 'Sharma v. Union of India',       'Constitutional',       'Supreme Court',   'Closed',   '2023-11-05', 'Fundamental rights violation under Art 21'),
('FAM-2024-011', 'Priya Desai v. Anil Desai',      'Family',               'District Court',  'Open',     '2024-03-01', 'Divorce and child custody dispute'),
('TAX-2023-045', 'Gupta Traders v. IT Dept',       'Tax',                  'High Court',      'Appealed', '2023-08-14', 'Income tax evasion assessment challenge'),
('CRM-2024-033', 'State v. Patel Gang',            'Criminal',             'Sessions Court',  'Open',     '2024-01-28', 'Organised crime and extortion'),
('IPR-2023-019', 'TechSoft v. CodeWave',           'Intellectual Property','High Court',      'Closed',   '2023-06-10', 'Software copyright infringement'),
('LAB-2024-007', 'Workers Union v. MegaCorp',      'Labour',               'Labour Court',    'Pending',  '2024-02-05', 'Unlawful termination and severance');

-- ── Keywords ──────────────────────────────────────────────
INSERT IGNORE INTO Keywords (keyword) VALUES
('murder'),('intent'),('witness'),('contract'),('breach'),('damages'),
('fundamental rights'),('article 21'),('pil'),('divorce'),('custody'),('maintenance'),
('income tax'),('assessment'),('appeal'),('extortion'),('gang'),('organised crime'),
('copyright'),('software'),('infringement'),('termination'),('severance'),('labour law');

-- ── CaseKeywords mapping ───────────────────────────────────
INSERT IGNORE INTO CaseKeywords (case_id, keyword_id)
SELECT c.case_id, k.keyword_id FROM Cases c, Keywords k WHERE
  (c.case_number = 'CIV-2024-001' AND k.keyword IN ('murder','intent','witness'))
  OR (c.case_number = 'CIV-2024-002' AND k.keyword IN ('contract','breach','damages'))
  OR (c.case_number = 'CIV-2023-087' AND k.keyword IN ('fundamental rights','article 21','pil'))
  OR (c.case_number = 'FAM-2024-011' AND k.keyword IN ('divorce','custody','maintenance'))
  OR (c.case_number = 'TAX-2023-045' AND k.keyword IN ('income tax','assessment','appeal'))
  OR (c.case_number = 'CRM-2024-033' AND k.keyword IN ('extortion','gang','organised crime'))
  OR (c.case_number = 'IPR-2023-019' AND k.keyword IN ('copyright','software','infringement'))
  OR (c.case_number = 'LAB-2024-007' AND k.keyword IN ('termination','severance','labour law'));

-- ── Parties ───────────────────────────────────────────────
INSERT IGNORE INTO Parties (case_id, name, party_type, lawyer)
SELECT c.case_id, p.name, p.party_type, p.lawyer FROM Cases c
JOIN (SELECT 'CIV-2024-001' AS cn, 'State of India'      AS name, 'Plaintiff'  AS party_type, 'Adv. S. Mehta'   AS lawyer UNION ALL
      SELECT 'CIV-2024-001',       'Rajan Kumar',                  'Defendant',                'Adv. R. Patel'            UNION ALL
      SELECT 'CIV-2024-002',       'Mehta Corp',                   'Plaintiff',                'Adv. K. Shah'             UNION ALL
      SELECT 'CIV-2024-002',       'Alpha Ltd',                    'Defendant',                'Adv. V. Nair'             UNION ALL
      SELECT 'CIV-2023-087',       'Sharma',                       'Petitioner',               'Adv. P. Joshi'            UNION ALL
      SELECT 'CIV-2023-087',       'Union of India',               'Respondent',               'Adv. A. Gupta'            UNION ALL
      SELECT 'FAM-2024-011',       'Priya Desai',                  'Plaintiff',                'Adv. M. Iyer'             UNION ALL
      SELECT 'FAM-2024-011',       'Anil Desai',                   'Defendant',                'Adv. S. Sharma'           UNION ALL
      SELECT 'TAX-2023-045',       'Gupta Traders',                'Petitioner',               'Adv. R. Khanna'           UNION ALL
      SELECT 'TAX-2023-045',       'Income Tax Dept',              'Respondent',               'Adv. T. Saxena'           UNION ALL
      SELECT 'CRM-2024-033',       'State of Maharashtra',         'Plaintiff',                'Adv. B. Pillai'           UNION ALL
      SELECT 'CRM-2024-033',       'Patel Gang (7 accused)',       'Defendant',                'Adv. H. Desai'            UNION ALL
      SELECT 'IPR-2023-019',       'TechSoft Pvt Ltd',             'Plaintiff',                'Adv. C. Mehta'            UNION ALL
      SELECT 'IPR-2023-019',       'CodeWave Solutions',           'Defendant',                'Adv. F. Kumar'            UNION ALL
      SELECT 'LAB-2024-007',       'Workers Union',                'Plaintiff',                'Adv. G. Rao'              UNION ALL
      SELECT 'LAB-2024-007',       'MegaCorp Industries',          'Defendant',                'Adv. D. Singh'
     ) p ON c.case_number = p.cn;

-- ── Judgements ────────────────────────────────────────────
INSERT IGNORE INTO Judgements (case_id, judge, date, summary)
SELECT c.case_id, j.judge, j.date, j.summary FROM Cases c
JOIN (SELECT 'CIV-2023-087' AS cn, 'Justice A. Kumar' AS judge, '2024-04-10' AS date,
             'Held: Article 21 guarantees right to livelihood. State directed to comply.' AS summary UNION ALL
      SELECT 'IPR-2023-019',        'Justice P. Verma',           '2023-12-15',
             'Copyright infringement established. Damages of ₹25L awarded to TechSoft.'
     ) j ON c.case_number = j.cn;

-- ── Precedents (explicit links) ───────────────────────────
INSERT IGNORE INTO Precedents (case_id, precedent_case_id, notes)
SELECT c1.case_id, c2.case_id, p.notes
FROM Cases c1,
     Cases c2,
     (SELECT 'CIV-2024-001' AS cn1, 'CRM-2024-033' AS cn2, 'Both criminal cases in higher courts' AS notes
      UNION ALL
      SELECT 'CIV-2024-001', 'CIV-2023-087', 'Landmark SC ruling applies'
     ) p
WHERE c1.case_number = p.cn1
  AND c2.case_number = p.cn2;
