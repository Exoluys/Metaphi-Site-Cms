import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const pgDumpPath = '"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe"';
const backupDir = path.resolve(__dirname, '..', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const backupFile = path.join(backupDir, 'metaphi_cms_before_case_study_migration.dump');
const cmd = `${pgDumpPath} -U postgres -h localhost -p 5432 -d metaphi_cms -F c -b -f "${backupFile}"`;

console.log(`Executing pg_dump before case study migration: ${cmd}`);
try {
  execSync(cmd, {
    env: { ...process.env, PGPASSWORD: 'J@i123987' },
    stdio: 'inherit',
  });
  const stats = fs.statSync(backupFile);
  console.log(`Backup completed successfully! Size: ${stats.size} bytes at ${backupFile}`);
} catch (err: any) {
  console.error(`Backup failed: ${err.message}`);
  process.exit(1);
}
