#!/usr/bin/env node

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('\u274c Uso: node scripts/hash-password.js "SuaSenhaSegura"');
  process.exit(1);
}

if (password.length < 8) {
  console.error('\u274c A senha deve ter pelo menos 8 caracteres');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

console.log('\u2705 Hash gerado com sucesso:');
console.log('');
console.log('ADMIN_PASSWORD_HASH=' + hash);
console.log('');
console.log('\ud83d\udd10 Adicione esta linha ao seu arquivo .env');
console.log('\u26a0\ufe0f  NUNCA compartilhe este hash publicamente');
