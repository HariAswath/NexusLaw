// src/routes/parties.js
const router = require('express').Router();
const pool   = require('../db/pool');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/cases/:caseId/parties
router.get('/:caseId/parties', protect, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Parties WHERE case_id = ? ORDER BY party_type',
      [req.params.caseId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

// POST /api/cases/:caseId/parties
router.post('/:caseId/parties', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, party_type, lawyer } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Parties (case_id, name, party_type, lawyer) VALUES (?, ?, ?, ?)',
      [req.params.caseId, name, party_type, lawyer]
    );
    res.status(201).json({ success: true, partyId: result.insertId });
  } catch (err) { next(err); }
});

// PUT /api/parties/:id
router.put('/party/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { name, party_type, lawyer } = req.body;
    await pool.query(
      'UPDATE Parties SET name=?, party_type=?, lawyer=? WHERE party_id=?',
      [name, party_type, lawyer, req.params.id]
    );
    res.json({ success: true });
  } catch (err) { next(err); }
});

// DELETE /api/parties/:id
router.delete('/party/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await pool.query('DELETE FROM Parties WHERE party_id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { next(err); }
});

module.exports = router;
