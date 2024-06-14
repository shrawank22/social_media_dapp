// const addressMap = new Map();

// module.exports = addressMap;

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'addressMap.txt');

const setAddress = (key, value) => {
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

const getAddress = (key) => {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        if (fileContent) {
            const data = JSON.parse(fileContent);
            return data[key] || null;
        }
    }
    return null;
}

module.exports = { setAddress, getAddress };