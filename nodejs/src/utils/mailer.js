const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

exports.sendMail = (to, subject, html) =>
  getTransporter().sendMail({
    from: process.env.MAIL_FROM || "Frost & Flour <no-reply@frostflour.tn>",
    to,
    subject,
    html,
  });
