// backend/migration_tickets.js
require('dotenv').config({ path: './backend/.env' });
const pool = require('./src/db/pool');

async function migrate() {
  try {
    console.log('Running Support Tickets migration...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS SupportTickets (
        ticket_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id      INT UNSIGNED NOT NULL,
        category     ENUM('Technical Issue', 'Case Filing Help', 'Billing', 'General Inquiry') NOT NULL,
        subject      VARCHAR(255) NOT NULL,
        description  TEXT NOT NULL,
        status       ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
        admin_id     INT UNSIGNED,
        admin_reply  TEXT,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES Users(user_id) ON DELETE SET NULL,
        INDEX idx_ticket_status (status),
        INDEX idx_ticket_user   (user_id)
      ) ENGINE=InnoDB;
    `);
    
    console.log(' SupportTickets table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error(' Migration failed:', err);
    process.exit(1);
  }
}

migrate();
