const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'eduif-secure-key-32-chars-long!!'; // 32 characters
const ALGORITHM = 'aes-256-cbc';

// Encrypt data
function encryptData(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(JSON.stringify(plaintext), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    iv: iv.toString('hex'),
    data: encrypted
  };
}

// Decrypt data
function decryptData(encryptedObj) {
  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY),
      Buffer.from(encryptedObj.iv, 'hex')
    );
    
    let decrypted = decipher.update(encryptedObj.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

module.exports = {
  encryptData,
  decryptData
};
