const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3002';
const BASIC_AUTH = process.env.BASIC_AUTH;

router.post('/register', async (req, res) => {
    const userDetails = req.body;

    req.body = {
        credentialSchema: 'ipfs://QmNbfvgCgh4MP9zUA9FjtboNRFReU441bEhaoBxHMj4e54',
        type: 'userprofile',
        credentialSubject: userDetails,
        signatureProof: true,
        mtProof: true
    };

    try {
        const issuerRes = await axios.post(`${API_URL}/v1/credentials`, req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept' : 'application/json',
                'Authorization': BASIC_AUTH
            }
        });

        console.log('res: ', issuerRes.data);

        res.status(200).send(issuerRes.data);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;