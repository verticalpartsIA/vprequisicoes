const fs = require('fs');
const path = require('path');

const required = [
  '.next/standalone/server.js',
  '.next/standalone/package.json',
  '.next/static',
  'public'
];

let ok = true;
console.log('--- Verificando integridade do build Standalone ---');

for (const p of required) {
  const exists = fs.existsSync(path.join(process.cwd(), p));
  console.log(`${exists ? '✅' : '❌'} ${p}`);
  if (!exists) ok = false;
}

if (!ok) {
  console.error('\n❌ Build standalone incompleto. Execute: npm run build');
  process.exit(1);
}
console.log('\n✅ Standalone pronto para deploy.');
