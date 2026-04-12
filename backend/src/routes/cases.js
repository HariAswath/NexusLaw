// src/routes/cases.js
const router = require('express').Router();
const pool   = require('../db/pool');
const { protect, adminOnly } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════════
//  HELPER — fetch keywords array for a case
// ═══════════════════════════════════════════════════════════════════
const getKeywords = async (caseId) => {
  const [rows] = await pool.query(
    `SELECT k.keyword
     FROM Keywords k
     JOIN CaseKeywords ck ON k.keyword_id = ck.keyword_id
     WHERE ck.case_id = ?`,
    [caseId]
  );
  return rows.map((r) => r.keyword);
};

// ═══════════════════════════════════════════════════════════════════
//  GET /api/cases/stats
//  Dashboard statistics
// ═══════════════════════════════════════════════════════════════════
router.get('/stats', protect, async (req, res, next) => {
  try {
    // Status counts
    const [statusRows] = await pool.query(
      `SELECT status, COUNT(*) AS cnt FROM Cases GROUP BY status`
    );
    const counts = { Open: 0, Closed: 0, Pending: 0, Appealed: 0 };
    statusRows.forEach((r) => { counts[r.status] = r.cnt; });

    // Total
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM Cases');

    // By type
    const [typeRows] = await pool.query(
      `SELECT case_type AS name, COUNT(*) AS value FROM Cases GROUP BY case_type ORDER BY value DESC`
    );

    // Recent 5
    const [recentRows] = await pool.query(
      `SELECT case_id, case_number, title, case_type, court, status, date_filed
       FROM Cases ORDER BY date_filed DESC LIMIT 5`
    );

    // Attach keywords to recent cases
    const recentCases = await Promise.all(
      recentRows.map(async (c) => ({ ...c, keywords: await getKeywords(c.case_id) }))
    );

    res.json({
      success: true,
      data: {
        total,
        open:     counts['Open'],
        closed:   counts['Closed'],
        pending:  counts['Pending'],
        appealed: counts['Appealed'],
        byType: typeRows,
        recentCases,
      },
    });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════
//  GET /api/cases
//  Multi-filter search: case_type, court, status, keywords
// ═══════════════════════════════════════════════════════════════════
router.get('/', protect, async (req, res, next) => {
  try {
    const { case_type, court, status, keywords, search } = req.query;

    let sql = `SELECT DISTINCT c.case_id, c.case_number, c.title,
                       c.case_type, c.court, c.status, c.date_filed, c.description
                FROM Cases c`;
    const params = [];

    // Joins for searching
    if (search) {
      sql += `
        LEFT JOIN Parties p ON c.case_id = p.case_id
        LEFT JOIN Witnesses w ON c.case_id = w.case_id`;
    }

    // If keyword filter → join through CaseKeywords + Keywords
    if (keywords) {
      const kwList = keywords.split(',').map((k) => k.trim()).filter(Boolean);
      if (kwList.length) {
        sql += `
          JOIN CaseKeywords ck ON c.case_id = ck.case_id
          JOIN Keywords k      ON ck.keyword_id = k.keyword_id`;
        const placeholders = kwList.map(() => 'k.keyword LIKE ?').join(' OR ');
        sql += (sql.includes('WHERE') ? ' AND ' : ' WHERE ') + `(${placeholders})`;
        kwList.forEach((kw) => params.push(`%${kw}%`));
      }
    }

    const conditions = [];
    if (case_type) { conditions.push(`c.case_type = ?`); params.push(case_type); }
    if (court)     { conditions.push(`c.court = ?`);     params.push(court); }
    if (status)    { conditions.push(`c.status = ?`);    params.push(status); }

    if (search) {
      conditions.push(`(c.title LIKE ? OR c.case_number LIKE ? OR p.name LIKE ? OR w.name LIKE ?)`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length) {
      if (!sql.includes('WHERE')) {
        sql += ` WHERE ` + conditions.join(' AND ');
      } else {
        sql += ` AND ` + conditions.join(' AND ');
      }
    }

    sql += ` ORDER BY c.date_filed DESC`;

    const [rows] = await pool.query(sql, params);

    // Attach keywords to each case
    const cases = await Promise.all(
      rows.map(async (c) => ({ ...c, keywords: await getKeywords(c.case_id) }))
    );

    res.json({ success: true, data: cases });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════
//  GET /api/cases/:id
//  Single case with parties, judgement, keywords
// ═══════════════════════════════════════════════════════════════════
router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[caseRow]] = await pool.query(
      'SELECT * FROM Cases WHERE case_id = ?', [id]
    );
    if (!caseRow) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const [parties]    = await pool.query('SELECT * FROM Parties WHERE case_id = ?', [id]);
    const [witnesses]  = await pool.query('SELECT * FROM Witnesses WHERE case_id = ?', [id]);
    const [judgements] = await pool.query('SELECT * FROM Judgements WHERE case_id = ? LIMIT 1', [id]);
    const keywords     = await getKeywords(id);

    res.json({
      success: true,
      data: {
        ...caseRow,
        parties,
        witnesses,
        judgement: judgements[0] || null,
        keywords,
      },
    });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════
//  GET /api/cases/:id/precedents
//  Ranked precedent retrieval
//  Score = case_type match (40) + shared keywords (up to 40) + court (20)
// ═══════════════════════════════════════════════════════════════════
router.get('/:id/precedents', protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get current case
    const [[curCase]] = await pool.query(
      'SELECT case_id, case_type, court FROM Cases WHERE case_id = ?', [id]
    );
    if (!curCase) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Get current case keywords
    const curKeywords = await getKeywords(id);

    // 1. Fetch explicitly linked precedents from Precedents table
    const [linkedRows] = await pool.query(
      `SELECT c.case_id, c.case_number, c.title, c.case_type, c.court, c.status, c.date_filed
       FROM Precedents p
       JOIN Cases c ON (
         (p.case_id = ? AND c.case_id = p.precedent_case_id)
         OR
         (p.precedent_case_id = ? AND c.case_id = p.case_id)
       )
       WHERE c.case_id != ?`,
      [id, id, id]
    );

    // 2. Also find similar cases dynamically (same type or shared keywords)
    const [similarRows] = await pool.query(
      `SELECT DISTINCT c.case_id, c.case_number, c.title, c.case_type, c.court, c.status, c.date_filed
       FROM Cases c
       WHERE c.case_id != ?
         AND (c.case_type = ? OR c.court = ?)
       ORDER BY c.date_filed DESC
       LIMIT 10`,
      [id, curCase.case_type, curCase.court]
    );

    // Merge linked + similar (linked take priority, deduplicate)
    const seen   = new Set();
    const merged = [];
    for (const r of [...linkedRows, ...similarRows]) {
      if (!seen.has(r.case_id)) { seen.add(r.case_id); merged.push(r); }
    }

    // Score each candidate
    const scored = await Promise.all(
      merged.map(async (c) => {
        const candKeywords  = await getKeywords(c.case_id);
        const isLinked      = linkedRows.some((l) => l.case_id === c.case_id);
        const match_reasons = [];
        let score           = 0;

        // +40 if explicitly linked
        if (isLinked) { score += 40; match_reasons.push('precedent_link'); }

        // +30 same case type
        if (c.case_type === curCase.case_type) { score += 30; match_reasons.push('case_type'); }

        // +20 same court
        if (c.court === curCase.court) { score += 20; match_reasons.push('court'); }

        // +up to 30 shared keywords  (10 pts each, max 3)
        const shared = curKeywords.filter((kw) => candKeywords.includes(kw));
        const kwScore = Math.min(shared.length * 10, 30);
        if (kwScore > 0) { score += kwScore; match_reasons.push('keywords'); }

        // Cap at 99
        const relevance_score = Math.min(score, 99);

        return { ...c, keywords: candKeywords, relevance_score, match_reasons };
      })
    );

    // Sort by relevance descending, return top 10
    const sorted = scored
      .filter((c) => c.relevance_score > 0)
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 10);

    res.json({ success: true, data: sorted });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════
//  GET /api/cases/:id/logs
//  Fetch audit trail for a case
// ═══════════════════════════════════════════════════════════════════
router.get('/:id/logs', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT l.*, u.name AS user_name 
       FROM CaseLogs l 
       LEFT JOIN Users u ON l.user_id = u.user_id 
       WHERE l.case_id = ? 
       ORDER BY l.created_at DESC`,
      [id]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════
//  POST /api/cases — Create case
// ═══════════════════════════════════════════════════════════════════
router.post('/', protect, adminOnly, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { title, case_number, case_type, court, status = 'Open', date_filed, description, keywords = [], parties = [], witnesses = [] } = req.body;

    if (!title || !case_number || !case_type || !court) {
      return res.status(400).json({ success: false, message: 'title, case_number, case_type and court are required' });
    }

    const [result] = await conn.query(
      `INSERT INTO Cases (title, case_number, case_type, court, status, date_filed, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, case_number, case_type, court, status, date_filed || null, description || null]
    );
    const caseId = result.insertId;

    // Upsert keywords
    await upsertKeywords(conn, caseId, keywords);

    // Insert Parties
    for (const p of parties) {
      await conn.query(
        'INSERT INTO Parties (case_id, name, party_type, lawyer) VALUES (?, ?, ?, ?)',
        [caseId, p.name, p.party_type, p.lawyer]
      );
    }

    // Insert Witnesses
    for (const w of witnesses) {
      await conn.query(
        'INSERT INTO Witnesses (case_id, name, statement) VALUES (?, ?, ?)',
        [caseId, w.name, w.statement]
      );
    }

    // Log Creation
    await conn.query(
      'INSERT INTO CaseLogs (case_id, user_id, event_type, new_value, notes) VALUES (?, ?, ?, ?, ?)',
      [caseId, req.user.user_id, 'Creation', status, 'Case initialized in system']
    );

    await conn.commit();
    res.status(201).json({ success: true, case_id: caseId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// ═══════════════════════════════════════════════════════════════════
//  PUT /api/cases/:id — Update case
// ═══════════════════════════════════════════════════════════════════
router.put('/:id', protect, adminOnly, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id } = req.params;
    const { title, case_number, case_type, court, status, date_filed, description, keywords, parties, witnesses } = req.body;

    // Manual status change log (to capture user_id)
    // Capture status BEFORE update to compare
    const [[oldCase]] = await conn.query('SELECT status FROM Cases WHERE case_id = ?', [id]);

    // Validation: If status is being changed to 'Closed', check for existing judgement
    if (status === 'Closed' && oldCase.status !== 'Closed') {
      const [[judgement]] = await conn.query('SELECT judgement_id FROM Judgements WHERE case_id = ?', [id]);
      if (!judgement) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cannot close case without a recorded judgement. Please update the judgement first.' 
        });
      }
    }

    await conn.query(
      `UPDATE Cases SET title=?, case_number=?, case_type=?, court=?, status=?, date_filed=?, description=?
       WHERE case_id=?`,
      [title, case_number, case_type, court, status, date_filed || null, description || null, id]
    );

    if (oldCase && status && oldCase.status !== status) {
       await conn.query(
         'INSERT INTO CaseLogs (case_id, user_id, event_type, old_value, new_value, notes) VALUES (?, ?, ?, ?, ?, ?)',
         [id, req.user.user_id, 'StatusChange', oldCase.status, status, 'Status updated by user']
       );
    }

    if (Array.isArray(keywords)) {
      await conn.query('DELETE FROM CaseKeywords WHERE case_id = ?', [id]);
      await upsertKeywords(conn, id, keywords);
    }

    if (Array.isArray(parties)) {
      await conn.query('DELETE FROM Parties WHERE case_id = ?', [id]);
      for (const p of parties) {
        await conn.query(
          'INSERT INTO Parties (case_id, name, party_type, lawyer) VALUES (?, ?, ?, ?)',
          [id, p.name, p.party_type, p.lawyer]
        );
      }
    }

    if (Array.isArray(witnesses)) {
      await conn.query('DELETE FROM Witnesses WHERE case_id = ?', [id]);
      for (const w of witnesses) {
        await conn.query(
          'INSERT INTO Witnesses (case_id, name, statement) VALUES (?, ?, ?)',
          [id, w.name, w.statement]
        );
      }
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// ═══════════════════════════════════════════════════════════════════
//  DELETE /api/cases/:id
// ═══════════════════════════════════════════════════════════════════
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM Cases WHERE case_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ═══════════════════════════════════════════════════════════════════
//  HELPER — upsert keywords and link to case
// ═══════════════════════════════════════════════════════════════════
async function upsertKeywords(conn, caseId, keywords) {
  for (const kw of keywords) {
    const trimmed = kw.trim().toLowerCase();
    if (!trimmed) continue;

    // Insert keyword if not exists
    const [kwResult] = await conn.query(
      'INSERT INTO Keywords (keyword) VALUES (?) ON DUPLICATE KEY UPDATE keyword_id = LAST_INSERT_ID(keyword_id)',
      [trimmed]
    );
    const kwId = kwResult.insertId;

    // Link to case (ignore duplicate)
    await conn.query(
      'INSERT IGNORE INTO CaseKeywords (case_id, keyword_id) VALUES (?, ?)',
      [caseId, kwId]
    );
  }
}

module.exports = router;
