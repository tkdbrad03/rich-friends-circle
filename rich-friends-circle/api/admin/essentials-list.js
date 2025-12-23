const { Client } = require('pg');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Check if table exists first
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'resources'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      return res.status(200).json([]);
    }

    const result = await client.query(
      'SELECT * FROM resources ORDER BY created_at DESC'
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('List resources error:', error);
    // Return empty array instead of error so page loads
    return res.status(200).json([]);
  } finally {
    await client.end();
  }
};
