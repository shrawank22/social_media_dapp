// import React, { useState } from 'react';
// import CryptoJS from 'crypto-js';

// const Temp = () => {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [encryptedFile, setEncryptedFile] = useState(null);
//   const [decryptedFile, setDecryptedFile] = useState(null);

//   const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     setSelectedFile(file);
//   };

//   const handleEncrypt = () => {
//     if (selectedFile) {
//       const reader = new FileReader();

//       reader.onload = (event) => {
//         const fileContent = event.target.result;
//         const base64Content = btoa(fileContent);
//         const encryptedContent = CryptoJS.AES.encrypt(base64Content, 'your-secret-key').toString();
//         setEncryptedFile(encryptedContent);
//       };

//       reader.readAsBinaryString(selectedFile);
//     }
//   };

//   const handleDecrypt = () => {
//     if (encryptedFile) {
//       const decryptedContent = CryptoJS.AES.decrypt(encryptedFile, 'your-secret-key').toString(CryptoJS.enc.Utf8);
//       const binaryContent = atob(decryptedContent);
//       const byteArray = new Uint8Array(binaryContent.length);

//       for (let i = 0; i < binaryContent.length; i++) {
//         byteArray[i] = binaryContent.charCodeAt(i);
//       }

//       setDecryptedFile(URL.createObjectURL(new Blob([byteArray], { type: selectedFile.type })));
//     }
//   };

//   return (
//     <div>
//       <input type="file" onChange={handleFileChange} />
//       <button onClick={handleEncrypt}>Encrypt</button>
//       <button onClick={handleDecrypt}>Decrypt</button>

//       {encryptedFile && <div>Encrypted Content: {encryptedFile}</div>}
//       {decryptedFile && (
//         <div>
//           <p>Decrypted Content:</p>
//           {selectedFile.type.startsWith('image/') ? (
//             <img src={decryptedFile} alt="Decrypted" />
//           ) : (
//             <a href={decryptedFile} download="decrypted_file">
//               Download Decrypted File
//             </a>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Temp;



import { useState } from 'react';
import CryptoJS from 'crypto-js';

const Temp = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [encryptedFiles, setEncryptedFiles] = useState([]);
  const [decryptedFiles, setDecryptedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = event.target.files;
    setSelectedFiles(Array.from(files)); // Convert FileList to an array
  };

  const handleEncrypt = () => {
    const encryptedFilesArray = [];

    selectedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileContent = event.target.result;
        const base64Content = btoa(fileContent);
        const encryptedContent = CryptoJS.AES.encrypt(base64Content, 'your-secret-key').toString();
        encryptedFilesArray.push(encryptedContent);

        if (encryptedFilesArray.length === selectedFiles.length) {
          setEncryptedFiles([...encryptedFilesArray]);
        }
      };

      reader.readAsBinaryString(file);
    });
  };

  const handleDecrypt = () => {
    const decryptedFilesArray = [];

    encryptedFiles.forEach((encryptedFile, index) => {
      const decryptedContent = CryptoJS.AES.decrypt(encryptedFile, 'your-secret-key').toString(CryptoJS.enc.Utf8);
      const binaryContent = atob(decryptedContent);
      const byteArray = new Uint8Array(binaryContent.length);

      for (let i = 0; i < binaryContent.length; i++) {
        byteArray[i] = binaryContent.charCodeAt(i);
      }

      const decryptedBlob = new Blob([byteArray], { type: selectedFiles[index].type });
      decryptedFilesArray.push(URL.createObjectURL(decryptedBlob));

      if (decryptedFilesArray.length === encryptedFiles.length) {
        setDecryptedFiles([...decryptedFilesArray]);
      }
    });
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} multiple />
      <button onClick={handleEncrypt}>Encrypt</button>
      <button onClick={handleDecrypt}>Decrypt</button>

      {encryptedFiles.length > 0 && (
        <div>
          <p>Encrypted Content:</p>
          <ul>
            {encryptedFiles.map((encryptedFile, index) => (
              <li key={index}>{encryptedFile}</li>
            ))}
          </ul>
        </div>
      )}

      {decryptedFiles.length > 0 && (
        <div>
          <p>Decrypted Content:</p>
          {selectedFiles.map((file, index) => (
            <div key={index}>
              <p>{file.name}</p>
              {file.type.startsWith('image/') ? (
                <img src={decryptedFiles[index]} alt={`Decrypted ${file.name}`} />
              ) : (
                <a href={decryptedFiles[index]} download={`decrypted_${file.name}`}>
                  Download Decrypted {file.name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Temp;

