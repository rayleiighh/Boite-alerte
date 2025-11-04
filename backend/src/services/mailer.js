require("dotenv").config();
const nodemailer = require("nodemailer");

// Configuration Gmail simplifiée
const transporter = nodemailer.createTransport({
  service: 'Gmail', // ✅ Utilise le preset Gmail
  auth: {
    user: process.env.SMTP_USER, // ton-email@gmail.com
    pass: process.env.SMTP_PASS, // mot de passe d'application 16 caractères
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Vérification au démarrage (optionnel mais utile pour debug)
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erreur configuration SMTP Gmail:", error.message);
  } else {
    console.log("✅ Serveur Gmail prêt à envoyer des emails");
  }
});

async function sendNotificationEmail({ type, title, description, when, to }) {
  const badge =
    type === "package" ? "📦 Colis" :
    type === "alert"   ? "⚠️ Alerte" :
                         "✉️ Courrier";

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;padding:16px;background:#f6f7fb">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;box-shadow:0 6px 20px rgba(0,0,0,.06)">
      <h2 style="margin:0 0 8px">${badge} — ${title}</h2>
      <p style="margin:0 0 12px;color:#111827">${description}</p>
      <p style="margin:0;color:#6b7280;font-size:14px">Horodatage : <strong>${when}</strong></p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
      <p style="color:#6b7280;font-size:12px;margin:0">Boîte-Alerte — notification automatique</p>
    </div>
  </div>`;

  await transporter.sendMail({
    from: process.env.SMTP_USER, // Gmail exige que from = SMTP_USER
    to: to || process.env.MAIL_TO_DEFAULT || process.env.SMTP_USER,
    subject: `[Boîte-Alerte] ${title}`,
    html,
  });
}

module.exports = { transporter, sendNotificationEmail };