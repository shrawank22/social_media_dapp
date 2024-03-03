const getRawBody = require('raw-body');
const path = require("path");
const { auth, resolver,  } =  require("@iden3/js-iden3-auth");


// Create a map to store the auth requests and their session IDs
const requestMap = new Map();


async function GetAuthRequests(req, res) {
    const hostUrl = process.env.BACKEND_URL;
    const verifierDID = process.env.ISSUER_DID;
    const sessionId = req.sessionID;
    const callbackURL = "/ssi/api/callback";

    console.log("Session ID: ", sessionId);

    // TODO: emit sessionId to the client
    // io socket emit 


    const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;
    console.log("uri : ", uri);



    // Generate request for basic authentication
    const request = auth.createAuthorizationRequest(
        'test flow',
        verifierDID,
        uri,
    );

    // console.log("Request: ", request);

    // request.id = sessionId;
    // request.thid = sessionId;
    const proofRequest = {
        id: 1,
        circuitId: 'credentialAtomicQuerySigV2',
        query: {
            allowedIssuers: ["*"],
            type: 'userprofile',
            context: "ipfs://QmZWhEjnMt65QmiFkNqoNHx8QNwRShyV5RJ6rHWY9qdwvy",
            credentialSubject: {
                address: {
                    $eq: "Kanpur",
                }
            },
            skipClaimRevocationCheck: true,
        }
    }

    const scope = request.body.scope ?? [];
    request.body.scope = [...scope, proofRequest];

    // store this session's auth request
    requestMap.set(sessionId, request);

    // TODO: send request to the client

    console.log("Request: ", request);

    return res.status(200).set('Content-Type', 'application/json').set('bypass-tunnel-reminder', 1).send(request);
}


async function handleVerification(req, res) {
    const sessionId = req.query.sessionID;

    console.log("Session ID handleVerification: ", sessionId);

    const authRequest = requestMap.get(sessionId);

    console.log("Auth request for session : ", sessionId, " is: ", authRequest);

    // TODO : socketio emit authRequest to the client

    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();

    const mumbaiContractAddress = "0x134B1BE34911E39A8397ec6289782989729807a4";
    const keyDIR = "../keys";

    const ethStateResolver = new resolver.EthStateResolver(
        process.env.RPC_URL_MUMBAI,
        mumbaiContractAddress
    );

    const resolvers = {
        ["polygon:mumbai"] : ethStateResolver
    };

    const verifier = await auth.Verifier.newVerifier({
        stateResolver: resolvers,
        circuitsDir: path.join(__dirname, keyDIR),
        ipfsGatewayURL: "https://ipfs.io"
    });

    try {
        const opts = {
            AcceptedStateTransitionDelay: 5 * 60 * 1000, // upto 5 mins delay accepted by the Verifier
        };

        authResponse = await  verifier.fullVerify(tokenStr, authRequest, opts);
        const userId = authRequest.from;

        // TODO : socketio emit authResponse

        return res.status(200).set("Content-Type", "application/json").send("User " + userId + " successfully authenticated");
    } catch (err) {
        console.log(`Error in handleVerification : `, err);
        
        // TODO : socketio emit error

        return res.status(500).send(err);
    }
}

module.exports = {
    GetAuthRequests,
    handleVerification
};