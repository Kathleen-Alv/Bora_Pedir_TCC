import multer from 'multer';
import path from 'path';
import fs from 'fs';

/* =========================
   PASTAS DE UPLOAD
========================= */

const logosPath = path.join(
    process.cwd(),
    'uploads',
    'comercios',
    'logos'
);

const bannersPath = path.join(
    process.cwd(),
    'uploads',
    'comercios',
    'banners'
);


/* =========================
   CRIAR PASTAS
========================= */

fs.mkdirSync(logosPath, {
    recursive: true
});

fs.mkdirSync(bannersPath, {
    recursive: true
});


/* =========================
   CONFIGURAÇÃO DO STORAGE
========================= */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (file.fieldname === 'logo') {
            cb(null, logosPath);
            return;
        }

        if (file.fieldname === 'banner') {
            cb(null, bannersPath);
            return;
        }

        cb(new Error('Campo de imagem inválido'));
    },

    filename: (req, file, cb) => {

        const extensao = path
            .extname(file.originalname)
            .toLowerCase();

        const nomeArquivo =
            `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;

        cb(null, nomeArquivo);
    }

});


/* =========================
   FILTRO DE IMAGEM
========================= */

const fileFilter = (req, file, cb) => {

    if (!file.mimetype.startsWith('image/')) {

        cb(
            new Error('Apenas arquivos de imagem são permitidos')
        );

        return;
    }

    cb(null, true);
};


/* =========================
   MULTER
========================= */

export const uploadComercio = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});