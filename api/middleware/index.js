const middlewareObj = {};
const authRequests = require('../helper/authRequestsMap');
const didMap = require('../helper/didMap');
const { auth, resolver } = require("@iden3/js-iden3-auth");
const path = require('path');

const keyDIR = "../keys";

middlewareObj.isLoggedIn = async (req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        // console.log('token middleware : ', token);

        const sessionId = req.query.sessionId;
        console.log("sessionId0 : ", sessionId);
        
        const authRequest = authRequests.get(`${sessionId}`);
        console.log('authRequest0 : ', authRequest);
        
        const userDid = didMap.get(sessionId);
        console.log('userDid0 : ', userDid);
        
        const ethStateResolver = new resolver.EthStateResolver(
            process.env.RPC_URL_AMOY,
            process.env.AMOY_CONTRACT_ADDRESS
        );

        const resolvers = {
            ["polygon:amoy"]: ethStateResolver,
        };

        const verifier = await auth.Verifier.newVerifier({
            stateResolver: resolvers,
            circuitsDir: path.join(__dirname, keyDIR),
            ipfsGatewayURL: "https://ipfs.io",
        });

        const opts = {
            AcceptedStateTransitionDelay: 5 * 60 * 1000, // up to a 5 minute delay accepted by the Verifier
        };

        authResponse = await verifier.fullVerify(token, authRequest, opts);

        console.log("authResponse : ", authResponse);

        if(authResponse.to === authRequest.from && authResponse.from === userDid){
            next();
        } else {
            return res.status(401).send("You are not authorized to do that!");
        }
    } else {
        return res.status(401).send("You need to be logged in to do that!");
    }
}

module.exports = middlewareObj;