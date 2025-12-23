const { Client } = require('pg');
const { generateSessionToken, createSessionCookie } = require('../../session-protection');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find member by email
    const result = await client.query(
      'SELECT id, email, name, pin_number, is_admin, photo_url FROM members WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email. Please check your email or contact support.' });
    }

    const member = result.rows[0];

    // Generate session token
    const sessionToken = generateSessionToken();

    // Store session in database
    await client.query(
      'INSERT INTO sessions (token, member_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'7 days\')',
      [sessionToken, member.id]
    );

    // Set session cookie
    res.setHeader('Set-Cookie', createSessionCookie(sessionToken));

    return res.status(200).json({
      success: true,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        pin_number: member.pin_number,
        is_admin: member.is_admin,
        photo_url: member.photo_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.end();
  }
};
