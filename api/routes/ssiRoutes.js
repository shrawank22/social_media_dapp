const express = require('express');
const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const axios = require('axios');
const path = require('path');
const authRequests = require('../helper/authRequestsMap');
const { STATUS, MSG, proofRequest, socketMessage, extractCredentialValues } = require('../helper/helper');
const router = express.Router();
const Cache = require("cache-manager");
const md5 = require('md5');
const User = require('../models/User');
const { setAddress, getAddress } = require('../helper/addressMap');
const { setDidMap, deleteDidMap } = require('../helper/didMap');

const keyDIR = "../keys";
const API_URL = process.env.HOSTED_ISSUER_URL;
const BASIC_AUTH = process.env.BASIC_AUTH;
const VERIFIER_DID = process.env.VERIFIER_DID;
const RPC_URL_AMOY = process.env.RPC_URL_AMOY;
const AMOY_CONTRACT_ADDRESS = process.env.AMOY_CONTRACT_ADDRESS;
const HOSTED_SERVER_URL = process.env.HOSTED_SERVER_URL;

const cPromise = Cache.caching("memory", {
    max: 100,
    ttl: 60 * 1000
});

const replaceAuthRequestMapKey = (oldKey, newKey) => {
    console.log("oldKey : ", oldKey);
    console.log("value : ", authRequests.getAuthRequests(oldKey));
    // console.log("authRequests : ", authRequests);
    if (authRequests.getAuthRequests(oldKey)) {
        authRequests.setAuthRequests(newKey, authRequests.getAuthRequests(oldKey));
        authRequests.deleteAuthRequests(oldKey);
    }
}

const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

router.post('/logout', async (req, res) => {
    // fetch sessionId
    // const sessionId = req.query.sessionId;
    // console.log("sessionId : ", sessionId);

    console.log("req.headers: ", req.headers);

    // const token = req.headers.authorization.split(' ')[1];
    // console.log('token middleware : ', token);

    // // remove the sessionId from maps
    // authRequests.deleteAuthRequests(token);
    // didMap.deleteDidMap(token);

    res.status(200).send("Logged out successfully");
})

router.post('/register', async (req, res) => {
    const userDetails = req.body.userDetails;
    const username = req.body.userAddress;
    logger.info(`Registering user: ${username}`);
    logger.debug('User details:', userDetails);

    let credDetails = {
        credentialSchema: 'https://gist.githubusercontent.com/raj-71/1bb1de438d30cb5d94d330737b3b6957/raw/bfe66511446f3654992cf92db469f74063f655f6/schema_v4.json',
        type: 'profile',
        credentialSubject: userDetails,
        signatureProof: true,
        mtProof: true
    };

    try {
        // create credential
        logger.info('Creating credential');
        const issuerRes = await axios.post(`${API_URL}/v1/credentials`, credDetails, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': BASIC_AUTH
            }
        });

        // create VC qr-code
        logger.info('Creating QR code');
        const qrCodeRes = await axios.get(`${API_URL}/v1/credentials/${issuerRes.data.id}/qrcode`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        // send qr code to user
        const qrCodeLink = API_URL + '/v1/qr-store?id=' + qrCodeRes.data.qrCodeLink.split('=')[2];
        logger.info(`QR code link generated: ${qrCodeLink}`);

        // get qr code link
        const qrCodeLinkRes = await axios.get(`${qrCodeLink}`);
        qrCodeLinkRes.data.body.url = `${API_URL}/v1/agent`;

        // store the user address to db 
        try {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                logger.warn(`User already exists: ${username}`);
                return res.status(400).send('A user with this username already exists.');
            }

            const user = new User({ username });
            await user.save();
            logger.info(`User saved successfully: ${username}`);

            // res.status(200).send({qrCodeLink: qrCodeLinkRes.data, user});  
        } catch (err) {
            logger.error('Error in saving user:', { error: err.message });
            return res.status(500).send(err.message);
        }

        logger.info('Registration successful', { username });
        res.status(200).send(qrCodeLinkRes.data);
    } catch (err) {

        logger.error('Error in registration process', {
            error: err.response ? err.response.data : err.message,
            username
        });

        if (err.response.data.message === "claim details incorrect") {
            return res.status(404).send({ message: "Incorrect Details" });
        }

        if (err.response.data.message === "Error in aadhaar service") {
            return res.status(500).send({ message: "Error in aadhaar service" });
        }

        return res.status(500).send({ message: "Error in creating profile" });
    }
});

