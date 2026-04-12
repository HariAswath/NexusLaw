// remove_trigger.js
require('dotenv').config();
const pool = require('./src/db/pool');

async function main() {
  await pool.query('DROP TRIGGER IF EXISTS tr_case_status_audit');
  console.log('Trigger dropped.');
  process.exit(0);
}
main();
