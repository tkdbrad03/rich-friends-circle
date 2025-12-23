const { Client } = require('pg');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  // Simple security - only run with secret key
  if (req.query.key !== 'setup-rfc-2024') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const client = new Client({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS members (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        name TEXT,
        phone TEXT,
        photo_url TEXT,
        bio TEXT,
        location TEXT,
        pin_number INTEGER,
        looking_for TEXT,
        offering TEXT,
        finished_scorecard TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        content TEXT,
        image_url TEXT,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
        member_id UUID REFERENCES members(id) ON DELETE CASCADE,
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT,
        description TEXT,
        date TIMESTAMP,
        location TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS resources (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT,
        description TEXT,
        url TEXT,
        type TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS applications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        location TEXT,
        golf_relationship TEXT,
        season_of_life TEXT,
        what_draws_you TEXT,
        what_to_elevate TEXT,
        interest_level TEXT,
        anything_else TEXT,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT,
        excerpt TEXT,
        content TEXT,
        image_url TEXT,
        published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create admin member (Dr. TMac) with password
    const passwordHash = await bcrypt.hash('RichFriends2026!', 10);
    
    await client.query(`
      INSERT INTO members (email, password_hash, name, pin_number, bio)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = $2,
        name = $3,
        pin_number = $4
    `, [
      'info@tmacmastermind.com',
      passwordHash,
      'Dr. TMac',
      1,
      'Nurse turned tech CEO turned golfer who plays wherever she wants, whenever she wants.'
    ]);

    return res.status(200).json({ 
      success: true, 
      message: 'Database setup complete! You can now login with: info@tmacmastermind.com / RichFriends2026!'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return res.status(500).json({ error: error.message });
  } finally {
    await client.end();
  }
};
