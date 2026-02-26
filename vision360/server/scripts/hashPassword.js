import bcrypt from "bcryptjs";

const pwd = process.argv[2];
const rounds = Number(process.argv[3] || 12);

if (!pwd) {
  console.log("Usage: node scripts/hashPassword.js <password> [rounds]");
  process.exit(1);
}

console.log(bcrypt.hashSync(String(pwd), rounds));