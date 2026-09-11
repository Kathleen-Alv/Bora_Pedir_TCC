import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// =========================
// CAMINHO BASE DOS TEMPLATES
// =========================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
// ENVIO DO EMAIL Pendente
// =========================

export async function enviarEmailPendente(
    destinatario,
    assunto,
    nome,
    tipoCadastro
) {

    // =========================
    // ESCOLHE O TEMPLATE
    // =========================

    const caminhoTemplate = path.join(
        __dirname,
        `../templates/${tipoCadastro}/emailPendente.html`
    );


    // =========================
    // VERIFICA SE O TEMPLATE EXISTE
    // =========================

    if (!fs.existsSync(caminhoTemplate)) {

        throw new Error(
            `Template de email não encontrado: ${caminhoTemplate}`
        );

    }


    // =========================
    // LÊ O TEMPLATE
    // =========================

    let html = fs.readFileSync(
        caminhoTemplate,
        'utf-8'
    );


    // =========================
    // SUBSTITUI O NOME
    // =========================

    html = html.replace(
        '{{nome}}',
        nome
    );

    // Compatibilidade com o template do comércio
    html = html.replace(
        '{{nome_responsavel}}',
        nome
    );


    // =========================
    // ENVIA O EMAIL
    // =========================

    const info = await transporter.sendMail({

        from: `"Bora Pedir Delivery" <${process.env.EMAIL_USER}>`,

        to: destinatario,

        subject: assunto,

        html: html

    });


    // =========================
    // LOG
    // =========================

    console.log(
        'Email enviado:',
        info.messageId
    );


    return info;
}


// =========================
// ENVIO DO EMAIL Aprovado
// =========================



export async function enviarEmailAprovado(
    destinatario,
    assunto,
    nome,
    tipoCadastro
) {

    // =========================
    // ESCOLHE O TEMPLATE
    // =========================

    const caminhoTemplate = path.join(
        __dirname,
        `../templates/${tipoCadastro}/emailAprovado.html`
    );


    // =========================
    // VERIFICA SE O TEMPLATE EXISTE
    // =========================

    if (!fs.existsSync(caminhoTemplate)) {

        throw new Error(
            `Template de email não encontrado: ${caminhoTemplate}`
        );

    }


    // =========================
    // LÊ O TEMPLATE
    // =========================

    let html = fs.readFileSync(
        caminhoTemplate,
        'utf-8'
    );


    // =========================
    // SUBSTITUI O NOME
    // =========================

    html = html.replace(
        '{{nome}}',
        nome
    );

    // Compatibilidade com o template do comércio
    html = html.replace(
        '{{nome_responsavel}}',
        nome
    );


    // =========================
    // ENVIA O EMAIL
    // =========================

    const info = await transporter.sendMail({

        from: `"Bora Pedir Delivery" <${process.env.EMAIL_USER}>`,

        to: destinatario,

        subject: assunto,

        html: html

    });


    // =========================
    // LOG
    // =========================

    console.log(
        'Email enviado:',
        info.messageId
    );


    return info;
}
