import { execSync } from "child_process";
import fs from "fs";
import path from "path";

process.env.PGPASSWORD = "J@i123987";
const pgDumpPath = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe";
const backupDir = path.resolve(process.cwd(), "backups");
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const outputFile = path.resolve(backupDir, "metaphi_cms_before_components.dump");
const cmd = `"${pgDumpPath}" -U postgres -h localhost -p 5432 -d metaphi_cms -F c -b -f "${outputFile}"`;

console.log("Executing:", cmd);
execSync(cmd, { stdio: "inherit" });
const stats = fs.statSync(outputFile);
console.log(`Backup completed successfully! Size: ${stats.size} bytes at ${outputFile}`);
