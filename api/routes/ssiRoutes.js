const express = require('express');
const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const axios = require('axios');
const path = require('path');
const { STATUS, MSG, proofRequest, socketMessage } = require('../helper/helper');
const router = express.Router();

const keyDIR = "./keys";
const API_URL = process.env.HOSTED_ISSUER_URL;
const BASIC_AUTH = process.env.BASIC_AUTH;
const VERIFIER_DID = process.env.VERIFIER_DID;
const RPC_URL_AMOY = process.env.RPC_URL_AMOY;
const AMOY_CONTRACT_ADDRESS = process.env.AMOY_CONTRACT_ADDRESS;
const HOSTED_SERVER_URL = process.env.HOSTED_SERVER_URL;

const authRequests = new Map();

router.post('/register', async (req, res) => {
    const userDetails = req.body;
    console.log(userDetails);

    let credDetails = {
        credentialSchema: 'https://gist.githubusercontent.com/raj-71/1662fdca98c9dad3a034e404ae9a9701/raw/a5b7146a786e28e9b15e162e08dbdd7a4769718f/schema.json',
        type: 'profile',
        credentialSubject: userDetails,
        signatureProof: true,
        mtProof: true
    };

    try {
        // create credential
        const issuerRes = await axios.post(`${API_URL}/v1/credentials`, credDetails, {
            headers: {
              'Content-Type': 'application/json',
              'Accept' : 'application/json',
              'Authorization': BASIC_AUTH
            }
        });

        // create VC qr-code
        const qrCodeRes = await axios.get(`${API_URL}/v1/credentials/${issuerRes.data.id}/qrcode`, {
            headers: {
                'Accept' : 'application/json'
            }
        });

        // send qr code to user
        const qrCodeLink = API_URL + '/v1/qr-store?id=' + qrCodeRes.data.qrCodeLink.split('=')[2];

        // get qr code link
        const qrCodeLinkRes = await axios.get(`${qrCodeLink}`);
        qrCodeLinkRes.data.body.url = `${API_URL}/v1/agent`;

        res.status(200).send(qrCodeLinkRes.data);
    } catch (err) {
        console.log("Error : ", err.response.data);

        if(err.response.data.message === "claim details incorrect") {
        return res.status(404).send({message: "Incorrect Details"});
        }

        if(err.response.data.message === "Error in aadhaar service") {
        return res.status(500).send({message: "Error in aadhaar service"});
        }
        
        return res.status(500).send({message: "Error in creating profile"});
    }
});

// GetQR return connection request
router.get('/get-connection-qr', (req, res) => {
    console.log("getConnectionQr called");
    const sessionId = req.query.sessionId;

    io.sockets.emit(
        sessionId,
        socketMessage("getAuthQr", STATUS.IN_PROGRESS, sessionId)
    );

    const uri = `${HOSTED_SERVER_URL}/api/connection-callback?sessionId=${sessionId}`;

    const request = auth.createAuthorizationRequest(
        MSG.connectionAuthReason,
        VERIFIER_DID,
        uri
    );

    request.id = sessionId;
    request.thid = sessionId;

    request.body.scope = [];

    // store this session's auth request
    authRequests.set(sessionId, request);

    io.sockets.emit(sessionId, socketMessage("getAuthQr", STATUS.DONE, request));

    return res.status(200).set("Content-Type", "application/json").send(request);
});

