import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// =========================
// CAMINHO DO TEMPLATE
// =========================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caminhoTemplate = path.join(
    __dirname,
    '../templates/comercio/emailPendente.html'
);


// =========================
// CONFIGURAÇÃO DO GMAIL
// =========================

const transporter = nodemailer.createTransport({
    service: 'gmail',

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// =========================
// ENVIO DO EMAIL
// =========================

export async function enviarEmail(destinatario, assunto, nome) {

    // Lê o arquivo HTML
    let html = fs.readFileSync(
        caminhoTemplate,
        'utf-8'
    );

    // Substitui {{nome_responsavel}}! pelo nome do usuário
    html = html.replace('{{nome_responsavel}}', nome);

    const info = await transporter.sendMail({

        from: `"Bora Pedir Delivery" <${process.env.EMAIL_USER}>`,

        to: destinatario,

        subject: assunto,

        html: html
    });

    console.log('Email enviado:', info.messageId);

    return info;
}