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

    authResponse?.body?.scope.forEach((scopeItem) => {
        const credentialSubject = scopeItem?.vp?.verifiableCredential?.credentialSubject;
        if (credentialSubject?.aadhaarNo) {
            extractedValues.aadhaarNo = credentialSubject.aadhaarNo;
        }
        if (credentialSubject?.name) {
            extractedValues.name = credentialSubject.name;
        }
        if (credentialSubject?.city) {
            extractedValues.city = credentialSubject.city;
        }
        if (credentialSubject?.gender) {
            extractedValues.gender = credentialSubject.gender;
        }
        if (credentialSubject?.dob) {
            extractedValues.dob = credentialSubject.dob;
        }
    });

    return extractedValues;
};

const credentialSubject = {
    aadhaarNo: {},
    city: {},
    name: {},
    dob: {},
    gender: {}
};

const proofRequest = profileCredential(credentialSubject);

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