// GetQR return connection request
router.get('/connection', async (req, res) => {
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
    authRequests.setAuthRequests(sessionId, request);

    const cacheManager = await cPromise;

    await cacheManager.set(`connection_${sessionId}`, JSON.stringify(request), { ttl: 120 * 1000 });

    const qrUrl = `iden3comm://?request_uri=${HOSTED_SERVER_URL}/api/qr-code-connection?sessionId=${sessionId}`;

    io.sockets.emit(sessionId, socketMessage("getAuthQr", STATUS.DONE, qrUrl));

    return res.status(200).set("Content-Type", "application/json").send(qrUrl);
});

// GetQR returns connection request
router.get('/qr-code-connection', async (req, res) => {
    const sessionId = req.query.sessionId;
    console.log("sessionId : ", sessionId);

    const cacheManager = await cPromise;

    const request = await cacheManager.get(`connection_${sessionId}`);
    console.log("request : ", request);

    if (!request) {
        return res.status(404).send({ error: "Data not found" });
    }

    return res.status(200).send(JSON.parse(request));
})

// handleConnectionCallback verifies the proof after get-connection-qr callbacks
router.post('/connection-callback', async (req, res) => {
    console.log('handleConnection Callback called');

    const sessionId = req.query.sessionId;
    console.log("sessionId : ", sessionId);

    io.sockets.emit(
        sessionId,
        socketMessage("handleConnectionCallback", STATUS.IN_PROGRESS, sessionId)
    );

    const authRequest = authRequests.getAuthRequests(`${sessionId}`);

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
router.get('/login', async (req, res) => {
    const sessionId = req.query.sessionId;
    const userAddress = req.query.userAddress;

    console.log("sessionId : ", sessionId);
    console.log("userAddress : ", userAddress);

    io.sockets.emit(
        sessionId,
        socketMessage("getAuthQr", STATUS.IN_PROGRESS, sessionId)
    );

    const uri = `${HOSTED_SERVER_URL}/api/verification-callback?sessionId=${sessionId}`;

    const request = auth.createAuthorizationRequest(
        MSG.humanReadableAuthReason,
        VERIFIER_DID,
        uri
    );

    request.id = sessionId;
    request.thid = sessionId;

    console.log("proofRequest : ", proofRequest);

    const scope = request.body.scope ?? [];
    request.body.scope = [...scope, proofRequest];

    // store this session's auth request
    authRequests.setAuthRequests(sessionId, request);

    console.log("request : ", request);

    const cacheManager = await cPromise;

    await cacheManager.set(`login_${sessionId}`, JSON.stringify(request), { ttl: 120 * 1000 });

    const qrUrl = `iden3comm://?request_uri=${HOSTED_SERVER_URL}/api/qr-code?sessionId=${sessionId}`;

    // addressMap.set(sessionId, userAddress);
    setAddress(sessionId, userAddress);

    io.sockets.emit(sessionId, socketMessage("getAuthQr", STATUS.DONE, qrUrl));

    return res.status(200).set("Content-Type", "application/json").send(qrUrl);
});

router.get('/qr-code', async (req, res) => {
    const sessionId = req.query.sessionId;
    console.log("sessionId : ", sessionId);

    const cacheManager = await cPromise;

    const request = await cacheManager.get(`login_${sessionId}`);
    console.log("request : ", request);

    if (!request) {
        return res.status(404).send({ error: "Data not found" });
    }

    return res.status(200).send(JSON.parse(request));
})

// handleVerification verifies the proof after get-auth-qr callbacks
router.post('/verification-callback', async (req, res) => {
    const sessionId = req.query.sessionId;
    console.log("sessionId : ", sessionId);
    // const userAddress = addressMap.get(sessionId);
    const userAddress = getAddress(sessionId);
    console.log("userAddress : ", userAddress);

    const authRequest = authRequests.getAuthRequests(sessionId);

    console.log(`handleVerification for ${sessionId}`);
    console.log('authRequest : ', authRequest);

    io.sockets.emit(
        sessionId,
        socketMessage("handleVerification", STATUS.IN_PROGRESS, authRequest)
    );

    // get JWZ token params from the post request
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    const token = md5(tokenStr);

    console.log("md5 token : ", token);

    replaceAuthRequestMapKey(sessionId, token);

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
        const profile = extractCredentialValues(authResponse);

        io.sockets.emit(
            sessionId,
            socketMessage("handleVerification", STATUS.DONE, {
                userDid: authResponse.from,
                jwzToken: tokenStr,
                profile: profile,
            })
        );

        setDidMap(token, authResponse.from);

        return res.status(200).send(authResponse);
    } catch (error) {
        console.log("handleVerification error : ", sessionId, error);
        io.sockets.emit(
            sessionId,
            socketMessage("handleVerification", STATUS.ERROR, error)
        );
        return res.status(500).send(error);
    }
});

module.exports = router;