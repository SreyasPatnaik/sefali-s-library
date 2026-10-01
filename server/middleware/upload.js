const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'ebooks');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedExtensions = [
    '.pdf', '.epub', '.mobi', '.doc', '.docx', '.txt',
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('application/pdf')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type "${ext}". Permitted files: Images (JPG, PNG, WEBP, GIF, SVG) and Documents (PDF, EPUB, DOC).`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

module.exports = upload;
