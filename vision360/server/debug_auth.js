import bcrypt from "bcryptjs";

const hashDamien = "$2b$12$dNpKPFiSCSBEZHPLDEO8IeiYN3AvXZCfTDjiL6ROxszqoQ4QrDMrm";
const hashEleve = "$2b$12$6r5va7mRBMAYtMyaFeoH9OEyx9XWEw0wI8ViVCxzeZCHa5rvNDACO";
const hashAdmin = "$2b$12$T458q4FwVLUvHCbXX9ITKOIk5vf6eTbETEjLeMqr5ChTeQ8j660yS";

console.log("Damien 'ponassie':", bcrypt.compareSync("ponassie", hashDamien));
console.log("Damien 'PONASSIE':", bcrypt.compareSync("PONASSIE", hashDamien));

console.log("Eleve 'eleve':", bcrypt.compareSync("eleve", hashEleve));
console.log("Eleve 'ELEVE':", bcrypt.compareSync("ELEVE", hashEleve));

console.log("Admin 'admin':", bcrypt.compareSync("admin", hashAdmin));
console.log("Admin 'ADMIN':", bcrypt.compareSync("ADMIN", hashAdmin));
