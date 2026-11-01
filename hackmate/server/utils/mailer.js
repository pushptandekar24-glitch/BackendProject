const nodemailer = require('nodemailer');

let transporter = null;

const initTransporter = () => {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your_email@gmail.com'
  ) {
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: parseInt(process.env.SMTP_PORT, 10) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('[Mailer] Nodemailer transporter initialized with SMTP configuration.');
    } catch (err) {
      console.warn('[Mailer Warning] Failed to initialize SMTP transporter:', err.message);
      transporter = null;
    }
  } else {
    console.log('[Mailer] No SMTP credentials provided. Running in Safe Dev/Preview mode (emails will be logged to console).');
  }
};

initTransporter();

/**
 * Send an email or log preview in dev mode
 */
const sendMail = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || 'HackMate <no-reply@hackmate.dev>';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
      console.log(`[Mailer] Real email sent to ${to}: messageId=${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Mailer Error] Failed to send email via SMTP: ${err.message}. Falling back to preview log.`);
    }
  }

  // Safe Fallback / Dev Mode Logging
  console.log('\n================== [EMAIL PREVIEW (MOCK)] ==================');
  console.log(`To: ${to}`);
  console.log(`From: ${from}`);
  console.log(`Subject: ${subject}`);
  console.log('--- Body ---');
  console.log(text || html);
  console.log('============================================================\n');

  return { success: true, simulated: true };
};

/**
 * Notification for when a teammate is invited
 */
const sendInvitationEmail = async ({ toEmail, toName, inviterName, teamName, hackathonTitle, message }) => {
  const subject = `You've been invited to join "${teamName}" for ${hackathonTitle}!`;
  const text = `Hi ${toName},\n\n${inviterName} has invited you to join team "${teamName}" for ${hackathonTitle} on HackMate.\n\nPersonal note: "${message}"\n\nLog in to HackMate to review and respond to this invitation.\n\nBest regards,\nThe HackMate Team`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; margin-bottom: 8px;">HackMate Team Invitation</h2>
      <p style="color: #1e293b; font-size: 16px;">Hi <strong>${toName}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">
        <strong>${inviterName}</strong> has invited you to join their team <span style="color: #4f46e5; font-weight: 600;">"${teamName}"</span> for <strong>${hackathonTitle}</strong>!
      </p>
      ${
        message
          ? `<blockquote style="background-color: #f8fafc; border-left: 4px solid #6366f1; margin: 16px 0; padding: 12px 16px; color: #475569; font-style: italic;">
              "${message}"
            </blockquote>`
          : ''
      }
      <p style="color: #475569; font-size: 14px; margin-top: 24px;">
        Head over to your HackMate Dashboard to accept or decline this invitation.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">HackMate - The Hackathon Team Finder for College Students</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};

/**
 * Notification for when an invitation is accepted or declined
 */
const sendStatusUpdateEmail = async ({ toEmail, toName, responderName, teamName, status }) => {
  const isAccepted = status === 'accepted';
  const actionText = isAccepted ? 'accepted' : 'declined';
  const subject = `Invitation ${actionText.toUpperCase()}: ${responderName} for team "${teamName}"`;
  const text = `Hi ${toName},\n\n${responderName} has ${actionText} your invitation to join "${teamName}".\n\nLog in to HackMate to see your updated team roster.\n\nBest regards,\nThe HackMate Team`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: ${isAccepted ? '#059669' : '#dc2626'}; margin-bottom: 8px;">Invitation ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}</h2>
      <p style="color: #1e293b; font-size: 16px;">Hi <strong>${toName}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.5;">
        <strong>${responderName}</strong> has <strong>${actionText}</strong> your invitation to join <span style="font-weight: 600;">"${teamName}"</span>.
      </p>
      <p style="color: #475569; font-size: 14px; margin-top: 24px;">
        ${isAccepted ? 'Congratulations! They are now an active member of your team roster.' : 'You can find other talented teammates on the Find Teammates page.'}
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">HackMate - The Hackathon Team Finder for College Students</p>
    </div>
  `;

  return sendMail({ to: toEmail, subject, text, html });
};

module.exports = {
  sendMail,
  sendInvitationEmail,
  sendStatusUpdateEmail,
};

