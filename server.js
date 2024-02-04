const express = require('express');
const mongoose = require('mongoose');
const File = require('./file');
const multer = require('multer');
const path = require('path');
const app = express();

async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/filen', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
}

connectToMongoDB();

const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        cb(null, 'upload/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('Received file:', req.file); 
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { filename } = req.file;
        const newFile = new File({ filename, path: req.file.path });
        await newFile.save();
        res.status(201).json(newFile);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/files', async (req, res) => {
    try {
        const files = await File.find();
        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/files/:id', async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.delete('/files/:id', async (req, res) => {
    try {
      const file = await File.findByIdAndDelete(req.params.id);
      res.json(file);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
   
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
