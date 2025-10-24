// Node.js Express server for company website
// Handles static file serving and contact form email functionality

// Import required dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware configuration
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Email transport configuration function
// Creates nodemailer transport using environment variables
// Required environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// Optional environment variables: SMTP_SECURE ("true"/"false"), TO_EMAIL
function createTransport() {
  // Extract SMTP configuration from environment variables
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587); // Default to port 587
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || 'false') === 'true'; // Convert string to boolean

  // Validate required configuration
  if (!host || !user || !pass) {
    throw new Error('SMTP configuration missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS.');
  }

  // Create and return nodemailer transport
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

// API endpoint for handling contact form submissions
// POST /api/send-email - Sends contact form data via email
app.post('/api/send-email', async (req, res) => {
  try {
    // Extract form data from request body with fallback to empty object
    const { name, email, company, phone, message } = req.body || {};
    
    // Set recipient email (defaults to ganeshtp92@gmail.com if TO_EMAIL not set)
    const to = process.env.TO_EMAIL || 'ganeshtp92@gmail.com';

    // Create email transport
    const transporter = createTransport();
    
    // Format email subject with name and company
    const subject = `Website Contact: ${name || 'New Inquiry'}${company ? ' - ' + company : ''}`;
    
    // Format email body with all form fields
    const text = [
      `Name: ${name || ''}`,
      `Email: ${email || ''}`,
      `Company: ${company || ''}`,
      `Phone: ${phone || ''}`,
      '',
      'Message:',
      message || ''
    ].join('\n');

    // Send email using nodemailer
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER, // Use SMTP_FROM or fallback to SMTP_USER
      to,
      subject,
      text
    });

    // Return success response
    res.json({ ok: true });
  } catch (err) {
    // Log error and return error response
    console.error('send-email error:', err.message);
    res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});


