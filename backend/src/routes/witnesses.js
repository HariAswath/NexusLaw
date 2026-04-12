// src/routes/witnesses.js
const router = require('express').Router();
const pool   = require('../db/pool');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/cases/:caseId/witnesses
router.get('/:caseId/witnesses', protect, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Witnesses WHERE case_id = ?',
      [req.params.caseId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// POST /api/cases/:caseId/witnesses
router.post('/:caseId/witnesses', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, statement } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Witnesses (case_id, name, statement) VALUES (?, ?, ?)',
      [req.params.caseId, name, statement]
    );
    res.status(201).json({ success: true, witnessId: result.insertId });
  } catch (err) { next(err); }
});

// PUT /api/witnesses/witness/:id
router.put('/witness/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, statement } = req.body;
    await pool.query(
      'UPDATE Witnesses SET name=?, statement=? WHERE witness_id=?',
      [name, statement, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/witnesses/witness/:id
router.delete('/witness/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM Witnesses WHERE witness_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
