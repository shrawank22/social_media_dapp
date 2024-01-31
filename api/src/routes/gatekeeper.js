const express = require('express');
const CryptoJS = require('crypto-js');
const sss = require('shamirs-secret-sharing')

// sss was giving error, that's why added randombytes package
const randombytes = require('randombytes');
globalThis.crypto = {
    getRandomValues: (buffer) => {
        const random = randombytes(buffer.length);
        const uint8Buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        return Buffer.from(random).copy(uint8Buffer);
    },
};


const router = express.Router();

const sharesDatabase = {};

router.post('/content/encrypt', (req, res) => {
    const {content, gatekeepersCount} = req.body;
 
    const key = CryptoJS.lib.WordArray.random(256 / 8).toString(); // Generate a random encryption key

    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(content), key).toString(); // Used AES to encrypt the content

    const shares = sss.split(Buffer.from(key, 'hex'), { shares: gatekeepersCount, threshold: Math.ceil(2 * gatekeepersCount / 3) }); // Split the key into parts

    res.status(200).send({ ciphertext, keyShares: shares.map(share => share.toString('hex')) });
});


router.post('/gatekeepers/:id/share', (req, res) => {
    const id = req.params.id;
    const share = req.body.share;

    // Store the share in the database
    sharesDatabase[id] = share;

    res.status(200).send({ message: 'Share stored successfully' });
});

router.get('/gatekeepers/:id/share', (req, res) => {
    const id = req.params.id;

    // Retrieve the share from the database
    const share = sharesDatabase[id];

    if (share) {
        res.status(200).send({ share });
    } else {
        res.status(404).send({ message: 'Share not found' });
    }
});

router.post('/content/decrypt', (req, res) => {
    const shares = req.body.shares;
    const ciphertext = req.body.ciphertext;

    // Combine the shares to reconstruct the encryption key
    const key = sss.combine(shares.map(share => Buffer.from(share, 'hex'))).toString('hex');

    // Use the key to decrypt the content
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    res.status(200).send({ content: JSON.parse(decrypted) });
});


module.exports = router