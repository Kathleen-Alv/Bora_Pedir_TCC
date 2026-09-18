import jwt from 'jsonwebtoken';


// ================================================================
// AUTENTICAÇÃO
// ================================================================

export function autenticar(req, res, next) {

    // ============================================================
    // 1. PEGA O HEADER AUTHORIZATION
    // ============================================================

    const authorization =
        req.headers.authorization;


    // ============================================================
    // 2. VERIFICA SE EXISTE TOKEN
    // ============================================================

    if (!authorization) {

        return res.status(401).json({

            message:
                'Token de autenticação não informado.'

        });

    }


    // ============================================================
    // 3. SEPARA "Bearer TOKEN"
    // ============================================================

    const partes =
        authorization.split(' ');


    if (
        partes.length !== 2 ||
        partes[0] !== 'Bearer'
    ) {

        return res.status(401).json({

            message:
                'Formato do token inválido.'

        });

    }


    const token = partes[1];


    // ============================================================
    // 4. VERIFICA O TOKEN
    // ============================================================

    try {

        const usuario =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ========================================================
        // 5. COLOCA O USUÁRIO NO REQUEST
        // ========================================================

        req.usuario = usuario;


        // ========================================================
        // 6. CONTINUA
        // ========================================================

        next();


    } catch (error) {

        return res.status(401).json({

            message:
                'Token inválido ou expirado.'

        });

    }

}