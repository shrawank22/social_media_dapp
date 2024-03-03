const express = require('express');
const router = express.Router();
const axios = require('axios');
const { GetAuthRequests, handleVerification } = require('../helper/helper');

const API_URL = process.env.API_URL || 'http://localhost:3002';
const BASIC_AUTH = process.env.BASIC_AUTH;

router.post('/register', async (req, res) => {
    console.log('/register reached');
    const userDetails = req.body;

    req.body = {
        credentialSchema: 'ipfs://QmNbfvgCgh4MP9zUA9FjtboNRFReU441bEhaoBxHMj4e54',
        type: 'userprofile',
        credentialSubject: userDetails,
        signatureProof: true,
        mtProof: true
    };

    try {
        // create credential
        const issuerRes = await axios.post(`${API_URL}/v1/credentials`, req.body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept' : 'application/json',
                'Authorization': BASIC_AUTH,
                'X-Pinggy-No-Screen' : 1
            }
        });

        console.log('res: ', issuerRes.data);

        // create VC qr code
        const qrCodeRes = await axios.get(`${API_URL}/v1/credentials/${issuerRes.data.id}/qrcode`, {
            headers: {
                'Accept' : 'application/json',
                'X-Pinggy-No-Screen' : 1
            }
        });

        console.log('qrCodeRes: ', qrCodeRes.data);

        // send qr code to user
        const qrCodeLink = qrCodeRes.data.qrCodeLink.split('=')[1]+ '=' + qrCodeRes.data.qrCodeLink.split('=')[2];
        console.log('qrCodeLink: ', qrCodeLink);

        // get qr code link
        const qrCodeLinkRes = await axios.get(`${qrCodeLink}`, {
            headers: {
                'Accept' : 'application/json',
                'X-Pinggy-No-Screen' : 1
            }
        });
        console.log('qrCodeLinkRes: ', qrCodeLinkRes.data);

        res.status(200).send(qrCodeLinkRes.data);
    } catch (err) {
        console.log(err);
    }
});

router.get('/api/sign-in', (req, res) => {
    console.log("get Auth reached");
    GetAuthRequests(req, res);
});

router.get('/api/callback', (req, res) => {
    console.log("get Auth reached");
    // handleVerification(req, res);
});

router.post('/api/callback', (req, res) => {
    console.log("post Auth reached");
    handleVerification(req, res);

});

router.get('/', (req, res) => {
    res.send('Hello from SSI');
});

module.exports = router;