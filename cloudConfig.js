const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    // params: {
    //   folder: 'IntegratedCare_DEV',
    //   allowedFormats: ["png","jpeg","jpg","mp4","webM"], // supports promises as well
    // },
    params: async (req, file) => {
      let resource_type = file.mimetype.startsWith('video/') ? 'video' : 'image';
      return {
          folder: 'IntegratedCare_DEV',
          allowed_formats: ['jpeg', 'jpg', 'png', 'mp4', 'webm'],
          public_id: `${Date.now()}-${file.originalname}`,
          resource_type: resource_type,
      };
  },
  });

 module.exports = {
    cloudinary,
    storage
  };