const express = require('express');
const fs = require('fs').promises;
const { ethers } = require('ethers');
const axios = require('axios');

const router = express.Router();

const SHARES_DIR = './shares';
// Create the shares directory if it doesn't exist
fs.mkdir('./shares', { recursive: true })
    .then(() => console.log(`Directory shares created successfully.`))
    .catch((error) => console.error('Error creating directory:', error));

// Initialize ethers.js
let contractAddress = process.env.CONTRACT_ADDRESS;
let contractABI;
let API_KEY = process.env.API_KEY;
const provider = new ethers.providers.JsonRpcProvider(`https://polygon-amoy.g.alchemy.com/v2/${API_KEY}`);

fs.readFile('./abi.json', 'utf8').then(json => {
    const obj = JSON.parse(json);
    contractABI = obj.abi;

    const contract = new ethers.Contract(contractAddress, contractABI, provider);

    router.get('/gatekeepers/:id/share/:uniqueId', async (req, res) => {
        const id = req.params.id;
        const uniqueId = req.params.uniqueId;
        const address = req.query.address;

        try {
            // Call get post route to get NFTID from uniqueID
            const postResponse = await axios.get(`http://localhost:8080/api/posts/${uniqueId}`);

            const NFTID = parseInt(postResponse.data[0].NFTID);

            // Check if the user has paid for the post
            const hasPaid = await contract.hasUserPaidForPost(NFTID, address);

            if (!hasPaid) {
                res.status(403).send({ message: 'You have not view rights of this post.' });
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
