const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

const KEY_HEX = process.env.ENCRYPTION_KEY; 
if (!KEY_HEX) throw new Error('ENCRYPTION_KEY is not set in env');

const KEY = Buffer.from(KEY_HEX, 'hex');


function isEncryptedObject(v) {
  return (
    v &&
    typeof v === "object" &&
    typeof v.iv === "string" &&
    typeof v.content === "string" &&
    typeof v.tag === "string"
  );
}

function encryptValue(value) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);

  const plain = JSON.stringify(value);
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag().toString("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
    tag
  };
}

function decryptValue(enc) {
  if (!isEncryptedObject(enc)) return enc;

  const iv = Buffer.from(enc.iv, "hex");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(Buffer.from(enc.tag, "hex"));

  let decrypted = decipher.update(enc.content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}

module.exports = {
  encryptValue,
  decryptValue,
  isEncryptedObject   
};
