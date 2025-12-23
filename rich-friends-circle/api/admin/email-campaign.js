const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
};

// Base email template with Rich Friends Circle branding
const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Rich Friends Circle</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: 'Georgia', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF8F5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1a2f23; padding: 40px 48px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; letter-spacing: 0.2em; color: #e8ccc8; font-style: italic;">TMac Inspired presents</p>
              <h1 style="margin: 0; font-size: 28px; font-weight: 400; color: #ffffff; letter-spacing: 0.05em;">The Rich Friends Circle</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 48px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a2f23; padding: 32px 48px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ffffff;">The Rich Friends Circle</p>
              <p style="margin: 0 0 16px 0; font-size: 11px; letter-spacing: 0.15em; color: #e8ccc8;">YOUR ROOM IS WAITING</p>
              <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.4);">A TMac Inspired Experience</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Send email function
const sendEmail = async ({ to, subject, content }) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"The Rich Friends Circle" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html: emailTemplate(content)
  };
  
  return transporter.sendMail(mailOptions);
};

// Email Templates
const ADMIN_EMAIL = 'info@tmacmastermind.com';

const adminNewApplicationEmail = (application) => ({
  subject: `New Application: ${application.full_name}`,
  content: `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 400; color: #2C2C2C;">New Application Received</h2>
    
    <div style="margin: 0 0 24px 0; padding: 24px; background-color: #f7f0ef;">
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #555555;"><strong>Name:</strong> ${application.full_name}</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #555555;"><strong>Email:</strong> ${application.email}</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #555555;"><strong>Phone:</strong> ${application.phone || 'Not provided'}</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #555555;"><strong>Location:</strong> ${application.location}</p>
    </div>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://rfc.tmacmastermind.com/admin.html" style="display: inline-block; background-color: #1a2f23; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">View in Admin Panel</a>
    </div>
  `
});

const applicationReceivedEmail = (name) => ({
  subject: "We've Received Your Application — The Rich Friends Circle",
  content: `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 400; color: #2C2C2C;">Thank You, ${name}</h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; color: #555555;">
      We've received your application to join The Rich Friends Circle.
    </p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; color: #555555;">
      This is not just a membership — it's an invitation to a room where ambitious women gather, connect, and elevate together.
    </p>
    
    <div style="margin: 32px 0; padding: 24px; background-color: #f7f0ef; border-left: 3px solid #a67c52;">
      <p style="margin: 0; font-size: 14px; font-style: italic; color: #2C2C2C;">
        "The right people, at the right time, in the right room."
      </p>
    </div>
    
    <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #555555;">
      With anticipation,<br>
      <strong style="color: #2C2C2C;">Dr. TMac</strong><br>
      <span style="font-size: 13px; color: #a67c52;">Founder, The Rich Friends Circle</span>
    </p>
  `
});

const depositConfirmedEmail = (name) => ({
  subject: "You're In — Payment Confirmed",
  content: `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #1a2f23; border-radius: 50%; line-height: 64px; text-align: center;">
        <span style="color: #e8ccc8; font-size: 28px;">✓</span>
      </div>
    </div>
    
    <h2 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 400; color: #2C2C2C; text-align: center;">Welcome, ${name}</h2>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; color: #555555; text-align: center;">
      Your payment has been received. You've officially secured your seat in The Rich Friends Circle.
    </p>
    
    <p style="margin: 32px 0 0 0; font-size: 15px; line-height: 1.8; color: #555555;">
      Welcome to the room,<br>
      <strong style="color: #2C2C2C;">Dr. TMac</strong>
    </p>
  `
});

const welcomeEmail = (name, email, tempPassword, pinNumber) => ({
  subject: "Your Member Access — The Rich Friends Circle",
  content: `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 80px; height: 80px; border: 2px solid #e8ccc8; border-radius: 50%; line-height: 76px; text-align: center;">
        <span style="color: #a67c52; font-size: 32px; font-family: Georgia, serif;">#${String(pinNumber).padStart(2, '0')}</span>
      </div>
    </div>
    
    <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 400; color: #2C2C2C; text-align: center;">Welcome, ${name}</h2>
    <p style="margin: 0 0 32px 0; font-size: 14px; color: #a67c52; text-align: center; letter-spacing: 0.1em;">MEMBER #${String(pinNumber).padStart(2, '0')}</p>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; color: #555555;">
      You're officially one of us. Your place in The Rich Friends Circle is secured.
    </p>
    
    <div style="margin: 32px 0; padding: 32px; background-color: #1a2f23; text-align: center;">
      <p style="margin: 0 0 20px 0; font-size: 12px; letter-spacing: 0.2em; color: #e8ccc8;">YOUR MEMBER PORTAL ACCESS</p>
      
      <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.7);">Email</p>
      <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff;">${email}</p>
      
      <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.7);">Temporary Password</p>
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #ffffff; font-family: monospace;">${tempPassword}</p>
      
      <a href="https://rfc.tmacmastermind.com/member-login.html" style="display: inline-block; background-color: #e8ccc8; color: #1a2f23; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">Access Your Portal</a>
    </div>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; color: #555555;">
      Inside your member portal, you'll find:
    </p>
    
    <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 15px; line-height: 2; color: #555555;">
      <li>Member directory — connect with your fellow members</li>
      <li>Discussion feed — share wins and connect</li>
      <li>Resources — exclusive materials and tools</li>
      <li>Events — upcoming gatherings and calls</li>
    </ul>
    
    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.8; color: #555555;">
      Please change your password after your first login.
    </p>
    
    <div style="margin: 32px 0; padding: 24px; background-color: #f7f0ef; border-left: 3px solid #a67c52;">
      <p style="margin: 0; font-size: 14px; font-style: italic; color: #2C2C2C;">
        "You didn't just join a group. You found your room."
      </p>
    </div>
    
    <p style="margin: 0; font-size: 15px; line-height: 1.8; color: #555555;">
      See you inside,<br>
      <strong style="color: #2C2C2C;">Dr. TMac</strong><br>
      <span style="font-size: 13px; color: #a67c52;">Founder, The Rich Friends Circle</span>
    </p>
  `
});

const adminDepositPaidEmail = (name, email) => ({
  subject: `💰 Payment Received: ${name}`,
  content: `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 64px; height: 64px; background-color: #27ae60; border-radius: 50%; line-height: 64px; text-align: center;">
        <span style="color: #ffffff; font-size: 28px;">$</span>
      </div>
    </div>
    
    <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 400; color: #2C2C2C; text-align: center;">Payment Received!</h2>
    
    <div style="margin: 0 0 24px 0; padding: 24px; background-color: #e8f8f0; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 14px; color: #555555;"><strong>${name}</strong></p>
      <p style="margin: 0; font-size: 14px; color: #555555;">${email}</p>
    </div>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="https://rfc.tmacmastermind.com/admin.html" style="display: inline-block; background-color: #1a2f23; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;">View in Admin Panel</a>
    </div>
  `
});

module.exports = {
  sendEmail,
  applicationReceivedEmail,
  depositConfirmedEmail,
  welcomeEmail,
  adminNewApplicationEmail,
  adminDepositPaidEmail,
  ADMIN_EMAIL
};
