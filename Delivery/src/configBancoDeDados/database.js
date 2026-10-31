import mariadb from 'mariadb'; // <-- Adicione esta linha no topo do arquivo

export const db = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'bora_pedir_delivery',
    connectionLimit: 10,
    bigIntAsNumber: true
});