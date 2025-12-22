const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Image upload
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'learnhub/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

exports.uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Video upload
const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'learnhub/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv']
  }
});

exports.uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  }
});

// Document upload
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'learnhub/documents',
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt']
  }
});

exports.uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

