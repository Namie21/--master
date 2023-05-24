const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Destination folder for uploaded files

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
  } else {
    res.send('File uploaded successfully!');
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});