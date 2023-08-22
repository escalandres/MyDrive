const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Importa el módulo fs
// Set up storage for uploaded files

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('hola')
    console.log('body',req.userId)
    const subfolder = req.userId; // Obtener el valor del campo 'id' del JSON
    console.log(subfolder);
    const destinationPath = path.join(__dirname,'ftp', subfolder);
    console.log('destination',destinationPath)
    fs.mkdir(destinationPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error al crear la carpeta:', err);
            return cb(err, null);
        }
        cb(null, destinationPath);
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
  
// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;