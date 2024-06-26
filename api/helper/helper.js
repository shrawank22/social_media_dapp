const { profileCredential } = require("./profileProofRequest");

const STATUS = {
    IN_PROGRESS: "IN_PROGRESS",
    ERROR: "ERROR",
    DONE: "DONE",
};

const MSG = {
    humanReadableAuthReason: "Profile must be presented",
    authMessage: "Authentication to login",
    connectionAuthReason: "Authentication to connect"
}

// Function to extract values and return an object
const extractCredentialValues = (authResponse) => {
    let extractedValues = {};

    console.log("authResponse : ", JSON.stringify(authResponse));

    authResponse?.body?.scope.forEach((scopeItem) => {
        const credentialSubject = scopeItem?.vp?.verifiableCredential?.credentialSubject;
        if (credentialSubject?.data) {
            extractedValues.data = credentialSubject.data;
        }
    });

    return extractedValues;
};

const proofRequest = profileCredential();

const socketMessage = (fn, status, data) => ({
    fn,
    status,
    data,
});

module.exports = {
    STATUS,
    MSG,
    proofRequest,
    socketMessage,
    extractCredentialValues,
}