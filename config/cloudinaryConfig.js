
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = ['video/mp4', 'video/avi', 'video/mkv'].includes(file.mimetype);
    const isPdf = file.mimetype === 'application/pdf';

    let folder = 'uploads';
    let resourceType = 'image';

    if (isVideo) {
      folder = 'videos';
      resourceType = 'video';
    } else if (isPdf) {
      folder = 'pdfs';
      resourceType = 'raw';
    }

    return {
      folder,
      resource_type: resourceType,
      allowed_formats: isVideo ? ['mp4', 'avi', 'mkv'] : isPdf ? ['pdf'] : ['jpg', 'png', 'gif', 'jpeg'],
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
