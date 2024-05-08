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

const credentialSubject = {
    city: {
      $eq: "Guwahati",
    },
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
    socketMessage
}