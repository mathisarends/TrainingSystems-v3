import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const credentials = process.env.MAILER_CREDENTIALS;

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: JSON.parse(credentials), // convert JSON-String to an object
    tls: {
        rejectUnauthorized: false,
    },
});

export default transporter;