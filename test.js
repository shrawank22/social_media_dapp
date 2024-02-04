import fs from 'fs'
import CryptoJS from 'crypto-js';

const secretKey = 'your-secret-key'; // Change this to your secret key

// Function to convert binary data to Base64
function binaryToBase64(binaryData) {
  return Buffer.from(binaryData).toString('base64');
}

// Function to convert Base64 data to binary
function base64ToBinary(base64Data) {
  return Buffer.from(base64Data, 'base64');
}

// Function to encrypt a file
function encryptFile(inputFilePath, outputFilePath) {
  const data = fs.readFileSync(inputFilePath);
  const encryptedData = CryptoJS.AES.encrypt(binaryToBase64(data), secretKey).toString();
  fs.writeFileSync(outputFilePath, encryptedData);
  console.log('File encrypted successfully.');
}

// Function to decrypt a file
function decryptFile(inputFilePath, outputFilePath) {
  const encryptedData = fs.readFileSync(inputFilePath).toString();
  const decryptedData = base64ToBinary(CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8));
  fs.writeFileSync(outputFilePath, decryptedData);
  // console.log(decryptedData)
  console.log('File decrypted successfully.');
}


const imageFile = '1.jpeg';
const encryptedImageFile = 'encrypted_example.jpeg';
const decryptedImageFile = 'decrypted_example.jpeg';

encryptFile(imageFile, encryptedImageFile);
console.log(encryptedImageFile)
decryptFile(encryptedImageFile, decryptedImageFile);
