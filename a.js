// app.use('/ftp',express.static('public/ftp'))

// app.get('/ftp1', (req, res) => {
//     const directoryPath = path.join(__dirname, 'public/ftp/0001');
//     const files = fs.readdirSync(directoryPath, { withFileTypes: true });
  
//     const source = fs.readFileSync(path.join(__dirname, 'views/index.html'), 'utf8');
//     const template = handlebars.compile(source);
//     const data = {
//       files: files.map(file => ({
//         name: file.name,
//         isDirectory: file.isDirectory(),
//         size: file.isDirectory() ? '-' : getSizeInKB(file.size)
//       }))
//     };
  
//     const html = template(data);
//     res.send(html);
//   });
  
//   function getSizeInKB(filePath) {
//     try {
//       const stats = fs.statSync(filePath);
//       return (stats.size / 1024).toFixed(2) + ' KB';
//     } catch (error) {
//       console.error('Error getting file size:', error);
//       return 'N/A';
//     }
//   }