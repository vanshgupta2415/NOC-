const { sendEmail } = require('../config/email');
const logger = require('../config/logger');

// Email templates
const emailTemplates = {
  // Application submitted
  applicationSubmitted: ({ studentName, enrollmentNumber }) => ({
    subject: 'No Dues Application Submitted - MITS Gwalior',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a237e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #1a237e; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>No Dues Application Submitted</h2>
          </div>
          <div class="content">
            <p>Dear ${studentName},</p>
            <p>Your No Dues application has been successfully submitted.</p>
            <p><strong>Enrollment Number:</strong> ${enrollmentNumber}</p>
            <p>Your application is now under review by the respective authorities. You will receive email notifications at each stage of the approval process.</p>
            <p>You can track your application status by logging into the portal.</p>
            <a href="${process.env.FRONTEND_URL}/student/status" class="button">Track Application</a>
          </div>
          <div class="footer">
            <p>Madhav Institute of Technology & Science, Gwalior</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Application paused
  applicationPaused: ({ studentName, enrollmentNumber, officeName, remarks }) => ({
    subject: 'Action Required: No Dues Application Paused - MITS Gwalior',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #c62828; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #c62828; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>⚠️ No Dues Application Paused</h2>
          </div>
          <div class="content">
            <p>Dear ${studentName},</p>
            <p>Your No Dues application (Enrollment: ${enrollmentNumber}) has been paused by <strong>${officeName}</strong>.</p>
            <div class="alert">
              <strong>Remarks:</strong><br>
              ${remarks || 'Please contact the office for details.'}
            </div>
            <p><strong>Action Required:</strong></p>
            <ul>
              <li>Clear the pending dues mentioned above</li>
              <li>Contact ${officeName} for clarification if needed</li>
              <li>Re-submit your application after resolving the issues</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/student/resubmit" class="button">Re-submit Application</a>
          </div>
          <div class="footer">
            <p>Madhav Institute of Technology & Science, Gwalior</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Application approved (stage)
  stageApproved: ({ studentName, enrollmentNumber, officeName, nextStage }) => ({
    subject: 'No Dues Application Update - MITS Gwalior',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2e7d32; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✓ Application Approved</h2>
          </div>
          <div class="content">
            <p>Dear ${studentName},</p>
            <div class="success">
              <strong>Good News!</strong><br>
              Your No Dues application has been approved by <strong>${officeName}</strong>.
            </div>
            <p><strong>Enrollment Number:</strong> ${enrollmentNumber}</p>
            ${nextStage !== 'completed' ?
        `<p>Your application is now being reviewed by <strong>${nextStage}</strong>.</p>` :
        `<p>Your application has completed all approval stages!</p>`
      }
          </div>
          <div class="footer">
            <p>Madhav Institute of Technology & Science, Gwalior</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // Certificate issued
  certificateIssued: ({ studentName, enrollmentNumber, certificateNumber }) => ({
    subject: 'No Dues Certificate Issued - MITS Gwalior',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1a237e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .certificate-box { background: white; border: 2px solid #1a237e; padding: 20px; margin: 20px 0; text-align: center; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎓 No Dues Certificate Issued</h2>
          </div>
          <div class="content">
            <p>Dear ${studentName},</p>
            <p>Congratulations! Your No Dues Certificate has been successfully issued.</p>
            <div class="certificate-box">
              <h3>Certificate Details</h3>
              <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
              <p><strong>Enrollment Number:</strong> ${enrollmentNumber}</p>
              <p><strong>Student Name:</strong> ${studentName}</p>
            </div>
            <p>Please find your No Dues Certificate attached to this email.</p>
            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Keep this certificate safe for future reference</li>
              <li>This certificate is valid for all official purposes</li>
              <li>For any queries, contact the Accounts Office</li>
            </ul>
          </div>
          <div class="footer">
            <p>Madhav Institute of Technology & Science, Gwalior</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send application submitted email
const sendApplicationSubmittedEmail = async (to, data) => {
  const template = emailTemplates.applicationSubmitted(data);
  return await sendEmail({ to, ...template });
};

// Send application paused email
const sendApplicationPausedEmail = async (to, data) => {
  const template = emailTemplates.applicationPaused(data);
  return await sendEmail({ to, ...template });
};

// Send stage approved email
const sendStageApprovedEmail = async (to, data) => {
  const template = emailTemplates.stageApproved(data);
  return await sendEmail({ to, ...template });
};

// Send certificate issued email
const sendCertificateIssuedEmail = async (to, data, pdfPath) => {
  const template = emailTemplates.certificateIssued(data);
  return await sendEmail({
    to,
    ...template,
    attachments: [
      {
        filename: `No_Dues_Certificate_${data.enrollmentNumber}.pdf`,
        path: pdfPath
      }
    ]
  });
};

module.exports = {
  // Email sending functions
  sendApplicationSubmittedEmail,
  sendApplicationPausedEmail,
  sendStageApprovedEmail,
  sendCertificateIssuedEmail,

  // Template functions (for direct use in controllers)
  applicationSubmittedTemplate: emailTemplates.applicationSubmitted,
  applicationPausedTemplate: emailTemplates.applicationPaused,
  applicationApprovedTemplate: emailTemplates.stageApproved,
  certificateIssuedTemplate: emailTemplates.certificateIssued
};
