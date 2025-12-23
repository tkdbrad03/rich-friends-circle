const { Client } = require('pg');

module.exports = async (req, res) => {
  if (req.query.key !== 'setup-rfc-2024') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Add updated_at column if it doesn't exist
    await client.query(`
      ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    return res.status(200).json({ 
      success: true, 
      message: 'Added updated_at column to members table'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
