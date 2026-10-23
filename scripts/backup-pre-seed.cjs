const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

if (!process.env.PGPASSWORD) {
  if (process.env.DATABASE_PASSWORD) {
    process.env.PGPASSWORD = process.env.DATABASE_PASSWORD;
  } else if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      if (parsed.password) process.env.PGPASSWORD = decodeURIComponent(parsed.password);
    } catch {}
  }
}

const pgDumpPath = process.env.PG_DUMP_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
const pgRestorePath = process.env.PG_RESTORE_PATH || 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_restore.exe';
const backupDir = path.resolve(__dirname, '..', 'backups');

const outputFile = path.resolve(backupDir, 'pre-healthcare-seed-20261023.dump');

console.log('Running pg_dump to:', outputFile);
execSync(`"${pgDumpPath}" -U postgres -h localhost -p 5432 -d metaphi_cms -F c -b -f "${outputFile}"`, {
  stdio: 'inherit',
  env: process.env,
});

const stats = fs.statSync(outputFile);
console.log(`Backup completed successfully! Size: ${stats.size} bytes`);

console.log('Verifying backup with pg_restore --list...');
const list = execSync(`"${pgRestorePath}" --list "${outputFile}"`, {
  encoding: 'utf-8',
  env: process.env,
});

const lines = list.trim().split('\n');
console.log(`Verification SUCCESS! TOC contains ${lines.length} items.`);
