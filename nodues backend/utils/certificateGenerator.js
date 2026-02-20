const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

// Ensure certificate directory exists
const certificateDir = process.env.CERTIFICATE_DIR || './certificates';
if (!fs.existsSync(certificateDir)) {
  fs.mkdirSync(certificateDir, { recursive: true });
}

// Generate certificate number
const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MITS/ND/${year}/${random}`;
};

// Generate HTML template for certificate
const generateCertificateHTML = ({
  certificateNumber,
  studentName,
  enrollmentNumber,
  fatherName,
  emailAddress,
  dateOfBirth,
  branch,
  address,
  passOutYear,
  hostelInvolved,
  cautionMoneyRefund,
  libraryDues,
  tcNumber,
  tcDate,
  approvalStages,
  issueDate
}) => {
  const formattedDate = new Date(issueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const dobFormatted = dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('en-IN') : 'N/A';
  const tcDateFormatted = tcDate ? new Date(tcDate).toLocaleDateString('en-IN') : 'N/A';

  // Map stages for easy access in the vertical table
  const stageMap = {};
  approvalStages.forEach(s => {
    stageMap[s.role] = s;
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>No Dues Certificate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 30px; background: white; color: #333; }
    .certificate { max-width: 850px; margin: 0 auto; border: 1px solid #ddd; padding: 30px; position: relative; }
    
    .header { text-align: center; margin-bottom: 20px; }
    .logo-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .college-logo { height: 60px; }
    .college-info { flex: 1; text-align: center; }
    .college-name { font-size: 20px; font-weight: bold; color: #1a237e; }
    .college-sub { font-size: 10px; color: #666; margin-top: 2px; }
    
    .title { font-size: 18px; font-weight: bold; text-decoration: underline; margin: 15px 0; text-align: center; }
    .cert-meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 20px; }
    
    .section-title { font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0 10px; color: #444; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    table td { border: 1px solid #ccc; padding: 8px 12px; vertical-align: top; }
    .label { font-weight: bold; width: 40%; background-color: #fcfcfc; }
    
    .status-box { border: 1px solid #ccc; border-radius: 15px; padding: 15px; margin-top: 10px; }
    .status-row { display: flex; border-bottom: 1px solid #eee; padding: 8px 0; }
    .status-row:last-child { border-bottom: none; }
    .status-label { font-weight: bold; width: 40%; }
    .status-value { color: #555; }

    .declaration { font-size: 12px; margin: 30px 0; line-height: 1.5; }
    .signature-area { margin-top: 50px; }
    .signature-label { font-size: 13px; font-weight: bold; }
    .signature-value { font-size: 12px; color: #777; margin-top: 5px; }

    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 100px; color: rgba(26, 35, 126, 0.03); font-weight: bold; z-index: -1; pointer-events: none; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="watermark">MITS GWALIOR</div>
    
    <div class="header">
      <div class="college-name">माधव प्रौद्योगिकी एवं विज्ञान संस्थान, ग्वालियर (म.प्र.), भारत</div>
      <div class="college-name">MADHAV INSTITUTE OF TECHNOLOGY & SCIENCE, GWALIOR (M.P.), INDIA</div>
      <div class="college-sub">(Deemed to be University)</div>
      <div class="college-sub">NAAC ACCREDITED WITH A++ GRADE</div>
      <div class="title">No Dues Certificate</div>
    </div>

    <div class="cert-meta">
      <div>Enrollment: <strong>${enrollmentNumber}</strong></div>
      <div>Date: <strong>${formattedDate}</strong></div>
    </div>

    <div class="section-title">Student's Information</div>
    <table>
      <tr><td class="label">Enrollment</td><td>${enrollmentNumber}</td></tr>
      <tr><td class="label">Name</td><td>${studentName}</td></tr>
      <tr><td class="label">Father's Name</td><td>${fatherName}</td></tr>
      <tr><td class="label">Email Address</td><td>${emailAddress || 'N/A'}</td></tr>
      <tr><td class="label">Date of Birth</td><td>${dobFormatted}</td></tr>
      <tr><td class="label">Branch</td><td>${branch}</td></tr>
      <tr><td class="label">Address</td><td>${address}</td></tr>
      <tr><td class="label">Caution Money Refund Required</td><td>${cautionMoneyRefund ? 'Yes' : 'No'}</td></tr>
      <tr><td class="label">Hostel Resident</td><td>${hostelInvolved ? 'Yes' : 'No'}</td></tr>
    </table>

    <div class="section-title">Office No Dues Status</div>
    <div class="status-box">
      <div class="status-row"><div class="status-label">T & P</div><div class="status-value">${stageMap['tp_admin']?.status === 'Approved' ? 'Cleared' : 'Pending'}</div></div>
      <div class="status-row"><div class="status-label">Department</div><div class="status-value">${stageMap['hod']?.status === 'Approved' ? 'Cleared' : 'Pending'}</div></div>
      <div class="status-row"><div class="status-label">Workshop</div><div class="status-value">${stageMap['workshop_admin']?.status === 'Approved' ? 'Cleared' : 'Pending'}</div></div>
      <div class="status-row"><div class="status-label">Library</div><div class="status-value">${stageMap['library_admin']?.status === 'Approved' ? 'Cleared' : 'Pending'}</div></div>
      <div class="status-row"><div class="status-label">Library Dues</div><div class="status-value">${libraryDues || 'Nil'}</div></div>
      <div class="status-row"><div class="status-label">Hostel Warden</div><div class="status-value">${hostelInvolved ? (stageMap['hostel_admin']?.status === 'Approved' ? 'Cleared' : 'Pending') : 'Not Applicable'}</div></div>
      <div class="status-row"><div class="status-label">Account</div><div class="status-value">${stageMap['accounts_office']?.status === 'Approved' ? 'Cleared' : 'Pending'}</div></div>
      <div class="status-row"><div class="status-label">Account No Dues Date</div><div class="status-value">${stageMap['accounts_office']?.approvedAt ? new Date(stageMap['accounts_office'].approvedAt).toLocaleDateString('en-IN') : 'N/A'}</div></div>
      <div class="status-row"><div class="status-label">General office TC No. and Date</div><div class="status-value">${tcNumber || 'N/A'} ${tcDate ? ' - ' + tcDateFormatted : ''}</div></div>
    </div>

    <div class="declaration">
      Declaration: I hereby declare that the information furnished above is true and correct.
    </div>

    <div class="signature-area">
      <div class="signature-label">Student signature</div>
      <div class="signature-value">Electronically Generated</div>
    </div>
  </div>
</body>
</html>
  `;
};

// Generate PDF certificate
const generateCertificatePDF = async (certificateData) => {
  let browser;
  try {
    const certificateNumber = generateCertificateNumber();
    const html = generateCertificateHTML({ ...certificateData, certificateNumber });

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate filename
    const filename = `${certificateNumber.replace(/\//g, '-')}.pdf`;
    const filepath = path.join(certificateDir, filename);

    // Generate PDF
    await page.pdf({
      path: filepath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    logger.info(`Certificate PDF generated: ${filename}`);
    return {
      certificateNumber,
      pdfPath: filepath
    };
  } catch (error) {
    if (browser) await browser.close();
    logger.error(`Failed to generate certificate PDF: ${error.message}`);
    throw error;
  }
};

module.exports = {
  generateCertificateNumber,
  generateCertificateHTML,
  generateCertificate: generateCertificatePDF
};
