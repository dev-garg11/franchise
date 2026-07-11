import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const isConfigured = SMTP_USER && SMTP_PASS;

const transporter = isConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

// Helper to format currency
const formatLakhs = (val) => {
  if (!val) return "N/A";
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakhs`;
  return `₹${val.toLocaleString("en-IN")}`;
};

// Base HTML wrapper template
const baseTemplate = (title, contentHeader, contentBody) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border-top: 6px solid #4f46e5; overflow: hidden; }
    .header { padding: 30px; background-color: #1e1b4b; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header span { color: #f59e0b; }
    .content { padding: 40px 30px; line-height: 1.6; }
    .content h2 { margin-top: 0; font-size: 20px; color: #1e1b4b; }
    .details-table { width: 100%; border-collapse: collapse; margin: 24px 0; background-color: #f8fafc; border-radius: 8px; overflow: hidden; }
    .details-table td { padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .details-table tr:last-child td { border-bottom: none; }
    .details-table td.label { font-weight: 600; color: #64748b; width: 35%; }
    .details-table td.value { color: #0f172a; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 20px; text-align: center; }
    .footer { padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 15px; }
    .badge-pending { background-color: #fef3c7; color: #d97706; }
    .badge-approved { background-color: #d1fae5; color: #059669; }
    .badge-declined { background-color: #fee2e2; color: #dc2626; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Franchise<span>Apply</span></h1>
    </div>
    <div class="content">
      ${contentHeader}
      ${contentBody}
    </div>
    <div class="footer">
      <p>This is an automated notification from Franchise Apply.</p>
      <p>&copy; ${new Date().getFullYear()} Franchise Apply India. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

async function sendMail({ to, subject, html }) {
  if (!isConfigured) {
    console.log("\n------------------- MOCK EMAIL TRIGGERED -------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Email Transporter not fully configured in .env (SMTP_USER/SMTP_PASS missing).");
    console.log("Email HTML Content:");
    console.log(html);
    console.log("------------------------------------------------------------\n");
    return { mock: true, messageId: `mock-${Date.now()}` };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Franchise Apply" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Failed to send email via Nodemailer:", error);
    throw error;
  }
}

// 1. Send Brand Registration Email
export async function sendBrandRegistrationEmail(brand) {
  const title = "Brand Registration Received - Franchise Apply";
  const contentHeader = `
    <span class="badge badge-pending">Pending Review</span>
    <h2>Hello ${brand.name},</h2>
    <p>Thank you for registering your brand on Franchise Apply! Your listing has been received and is currently under review by our moderation team. You will receive an email once it is approved and live on the platform.</p>
  `;
  const contentBody = `
    <table class="details-table">
      <tr>
        <td class="label">Brand Name</td>
        <td class="value">${brand.name}</td>
      </tr>
      <tr>
        <td class="label">Company Name</td>
        <td class="value">${brand.company || "N/A"}</td>
      </tr>
      <tr>
        <td class="label">Category</td>
        <td class="value">${brand.category}</td>
      </tr>
      <tr>
        <td class="label">Investment Range</td>
        <td class="value">${formatLakhs(brand.minInvestment)} - ${formatLakhs(brand.maxInvestment)}</td>
      </tr>
      <tr>
        <td class="label">Contact Phone</td>
        <td class="value">${brand.phone || "N/A"}</td>
      </tr>
    </table>
    <p>If you need to make any changes to your submission, please reach out to our support team.</p>
  `;

  return await sendMail({
    to: brand.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 2. Send Investor Registration Email
export async function sendInvestorRegistrationEmail(investor) {
  const title = "Thank you for your Enquiry - Franchise Apply";
  const contentHeader = `
    <h2>Hello ${investor.name},</h2>
    <p>Thank you for submitting your franchise investment enquiry! We have received your parameters and target budget. Our team and matching franchise brands will get in touch with you shortly.</p>
  `;
  const contentBody = `
    <table class="details-table">
      <tr>
        <td class="label">Name</td>
        <td class="value">${investor.name}</td>
      </tr>
      <tr>
        <td class="label">Budget Range</td>
        <td class="value">${formatLakhs(investor.budgetMin)} - ${formatLakhs(investor.budgetMax)}</td>
      </tr>
      <tr>
        <td class="label">Preferred Location</td>
        <td class="value">${investor.preferredLocation || "Any Location"}</td>
      </tr>
      <tr>
        <td class="label">Sectors Interested</td>
        <td class="value">${investor.industries && investor.industries.length > 0 ? investor.industries.join(", ") : "Any Industry"}</td>
      </tr>
      ${investor.comments ? `
      <tr>
        <td class="label">Your message</td>
        <td class="value">${investor.comments}</td>
      </tr>` : ""}
    </table>
    <p>Stay tuned to your phone and email inbox for direct opportunities.</p>
  `;

  return await sendMail({
    to: investor.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 3. Send Brand Approval Email
export async function sendBrandApprovalEmail(brand) {
  const title = "Listing Approved! Your Brand is Live - Franchise Apply";
  const contentHeader = `
    <span class="badge badge-approved">Approved & Live</span>
    <h2>Congratulations ${brand.name}!</h2>
    <p>We are pleased to inform you that your brand listing has been approved by our administrators. Your brand is now live on our franchise portal and open for investor leads.</p>
  `;
  const contentBody = `
    <table class="details-table">
      <tr>
        <td class="label">Brand Name</td>
        <td class="value">${brand.name}</td>
      </tr>
      <tr>
        <td class="label">Category</td>
        <td class="value">${brand.category}</td>
      </tr>
      <tr>
        <td class="label">Live URL</td>
        <td class="value"><a href="http://localhost:3000" target="_blank" style="color: #4f46e5; text-decoration: underline;">franchiseapply.com</a></td>
      </tr>
    </table>
    <p>You can now log in to the Brand Owner Panel using your registered email and password to view incoming investor leads.</p>
    <a href="http://localhost:3000/login" class="btn" style="color: white;">Log In to Brand Panel</a>
  `;

  return await sendMail({
    to: brand.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 4. Send Brand Decline Email
export async function sendBrandDeclineEmail(brand) {
  const title = "Update on your Brand Submission - Franchise Apply";
  const contentHeader = `
    <span class="badge badge-declined">Declined</span>
    <h2>Hello ${brand.name},</h2>
    <p>Thank you for submitting your brand details to Franchise Apply. Unfortunately, after review, our administration team has declined your brand listing request at this time.</p>
  `;
  const contentBody = `
    <p>This decision might be due to missing company details, verification issues, or mismatch with our current listing guidelines.</p>
    <p>If you believe this was an error or would like to request feedback, please reply directly to this email or contact support at <strong>support@franchiseapply.com</strong>.</p>
  `;

  return await sendMail({
    to: brand.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}
