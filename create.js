const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.post('/create-folder', async (req, res) => {
  const subfolder = req.session.user.id; // Obtener el valor del campo 'id' del usuario
//   const userId = req.userId
  console.log('subfolder',subfolder)
//   console.log('userId',userId)
  const destinationPath = path.join(__dirname, 'ftp', subfolder);

  const folderName = req.body.folderName;
  console.log(req.body)
  const newFolderPath = path.join(destinationPath, folderName);

  try {
    if (await folderExists(newFolderPath)) {
      res.status(400).json({ message: 'Folder already exists' });
    } else {
      await fs.promises.mkdir(newFolderPath);
      res.json({ success: true, message: 'Folder created successfully' });
    }
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

async function folderExists(folderPath) {
  try {
    const stats = await fs.promises.stat(folderPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

module.exports = router;
