import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const isConfigured = SMTP_USER && SMTP_PASS;

const logoPath = path.join(process.cwd(), "public", "logo-footer.png");

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

// Base HTML wrapper template with inline CID & Base64 fallback for logo
const baseTemplate = (title, contentHeader, contentBody) => {
  let logoSrc = "cid:logo@franchiseroots";
  
  // If in mock mode (no SMTP credentials configured), use inline Base64 data URL for local HTML preview
  if (!isConfigured && fs.existsSync(logoPath)) {
    try {
      const fileBuffer = fs.readFileSync(logoPath);
      logoSrc = `data:image/png;base64,${fileBuffer.toString("base64")}`;
    } catch (e) {
      console.warn("Failed to generate base64 logo for email template preview", e);
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border-top: 6px solid #4f46e5; overflow: hidden; }
    .header { padding: 24px 30px; background-color: #1e1b4b; text-align: center; color: #ffffff; }
    .header img { height: 50px; max-width: 240px; object-fit: contain; vertical-align: middle; margin: 0 auto; display: block; }
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
      <img src="${logoSrc}" alt="Franchise Roots Logo" />
    </div>
    <div class="content">
      ${contentHeader}
      ${contentBody}
    </div>
    <div class="footer">
      <p>This is an automated notification from Franchise Roots.</p>
      <p>&copy; ${new Date().getFullYear()} Franchise Roots India. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

async function sendMail({ to, subject, html }) {
  if (!isConfigured) {
    console.log("\n------------------- MOCK EMAIL TRIGGERED -------------------");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log("Email Transporter not fully configured in .env (SMTP_USER/SMTP_PASS missing).");
    console.log("------------------------------------------------------------\n");
    return { mock: true, messageId: `mock-${Date.now()}` };
  }

  const attachments = [];
  if (fs.existsSync(logoPath)) {
    attachments.push({
      filename: "franchise-roots-logo.png",
      path: logoPath,
      cid: "logo@franchiseroots",
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Franchise Roots" <${SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
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
  const title = "Brand Registration Received - Franchise Roots";
  const contentHeader = `
    <span class="badge badge-pending">Pending Review</span>
    <h2>Hello ${brand.name},</h2>
    <p>Thank you for registering your brand on Franchise Roots! Your listing has been received and is currently under review by our moderation team. You will receive an email once it is approved and live on the platform.</p>
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
  const title = "Thank you for your Enquiry - Franchise Roots";
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
export async function sendBrandApprovalEmail(brand, customMessage = "") {
  const title = "Listing Approved! Your Brand is Live - Franchise Roots";
  const contentHeader = `
    <span class="badge badge-approved">Approved & Live</span>
    <h2>Congratulations ${brand.name}!</h2>
    <p>We are pleased to inform you that your brand listing has been approved by our administrators. Your brand is now live on our franchise portal and open for investor leads.</p>
    ${customMessage ? `
    <div style="background-color: #f1f5f9; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 12px; color: #475569; font-weight: 700; text-transform: uppercase;">Admin Message / Note:</p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a;">${customMessage}</p>
    </div>` : ""}
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
        <td class="value"><a href="${APP_URL}" target="_blank" style="color: #4f46e5; text-decoration: underline;">franchiseroots.com</a></td>
      </tr>
    </table>
    <p>You can now log in to the Brand Owner Panel using your registered email and password to view incoming investor leads.</p>
    <a href="${APP_URL}/login" class="btn" style="color: white;">Log In to Brand Panel</a>
  `;

  return await sendMail({
    to: brand.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 4. Send Brand Decline Email
export async function sendBrandDeclineEmail(brand, customMessage = "") {
  const title = "Update on your Brand Submission - Franchise Roots";
  const contentHeader = `
    <span class="badge badge-declined">Declined</span>
    <h2>Hello ${brand.name},</h2>
    <p>Thank you for submitting your brand details to Franchise Roots. Unfortunately, after review, our administration team has declined your brand listing request at this time.</p>
    ${customMessage ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 12px; color: #991b1b; font-weight: 700; text-transform: uppercase;">Reason / Admin Note:</p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #7f1d1d;">${customMessage}</p>
    </div>` : ""}
  `;
  const contentBody = `
    <p>This decision might be due to missing company details, verification issues, or mismatch with our current listing guidelines.</p>
    <p>If you believe this was an error or would like to request feedback, please reply directly to this email or contact support at <strong>support@franchiseroots.com</strong>.</p>
  `;

  return await sendMail({
    to: brand.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 5. Send Brand Assigned to Investors Email
export async function sendBrandAssignedToInvestorsEmail(brand, investorsList, customMessage = "") {
  const title = "New Investor Leads Linked to your Brand - Franchise Roots";
  const contentHeader = `
    <h2>Hello ${brand.name} Team,</h2>
    <p>Good news! Our administration team has linked your brand <strong>${brand.name}</strong> to new prospective investor leads that match your investment profile.</p>
    ${customMessage ? `
    <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 12px; color: #475569; font-weight: 700; text-transform: uppercase;">Admin Note:</p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a;">${customMessage}</p>
    </div>` : ""}
  `;
  
  let investorsRows = "";
  investorsList.forEach((inv, index) => {
    investorsRows += `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 13px;"><strong>${index + 1}. ${inv.name}</strong></td>
        <td style="padding: 10px; font-size: 13px;">${inv.preferredLocation || "Any"}</td>
        <td style="padding: 10px; font-size: 13px; color: #059669; font-weight: 600;">${formatLakhs(inv.budgetMin)} - ${formatLakhs(inv.budgetMax)}</td>
        <td style="padding: 10px; font-size: 13px;"><a href="mailto:${inv.email}">${inv.email}</a><br/>${inv.phone || ""}</td>
      </tr>
    `;
  });

  const contentBody = `
    <h3 style="color: #1e1b4b; margin-top: 20px;">Linked Investor Profile Details:</h3>
    <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 8px; overflow: hidden; margin-top: 10px;">
      <thead>
        <tr style="background-color: #1e1b4b; color: white;">
          <th style="padding: 10px; text-align: left; font-size: 13px;">Investor</th>
          <th style="padding: 10px; text-align: left; font-size: 13px;">Location</th>
          <th style="padding: 10px; text-align: left; font-size: 13px;">Budget</th>
          <th style="padding: 10px; text-align: left; font-size: 13px;">Contact</th>
        </tr>
      </thead>
      <tbody>
        ${investorsRows}
      </tbody>
    </table>
    <p style="margin-top: 20px;">You can log in to your Brand Owner Panel to manage these leads and coordinate agreements.</p>
    <a href="${APP_URL}/login" class="btn" style="color: white;">Go to Brand Panel</a>
  `;

  return await sendMail({
    to: brand.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 6. Send Investor Assigned Brand Email
export async function sendInvestorAssignedBrandEmail(investor, brand, customMessage = "") {
  const title = "New Hand-Picked Franchise Opportunity Matched to You - Franchise Roots";
  const contentHeader = `
    <h2>Hello ${investor.name},</h2>
    <p>Our administrator has hand-picked and assigned a premium franchise opportunity that matches your investment preferences!</p>
    ${customMessage ? `
    <div style="background-color: #f1f5f9; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 16px 0; border-radius: 6px;">
      <p style="margin: 0; font-size: 12px; color: #475569; font-weight: 700; text-transform: uppercase;">Admin Note:</p>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #0f172a;">${customMessage}</p>
    </div>` : ""}
  `;
  
  const contentBody = `
    <table class="details-table">
      <tr>
        <td class="label">Brand Name</td>
        <td class="value" style="font-weight: 700; color: #4f46e5;">${brand.name}</td>
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
        <td class="label">Min Investment</td>
        <td class="value" style="font-weight: 600; color: #059669;">${formatLakhs(brand.minInvestment)}</td>
      </tr>
      <tr>
        <td class="label">Max Investment</td>
        <td class="value" style="font-weight: 600; color: #059669;">${formatLakhs(brand.maxInvestment)}</td>
      </tr>
      <tr>
        <td class="label">Franchise HQ</td>
        <td class="value">${brand.hq || "N/A"}</td>
      </tr>
    </table>
    <p>Log in to your Investor Dashboard to see full details of this brand proposal and coordinate next steps.</p>
    <a href="${APP_URL}/login" class="btn" style="color: white;">Open My Dashboard</a>
  `;

  return await sendMail({
    to: investor.email,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 7. Send Admin Notification for New Brand
export async function sendAdminNewBrandNotification(brand) {
  const adminEmail = process.env.ADMIN_EMAIL || SMTP_USER || "admin@franchiseroots.com";
  const title = "New Brand Registration Pending Review - Admin Alert";
  const contentHeader = `
    <span class="badge badge-pending">Action Required</span>
    <h2>Hello Admin,</h2>
    <p>A new brand has registered on Franchise Roots and is pending review and approval.</p>
  `;
  const contentBody = `
    <table class="details-table">
      <tr>
        <td class="label">Brand Name</td>
        <td class="value"><strong>${brand.name}</strong></td>
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
        <td class="value">${brand.investment_range || formatLakhs(brand.minInvestment)} - ${brand.max_investment_limit || formatLakhs(brand.maxInvestment)}</td>
      </tr>
      <tr>
        <td class="label">HQ Location</td>
        <td class="value">${brand.hq} ${brand.pincode ? `(${brand.pincode})` : ""}</td>
      </tr>
      <tr>
        <td class="label">Email Address</td>
        <td class="value">${brand.email}</td>
      </tr>
      <tr>
        <td class="label">Phone Number</td>
        <td class="value">${brand.phone || "N/A"}</td>
      </tr>
    </table>
    <p>Please log in to the Admin Dashboard to approve or reject this brand listing.</p>
    <a href="${APP_URL}/admin" class="btn" style="color: white;">Go to Admin Panel</a>
  `;

  return await sendMail({
    to: adminEmail,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}

// 8. Send Admin Notification for New Investor
export async function sendAdminNewInvestorNotification(investor) {
  const adminEmail = process.env.ADMIN_EMAIL || SMTP_USER || "admin@franchiseroots.com";
  const title = "New Investor Registered - Admin Alert";
  const contentHeader = `
    <h2>Hello Admin,</h2>
    <p>A new investor has registered on Franchise Roots and submitted their matching preferences.</p>
  `;
  const contentBody = `
    <table class="details-table">
      <tr>
        <td class="label">Investor Name</td>
        <td class="value"><strong>${investor.name}</strong></td>
      </tr>
      <tr>
        <td class="label">Investment Range</td>
        <td class="value">${investor.investment_range || formatLakhs(investor.budgetMin)} - ${investor.max_investment_limit || formatLakhs(investor.budgetMax)}</td>
      </tr>
      <tr>
        <td class="label">Pincode</td>
        <td class="value">${investor.pincode}</td>
      </tr>
      <tr>
        <td class="label">Preferred Location</td>
        <td class="value">${investor.preferredLocation || "Any Location"}</td>
      </tr>
      <tr>
        <td class="label">Email Address</td>
        <td class="value">${investor.email}</td>
      </tr>
      <tr>
        <td class="label">Phone Number</td>
        <td class="value">${investor.phone}</td>
      </tr>
    </table>
    <p>Please log in to the Admin Dashboard to manage and assign suitable franchise opportunities to this investor.</p>
    <a href="${APP_URL}/admin" class="btn" style="color: white;">Go to Admin Panel</a>
  `;

  return await sendMail({
    to: adminEmail,
    subject: title,
    html: baseTemplate(title, contentHeader, contentBody),
  });
}
