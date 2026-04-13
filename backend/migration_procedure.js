// backend/migration_procedure.js
require('dotenv').config({ path: './backend/.env' });
const pool = require('./src/db/pool');

async function migrate() {
  try {
    console.log('Creating Stored Procedure: sp_ResolveTicket...');
    
    // First, drop if exists
    await pool.query('DROP PROCEDURE IF EXISTS sp_ResolveTicket');
    
    // Create the procedure
    // Note: mysql2/promise doesn't need DELIMITER changes usually
    await pool.query(`
      CREATE PROCEDURE sp_ResolveTicket(
          IN p_ticket_id INT,
          IN p_admin_id INT,
          IN p_reply TEXT,
          IN p_status VARCHAR(50)
      )
      BEGIN
          UPDATE SupportTickets 
          SET 
              status = p_status, 
              admin_reply = p_reply, 
              admin_id = p_admin_id,
              updated_at = CURRENT_TIMESTAMP
          WHERE ticket_id = p_ticket_id;
      END
    `);
    
    console.log('✅ Stored Procedure created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
