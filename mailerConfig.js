// transporter.js
const nodemailer = require("nodemailer");

// Holen der Umgebungsvariable MAILER_CREDENTIALS
const credentials = process.env.MAILER_CREDENTIALS;

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: JSON.parse(credentials), // Konvertiere den JSON-String in ein Objekt
    tls: {
        rejectUnauthorized: false,
    },
});

module.exports = transporter;