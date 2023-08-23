const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Importa el módulo fs
// Set up storage for uploaded files

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const subfolder = req.userId; // Obtener el valor del campo 'id' del JSON
//     const destinationPath = path.join(__dirname,'ftp', subfolder);
//     console.log('destination',destinationPath)
//     fs.mkdir(destinationPath, { recursive: true }, (err) => {
//         if (err) {
//             console.error('Error al crear la carpeta:', err);
//             return cb(err, null);
//         }
//         cb(null, destinationPath);
//     });
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const subfolder = req.userId; // Obtener el valor del campo 'id' del JSON
    const destinationPath = path.join(__dirname, 'ftp', subfolder);
    console.log('destination', destinationPath);

    fs.mkdir(destinationPath, { recursive: true }, (err) => {
      if (err) {
        console.error('Error al crear la carpeta:', err);
        return cb(err, null);
      }
      cb(null, destinationPath);
    });
  },
  filename: async (req, file, cb) => {
    const originalName = file.originalname;
    const destinationPath = path.join(__dirname, 'ftp', req.userId);

    let newFilename = originalName;
    let counter = 1;

    while (await fileExists(path.join(destinationPath, newFilename))) {
      const fileNameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
      const fileExtension = path.extname(originalName);
      newFilename = `${fileNameWithoutExtension} (${counter})${fileExtension}`;
      counter++;
    }

    cb(null, newFilename);
  },
});

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
}

  
// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;