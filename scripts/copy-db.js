const fs = require('fs');
const path = require('path');

const src = path.join(process.cwd(), 'prisma', 'dev.db');
const dest = path.join(process.cwd(), 'dev.db');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('✅ Synchronized prisma/dev.db to root dev.db');
} else {
  console.log('ℹ️ No prisma/dev.db found to copy');
}
