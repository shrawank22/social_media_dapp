const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const CryptoJS = require('crypto-js');
const sss = require('shamirs-secret-sharing');

const router = express.Router();

const sharesDirectory = path.join(__dirname, 'shares');

// Ensure the shares directory exists
fs.mkdir(sharesDirectory, { recursive: true });

const getSharesFilePath = (contentId, gatekeeperId) => {
  return path.join(sharesDirectory, `${contentId}_${gatekeeperId}.json`);
};

router.post('/content/encrypt', async (req, res) => {
  try {
    const { content, gatekeepersCount } = req.body;

    const key = CryptoJS.lib.WordArray.random(256 / 8).toString();

    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(content), key).toString();

    const keyShares = sss.split(Buffer.from(key, 'hex'), {
      shares: gatekeepersCount,
      threshold: Math.ceil((2 * gatekeepersCount) / 3),
    }).map((share, index) => {
      const gatekeeperId = index.toString(); // Gatekeeper ID is used as a unique identifier
      const sharesFilePath = getSharesFilePath(content.contentId, gatekeeperId);

      // Save the share to a file
      fs.writeFile(sharesFilePath, JSON.stringify({ share: share.toString('hex') }));

      return share.toString('hex');
    });

    res.status(200).send({ ciphertext, keyShares });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

router.post('/gatekeepers/:id/share', async (req, res) => {
  try {
    const { id: gatekeeperId } = req.params;
    const { contentId } = req.body;

    const sharesFilePath = getSharesFilePath(contentId, gatekeeperId);

    // Retrieve the share from the file
    const existingShare = await fs.readFile(sharesFilePath, 'utf-8');
    
    res.status(200).send({ share: existingShare });
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: 'Share not found' });
  }
});

router.get('/gatekeepers/:id/share', async (req, res) => {
  try {
    const { id: gatekeeperId } = req.params;
    const { contentId } = req.query;

    const sharesFilePath = getSharesFilePath(contentId, gatekeeperId);

    // Retrieve the share from the file
    const existingShare = await fs.readFile(sharesFilePath, 'utf-8');

    res.status(200).send({ share: existingShare });
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: 'Share not found' });
  }
});

router.delete('/gatekeepers/:id/share', async (req, res) => {
  try {
    const { id: gatekeeperId } = req.params;
    const { contentId } = req.body;

    const sharesFilePath = getSharesFilePath(contentId, gatekeeperId);

    // Delete the share file
    await fs.unlink(sharesFilePath);

    res.status(200).send({ message: 'Share deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(404).send({ message: 'Share not found' });
  }
});

module.exports = router;
