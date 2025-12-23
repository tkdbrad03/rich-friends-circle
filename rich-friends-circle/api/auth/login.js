const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, pin } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find member by email
    const { data: member, error } = await supabase
      .from('members')
      .select('id, email, name, pin_number, is_admin, photo_url')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !member) {
      return res.status(401).json({ error: 'No account found with this email. Please check your email or contact support.' });
    }

    // If PIN is provided, verify it
    if (pin && member.pin_number) {
      if (String(pin) !== String(member.pin_number)) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
    }

    // Generate a simple session token
    const sessionToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store session
    await supabase
      .from('sessions')
      .insert({
        token: sessionToken,
        member_id: member.id,
        expires_at: expiresAt.toISOString()
      });

    // Set cookie
    res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

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
  }
};
