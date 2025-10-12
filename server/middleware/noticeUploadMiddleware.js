const multer = require('multer');
const path = require('path');

// Set storage engine for notices
const noticeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notices');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Check file type for notices (images and PDFs)
function checkNoticeFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif|pdf/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images and PDFs Only!');
  }
}

// Init upload for notices
const uploadNotice = multer({
  storage: noticeStorage,
  limits: { fileSize: 5000000 }, // 5MB limit for notice attachments
  fileFilter: (req, file, cb) => {
    checkNoticeFileType(file, cb);
  },
}).single('noticeFile'); // 'noticeFile' is the name of the field in the form

module.exports = uploadNotice;