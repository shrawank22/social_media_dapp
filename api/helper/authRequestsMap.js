// const authRequests = new Map();

// module.exports = authRequests;
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'authRequests.txt');

const setAuthRequests = (key, value) => {
    let data = {};
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (fileContent) {
            data = JSON.parse(fileContent);
        }
    }

    data[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

const getAuthRequests = (key) => {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (fileContent) {
            const data = JSON.parse(fileContent);
            return data[key] || null;
        }
    }
    return null;
}

const deleteAuthRequests = (key) => {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (fileContent) {
            let data = JSON.parse(fileContent);
            if (key in data) {
                delete data[key];
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            } else {
                console.log(`Key: ${key} not found.`);
            }
        }
    } else {
        console.log('File does not exist.');
    }
}


module.exports = { setAuthRequests, getAuthRequests, deleteAuthRequests };