const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinaryConfig');
const File = require('../models/file.model');
const { verifyToken } = require('../middleware/auth'); // Import the auth middleware
const router = express.Router();
 
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow multiple file formats (image + pdf)
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'application/pdf', 'video/mp4', 'video/avi', 'video/mkv'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'), false);
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).send('File not found');

    // Use axios to fetch the file from the external URL
    const response = await axios.get(file.url, { responseType: 'stream' });
    const fileName = path.basename(file.url);

    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': response.headers['content-type']
    });

    response.data.pipe(res);
  } catch (error) {
    res.status(500).send('Error downloading the file');
  }
});

router.post('/upload-file', verifyToken, upload.array('file', 10), async (req, res) => {
  const { category } = req.body;
  const userId = req.user._id; // Logged-in user's ID
  try {
    const files = req.files.map(file => ({
      url: file.path,
      category: category || 'Others',
      user: userId, // Associate file with user
    }));
    await File.insertMany(files);
    res.redirect('/home');
  } catch (error) {
    console.error('Error saving files:', error);
    res.status(500).send('Error saving files to database');
  }
});

router.get('/home', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id; // Logged-in user's ID
    const files = await File.find({ user: userId }); // Fetch files for the user
    res.render('home', {
      files: files, // Pass user's files to view
      user: req.user, // Logged-in user
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).send('Error fetching files');
  }
});


router.post('/delete-file/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    await File.findByIdAndDelete(fileId);
    res.redirect('/home');
   } catch (error) {
    res.send('Error deleting file');
  }
});
 

// Landing page route
router.get('/', (req, res) => {
  res.render('index'); // Render the index.ejs file
});



module.exports = router;