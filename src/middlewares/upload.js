const multer =require('multer');

const cloudinary = require('../config/cloudinary');

const cloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;

const storage = new cloudinaryStorage({
    cloudinary: cloudinary,
    params: 'user-uploads',
    allow_formats: ['jpg', 'jpeg', 'png']
});

const upload = multer({ storage: storage,
                        limits: { fileSizes: 3 * 1024 * 1024, files: 5 },
                        fileFilter: (req, file, cb) => {
                            if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                                cb(null, true);
                            } else {
                                cb(new Error('Only JPEG and PNG files are allowed'));
                            }
                        }
 });

module.exports = upload;