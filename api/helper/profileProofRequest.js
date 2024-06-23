// module.exports = {
//     profileCredential: (credentialSubject) => {
//         const queries = Object.keys(credentialSubject).map((key, index) => ({
//             id: index + 1,
//             circuitId: "credentialAtomicQuerySigV2",
//             query: {
//                 allowedIssuers: [process.env.ISSUER_DID],
//                 type: "profile",
//                 context: "https://gist.githubusercontent.com/raj-71/cd1a9b2bfce06be0dab33d7aabf30baa/raw/856223f7526c9c3529731db80046e5881875d447/context-ld.json",
//                 credentialSubject: {
//                     data: {}
//                 },
//             },
//         }));
    
//         return queries;
//     }
// };
  
module.exports = {
    profileCredential: () => ({
        id: 1,
        circuitId: "credentialAtomicQuerySigV2",
        query: {
            // allowedIssuers: [process.env.ISSUER_DID],
            allowedIssuers: [
                "*"
            ],
            type: "profile",
            context: "https://gist.githubusercontent.com/raj-71/dee54870bf7126726bbcab69effd25bf/raw/90cf59c1f744a6f0515cbd2e4ce4f6ca9a71ecbe/context-ld_v4.json",
            credentialSubject: {
                data: {}
            },
        },
    }),
};
  