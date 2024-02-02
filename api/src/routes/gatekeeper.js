const express = require('express');
const fs = require('fs').promises;

const router = express.Router();

const SHARES_DIR = './shares';
// Create the shares directory if it doesn't exist
fs.mkdir('./shares', { recursive: true })
    .then(() => console.log(`Directory shares created successfully.`))
    .catch((error) => console.error('Error creating directory:', error));


router.post('/gatekeepers/:id/share/:uniqueId', async (req, res) => {
    const id = req.params.id;
    const uniqueId = req.params.uniqueId;
    const share = req.body.share;

    // Store the share in a file
    const shareFileName = `${uniqueId}_share_${id}.txt`;

    try {
        await fs.writeFile(`${SHARES_DIR}/${shareFileName}`, share);
        res.status(200).send({ message: 'Share stored successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error storing share' });
    }
});

router.get('/gatekeepers/:id/share/:uniqueId', async (req, res) => {
    const id = req.params.id;
    const uniqueId = req.params.uniqueId;

    // Retrieve the share from the file
    const shareFileName = `${uniqueId}_share_${id}.txt`;

    try {
        const share = await fs.readFile(`${SHARES_DIR}/${shareFileName}`, 'utf8');

        // Send the share as the response
        res.status(200).send({ share });
    } catch (error) {
        res.status(404).send({ message: 'Share not found' });
    }
});

// router.post('/content/decrypt/:uniqueId', (req, res) => {
//     const shares = req.body.shares;
//     const ciphertext = req.body.ciphertext;
//     const uniqueId = req.params.uniqueId;

//     // Combine the shares to reconstruct the encryption key
//     const key = sss.combine(shares).toString();

//     // Use the key to decrypt the content
//     const bytes = CryptoJS.AES.decrypt(ciphertext, key);
//     const decrypted = bytes.toString(CryptoJS.enc.Utf8);

//     console.log(decrypted)

//     res.status(200).send({ content: decrypted });

// });
module.exports = router;
