// backend/src/routes/tickets.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Create a ticket (User)
router.post('/', async (req, res) => {
  const { category, subject, description } = req.body;
  const userId = req.user.id; // Assuming auth middleware adds user to req

  try {
    const [result] = await pool.execute(
      'INSERT INTO SupportTickets (user_id, category, subject, description) VALUES (?, ?, ?, ?)',
      [userId, category, subject, description]
    );
    res.status(201).json({ message: 'Ticket created successfully', ticketId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tickets (User sees their own, Admin sees all)
router.get('/', async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let query = `
      SELECT t.*, u.name as user_name, a.name as admin_name 
      FROM SupportTickets t
      JOIN Users u ON t.user_id = u.user_id
      LEFT JOIN Users a ON t.admin_id = a.user_id
    `;
    let params = [];

    if (role !== 'admin') {
      query += ' WHERE t.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update ticket status/reply (Admin)
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, admin_reply } = req.body;
  const adminId = req.user.id;

  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

  try {
    // Calling Stored Procedure instead of raw UPDATE
    await pool.execute(
      'CALL sp_ResolveTicket(?, ?, ?, ?)',
      [id, adminId, admin_reply, status || 'Resolved']
    );
    res.json({ message: 'Ticket resolved via Stored Procedure' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
