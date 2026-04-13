const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  // If credentials not set, skip silently — app still works
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS ||
    process.env.EMAIL_USER === "your_gmail_address@gmail.com"
  ) {
    console.log(`[Email skipped — no credentials] To: ${to} | ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"MIT Internship Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    // Never crash the server due to email failure
    console.error(`Email failed for ${to}:`, error.message);
  }
}

module.exports = sendEmail;
