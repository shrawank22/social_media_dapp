const middlewareObj = {};
const authRequests = require('../helper/authRequestsMap');
const didMap = require('../helper/didMap');
const { auth, resolver } = require("@iden3/js-iden3-auth");
const path = require('path');
const md5 = require('md5');

const keyDIR = "../keys";

middlewareObj.isLoggedIn = async (req, res, next) => {
    console.log("inside isLoggedIn middleware");
    if (req.headers.authorization) {
        const jwz = req.headers.authorization.split(' ')[1];
        console.log('jwz middleware : ', jwz);

        const token = md5(jwz);
        console.log('token middleware : ', token);
        
        const authRequest = authRequests.getAuthRequests(token);
        console.log('authRequest0 : ', authRequest);
        
        const userDid = didMap.getDidMap(token);
        console.log('userDid0 : ', userDid);
        
        const ethStateResolver = new resolver.EthStateResolver(
            process.env.RPC_URL_AMOY,
            process.env.AMOY_CONTRACT_ADDRESS
        );

        console.log("checkpoint 1");

        const resolvers = {
            ["polygon:amoy"]: ethStateResolver,
        };

        const verifier = await auth.Verifier.newVerifier({
            stateResolver: resolvers,
            circuitsDir: path.join(__dirname, keyDIR),
            ipfsGatewayURL: "https://ipfs.io",
        });

        console.log("checkpoint 2")

        const opts = {
            AcceptedStateTransitionDelay: 5 * 60 * 1000, // up to a 5 minute delay accepted by the Verifier
        };

        authResponse = await verifier.fullVerify(jwz, authRequest, opts);

        console.log("checkpoint 3")

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