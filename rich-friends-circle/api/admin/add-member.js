const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { sendEmail, welcomeEmail } = require('../lib/email');

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

    const { full_name, email, phone, pin_number } = req.body;

    // Validate required fields
    if (!full_name || !email || !pin_number) {
      return res.status(400).json({ error: 'Name, email, and pin number are required' });
    }

    // Check if pin number is already taken
    const existingPin = await client.query(
      'SELECT id FROM members WHERE pin_number = $1',
      [pin_number]
    );
    
    if (existingPin.rows.length > 0) {
      return res.status(400).json({ error: `Pin #${String(pin_number).padStart(2, '0')} is already assigned` });
    }

    // Check if email already exists
    const existingEmail = await client.query(
      'SELECT id FROM members WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'A member with this email already exists' });
    }

    // Generate temporary password
    const tempPassword = 'RichFriends' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create member account
    await client.query(
      `INSERT INTO members (email, password_hash, name, phone, pin_number, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [email.toLowerCase(), passwordHash, full_name, phone || null, pin_number]
    );

    // Send welcome email with login credentials
    try {
      const emailContent = welcomeEmail(full_name, email, tempPassword, pin_number);
      await sendEmail({
        to: email,
        subject: emailContent.subject,
        content: emailContent.content
      });
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
      // Don't fail the request if email fails
    }

    return res.status(200).json({
      success: true,
      temp_password: tempPassword,
      message: `Member added successfully. Welcome email sent to ${email}`
    });

  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    await client.end();
  }
};
