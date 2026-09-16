import multer from 'multer';
import path from 'path';
import fs from 'fs';


// ================================================================
// PASTA DE UPLOAD DO CARDÁPIO
// ================================================================

const cardapioPath = path.join(
    process.cwd(),
    'uploads',
    'cardapio'
);


// ================================================================
// CRIAR PASTA CASO NÃO EXISTA
// ================================================================

fs.mkdirSync(
    cardapioPath,
    {
        recursive: true
    }
);


// ================================================================
// CONFIGURAÇÃO DO STORAGE
// ================================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            cardapioPath
        );

    },


    filename: (req, file, cb) => {

        const extensao =
            path
                .extname(file.originalname)
                .toLowerCase();


        const nomeArquivo =
            `item-${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;


        cb(
            null,
            nomeArquivo
        );

    }

});


// ================================================================
// FILTRO DE IMAGEM
// ================================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    if (
        !file.mimetype.startsWith('image/')
    ) {

        cb(
            new Error(
                'Apenas arquivos de imagem são permitidos.'
            )
        );

        return;
    }


    cb(
        null,
        true
    );

};


// ================================================================
// MULTER
// ================================================================

export const uploadCardapio = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            5 * 1024 * 1024

    }

});