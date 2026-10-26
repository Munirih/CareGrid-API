const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    console.error(err.message)
    console.error(err.stack || '')
    const status = err.status || 500

    if (err instanceof multer.MulterError) {
        return res.status(400).json('Invalid file type or too large file. Please upload a JPEG or PNG image under 3MB.')
    }

    res.status(status).json({
        error: err.message,
    })
}

module.exports = errorHandler