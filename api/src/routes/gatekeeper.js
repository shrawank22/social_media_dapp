const express = require('express');
const fs = require('fs').promises;
const { ethers } = require('ethers');

const router = express.Router();

const SHARES_DIR = './shares';
// Create the shares directory if it doesn't exist
fs.mkdir('./shares', { recursive: true })
    .then(() => console.log(`Directory shares created successfully.`))
    .catch((error) => console.error('Error creating directory:', error));

// Initialize ethers.js
const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
let contractAddress = '0xE1411E5c7e31b3FEb1a22e560f0551CBB46BFA31';
let contractABI;
fs.readFile('./abi.json', 'utf8').then(json => {
    const obj = JSON.parse(json);
    contractABI = obj.abi;

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    router.get('/gatekeepers/:id/share/:uniqueId', async (req, res) => {
        const id = req.params.id;
        const uniqueId = req.params.uniqueId;

        // Check if the user has paid for the post
        try {
            const hasPaid = await contract.hasUserPaidForPost(1, "0xec38702f99F326C5587E9fB94E110Eb65d0Ca7Bd");
            console.log('hasPaid:', hasPaid);

            if (!hasPaid) {
                res.status(403).send({ message: 'Payment required' });
                return;
            }

            // Retrieve the share from the file
            const shareFileName = `${uniqueId}_share_${id}.txt`;
            const share = await fs.readFile(`${SHARES_DIR}/${shareFileName}`, 'utf8');
            res.status(200).send({ share });
        } catch (error) {
            res.status(404).send({ message: 'Share not found' });
        }
    });


}).catch(error => console.error('Error reading file:', error));

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


module.exports = router;
