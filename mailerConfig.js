const mailerCrendentials = require("./mailerCredentials");

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: mailerCrendentials.email,
        pass: mailerCrendentials.password,
    },
    tls: {
        rejectUnauthorized: false, // Deaktiviere Zertifikatüberprüfung - schwierig
    },
});

module.exports = transporter;