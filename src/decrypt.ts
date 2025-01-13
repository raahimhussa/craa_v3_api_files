const CryptoJS = require('crypto-js');
const AES = require('crypto-js/aes');

export const decrypt = (cipherText: string, secreteKey: string) => {
  const bytes = AES.decrypt(cipherText, secreteKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
