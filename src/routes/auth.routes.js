const express = require('express')

const { registerUser, loginUser, getMe } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validations/user.validation');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post('/register', validateRegister, registerUser)

router.post('/login', validateLogin, loginUser)

router.get('/me', authenticate, getMe)

router.post("/upload", upload.single('image'), (req, res) => {
    const fileUrl = req.file.path;
    const filename = req.file.filename;

    console.log(fileUrl);
    console.log(filename);
    res.send("Files uploaded successfully");
});

module.exports = router;