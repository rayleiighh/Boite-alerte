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
  const badge = type === "package" ? "📦 Colis"
    : type === "alert" ? "⚠️ Alerte"
    : "✉️ Courrier";

  const badgeColor = type === "package" ? "#f97316"
    : type === "alert" ? "#ef4444"
    : "#3b82f6";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boîte-Alerte Notification</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  
  <!-- Container principal -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:40px 20px">
    <tr>
      <td align="center">
        
        <!-- Card email -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(15,23,42,0.08);overflow:hidden;max-width:100%">
          
          <!-- Header avec gradient -->
          <tr>
            <td style="background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);padding:32px 24px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px">
                 Boîte-Alerte
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px">
                Votre système de notifications intelligent
              </p>
            </td>
          </tr>
          
          <!-- Corps du message -->
          <tr>
            <td style="padding:32px 24px">
              
              <!-- Badge type -->
              <div style="display:inline-block;background:${badgeColor};color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;font-weight:600;margin-bottom:20px">
                ${badge}
              </div>
              
              <!-- Titre -->
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:24px;font-weight:600;line-height:1.3">
                ${title}
              </h2>
              
              <!-- Description -->
              <p style="margin:0 0 24px;color:#475569;font-size:16px;line-height:1.6">
                ${description}
              </p>
              
              <!-- Horodatage -->
              <div style="background:#f1f5f9;border-left:4px solid ${badgeColor};padding:16px;border-radius:8px">
                <p style="margin:0;color:#64748b;font-size:14px">
                   <strong style="color:#0f172a">Horodatage :</strong> ${when}
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0">
              <p style="margin:0 0 8px;color:#64748b;font-size:13px">
                Notification automatique de votre Boîte-Alerte
              </p>
              <p style="margin:0;color:#94a3b8;font-size:12px">
                Pour gérer vos préférences, connectez-vous à votre tableau de bord
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"Boîte-Alerte" <${process.env.SMTP_USER}>`,
    to: to || process.env.MAIL_TO_DEFAULT || process.env.SMTP_USER,
    subject: `[Boîte-Alerte] ${title}`,
    html,
  });
}
module.exports = { transporter, sendNotificationEmail };