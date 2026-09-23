import bcrypt from 'bcryptjs';

const senha = '123456';

const hash = '$2a$10$39KjZ.rCj1.VfP6b5J5u1eW8q6.lW9Zp6J5u1eW8q6.lW9Zp6J5u1';

console.log('Hash:', hash);
console.log('Tamanho:', hash.length);

const resultado = await bcrypt.compare(senha, hash);

console.log('Senha correta?', resultado);