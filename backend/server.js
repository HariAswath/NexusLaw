// server.js — Entry point
require('dotenv').config();
const app  = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('');
  console.log('  ⚖️  NexusLaw API Server');
  console.log(`  🚀  Running on http://localhost:${PORT}`);
  console.log(`  📦  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});
