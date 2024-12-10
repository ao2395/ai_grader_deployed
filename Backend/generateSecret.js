// Generate a 256-bit (32-byte) secret
const crypto = require("crypto");

const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString("hex");
};

const jwtSecret = generateJwtSecret();
console.log(`Your JWT Secret: ${jwtSecret}`);
