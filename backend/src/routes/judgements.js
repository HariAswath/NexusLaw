// src/routes/judgements.js
const router = require('express').Router();
const pool   = require('../db/pool');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/cases/:caseId/judgement
router.get('/:caseId/judgement', protect, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Judgements WHERE case_id = ? LIMIT 1',
      [req.params.caseId]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (err) { next(err); }
});

// POST /api/cases/:caseId/judgement
router.post('/:caseId/judgement', protect, adminOnly, async (req, res, next) => {
  try {
    const { judge, date, summary } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Judgements (case_id, judge, date, summary) VALUES (?, ?, ?, ?)',
      [req.params.caseId, judge, date, summary]
    );
    res.status(201).json({ success: true, judgementId: result.insertId });
  } catch (err) { next(err); }
});

// PUT /api/judgements/:id
router.put('/judgement/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { judge, date, summary } = req.body;
    await pool.query(
      'UPDATE Judgements SET judge=?, date=?, summary=? WHERE judgement_id=?',
      [judge, date, summary, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
