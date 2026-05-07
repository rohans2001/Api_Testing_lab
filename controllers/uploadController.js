const { sendSuccess, sendError } = require('../utils/responseUtils');

const uploadFile = (req, res) => {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return sendError(res, 400, 'No file uploaded');
  }
  
  if (req.file) {
    sendSuccess(res, 200, 'File uploaded successfully', {
      filename: req.file.filename,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size
    });
  } else {
    const uploadedFiles = req.files.map(f => ({
      filename: f.filename,
      path: `/uploads/${f.filename}`,
      size: f.size
    }));
    sendSuccess(res, 200, 'Files uploaded successfully', uploadedFiles);
  }
};

module.exports = { uploadFile };
