import mariadb from 'mariadb';

export const db = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'senai2026', /*DEPENDE ONDE VC ESTA MUDE A SENHA */
    database: 'bora_pedir_delivery',
    connectionLimit: 5
});
