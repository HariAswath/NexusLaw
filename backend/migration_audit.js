// migration_audit.js
require('dotenv').config();
const pool = require('./src/db/pool');

async function migrate() {
  try {
    console.log('Running Audit Trail migration...');
    
    // 1. Create CaseLogs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS CaseLogs (
        log_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        case_id     INT UNSIGNED NOT NULL,
        user_id     INT UNSIGNED,
        event_type  ENUM('Creation', 'StatusChange', 'DetailUpdate') NOT NULL,
        old_value   VARCHAR(100),
        new_value   VARCHAR(100),
        notes       TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES Cases(case_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB;
    `);
    console.log('CaseLogs table created.');

    // 2. Create Trigger for Status Change
    await pool.query(`DROP TRIGGER IF EXISTS tr_case_status_audit;`);
    await pool.query(`
      CREATE TRIGGER tr_case_status_audit
      AFTER UPDATE ON Cases
      FOR EACH ROW
      BEGIN
        IF OLD.status <> NEW.status THEN
          INSERT INTO CaseLogs (case_id, event_type, old_value, new_value, notes)
          VALUES (OLD.case_id, 'StatusChange', OLD.status, NEW.status, 'Status updated via system');
        END IF;
      END;
    `);
    console.log(' Status change trigger created.');

    process.exit(0);
  } catch (err) {
    console.error(' Migration failed:', err);
    process.exit(1);
  }
}

migrate();