// handleConnectionCallback verifies the proof after get-connection-qr callbacks
router.post('/connection-callback', async (req, res) => {
    console.log('handleConnection Callback called');

    const sessionId = req.query.sessionId;
    console.log("sessionId : ", sessionId);

    io.sockets.emit(
        sessionId,
        socketMessage("handleConnectionCallback", STATUS.IN_PROGRESS, sessionId)
    );

    const authRequest = authRequests.get(`${sessionId}`);
  
    console.log(`handleConnectionCallback for ${sessionId}`);
    
    const raw = await getRawBody(req);
    console.log("raw : ", raw);

    const tokenStr = raw.toString().trim();
    console.log("tokenStr : ", tokenStr);

    const ethStateResolver = new resolver.EthStateResolver(
      RPC_URL_AMOY,
      AMOY_CONTRACT_ADDRESS
    );

    const resolvers = {
      ["polygon:amoy"]: ethStateResolver,
    };

    const verifier = await auth.Verifier.newVerifier({
      stateResolver: resolvers,
      circuitsDir: path.join(__dirname, keyDIR),
      ipfsGatewayURL: "https://ipfs.io",
    });

    try {
        console.log("inside try block");
  
        const token = await verifier.verifyJWZ(tokenStr);
  
        console.log("token : ", token);
  
        authResponse = JSON.parse(
          token.getPayload(),
        );
  
        console.log("authResponse : ", authResponse);
        console.log("token.getPayload(): ", token.getPayload());
    
        await verifier.verifyAuthResponse(authResponse, authRequest);
  
        io.sockets.emit(
          sessionId,
          socketMessage("handleConnectionCallback", STATUS.DONE, authResponse.from)
        );

        return res.status(200).send(authResponse);
    } catch (error) {
        console.log("handleConnectionCallback error : ", error);
        return res.status(500).send("error in verifying connection");
    }
});

// GetAuthQR returns auth request
router.get('/get-auth-qr', (req, res) => {
    const sessionId = req.query.sessionId;

    io.sockets.emit(
      sessionId,
      socketMessage("getAuthQr", STATUS.IN_PROGRESS, sessionId)
    );

    const uri = `${HOSTED_SERVER_URL}/api/connection-callback?sessionId=${sessionId}`;

    const request = auth.createAuthorizationRequest(
        MSG.humanReadableAuthReason,
        VERIFIER_DID,
        uri
    );

    request.id = sessionId;
    request.thid = sessionId;
  
    const scope = request.body.scope ?? [];
    request.body.scope = [...scope, proofRequest];
  
    // store this session's auth request
    authRequests.set(sessionId, request);
  
    io.sockets.emit(sessionId, socketMessage("getAuthQr", STATUS.DONE, request));
  
    return res.status(200).set("Content-Type", "application/json").send(request);
});

// handleVerification verifies the proof after get-auth-qr callbacks
router.post('/verification-callback', async (req, res) => {
    const sessionId = req.query.sessionId;
    console.log("sessionId : ", sessionId);
    
    const authRequest = authRequests.get(`${sessionId}`);
  
    console.log(`handleVerification for ${sessionId}`);
    console.log('authRequest : ', authRequest);
  
    io.sockets.emit(
      sessionId,
      socketMessage("handleVerification", STATUS.IN_PROGRESS, authRequest)
    );
  
    // get JWZ token params from the post request
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    console.log("tokenStr : ", tokenStr);
  
    const ethStateResolver = new resolver.EthStateResolver(
        RPC_URL_AMOY,
        AMOY_CONTRACT_ADDRESS
    );

    const resolvers = {
        ["polygon:amoy"]: ethStateResolver,
    };
    
    const verifier = await auth.Verifier.newVerifier({
        stateResolver: resolvers,
        circuitsDir: path.join(__dirname, keyDIR),
        ipfsGatewayURL: "https://ipfs.io",
    });

    try {
        const opts = {
            AcceptedStateTransitionDelay: 5 * 60 * 1000, // up to a 5 minute delay accepted by the Verifier
        };
        authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);

        console.log("authResponse : ", authResponse);
    
        const userId = authResponse.from;
        io.sockets.emit(
            sessionId,
            socketMessage("handleVerification", STATUS.DONE, authResponse)
        );

        return res.status(200).send(authResponse);
    } catch (error) {
        console.log("handleVerification error : ", sessionId, error);
        io.sockets.emit(
            sessionId,
            socketMessage("handleVerification", STATUS.ERROR, error)
        );
        return res.status(500).send(error);
    }
})

module.exports = router;