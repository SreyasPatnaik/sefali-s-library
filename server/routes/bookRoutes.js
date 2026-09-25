const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GridFS Storage Helpers for permanent MongoDB cloud storage
const saveFileToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) return resolve(null);
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'ebooks' });
    const uploadStream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype || 'application/pdf',
    });
    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', (err) => reject(err));
    uploadStream.end(file.buffer);
  });
};

const deleteFileFromGridFS = async (fileId) => {
  if (!fileId) return;
  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'ebooks' });
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (err) {
    console.warn('[GridFS] Could not delete file:', err.message);
  }
};

const router = express.Router();

// Helper to parse multipart or JSON book fields
const parseBookFields = (body, file) => {
  let formats = ['EPUB', 'PDF'];
  if (body.formats) {
    if (Array.isArray(body.formats)) {
      formats = body.formats;
    } else if (typeof body.formats === 'string') {
      try {
        formats = JSON.parse(body.formats);
      } catch {
        formats = body.formats.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }

  let chapters = [];
  if (body.chapters) {
    if (typeof body.chapters === 'string') {
      try { chapters = JSON.parse(body.chapters); } catch {}
    } else if (Array.isArray(body.chapters)) {
      chapters = body.chapters;
    }
  }

  let sampleChapter = null;
  if (body.sampleChapter) {
    if (typeof body.sampleChapter === 'string') {
      try { sampleChapter = JSON.parse(body.sampleChapter); } catch {}
    } else {
      sampleChapter = body.sampleChapter;
    }
  }

  const result = {
    title: body.title,
    author: body.author || 'Shefali Jangid',
    price: Number(body.price),
    formats,
    tag: (body.tag || 'SYSTEMS').toUpperCase(),
    synopsis: body.synopsis,
    edition: body.edition || 'Edition 2026',
    status: body.status || 'Published',
    readingMood: body.readingMood || 'High Scalability Architecture',
    pageCount: Number(body.pageCount) || 180,
    coverGradient: body.coverGradient || 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    coverColor: body.coverColor || '#1e293b',
    chapters,
    sampleChapter: sampleChapter || {
      chapterNumber: 1,
      title: 'Sample Chapter',
      subtitle: 'Preview Content',
      content: body.synopsis || '',
      keyTakeaway: 'Sample takeaway note.'
    }
  };

  if (file) {
    result.fileOriginalName = file.originalname;
    result.fileSize = file.size;
    result.fileMimeType = file.mimetype;
  }

  return result;
};

// @route   GET /api/books
// @desc    Get all books with optional search, tag, or status filters
router.get('/', async (req, res) => {
  try {
    const { tag, search, status, featured } = req.query;
    let query = {};

    // Filter by status if provided, default to Published for customers unless requested otherwise
    if (status) {
      query.status = status;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (tag && tag.toLowerCase() !== 'all') {
      query.tag = new RegExp(tag, 'i');
    }

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { author: new RegExp(search, 'i') },
        { synopsis: new RegExp(search, 'i') }
      ];
    }

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving book catalog', error: err.message });
  }
});

// @route   GET /api/books/:id
// @desc    Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving book', error: err.message });
  }
});

// @route   GET /api/books/:id/sample
// @desc    Get free sample chapter for preview
router.get('/:id/sample', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({
      title: book.title,
      author: book.author,
      sampleChapter: book.sampleChapter || (book.chapters && book.chapters[0])
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving sample chapter', error: err.message });
  }
});

// @route   POST /api/books
// @desc    Create new e-book with optional attached file (Admin)
router.post('/', auth, adminOnly, upload.single('ebookFile'), async (req, res) => {
  try {
    const parsedData = parseBookFields(req.body, req.file);

    if (!parsedData.title || !parsedData.price || !parsedData.tag || !parsedData.synopsis) {
      return res.status(400).json({ message: 'Title, price, tag, and synopsis are required.' });
    }

    if (req.file) {
      const fileId = await saveFileToGridFS(req.file);
      parsedData.fileId = fileId;
      parsedData.ebookFile = `/api/books/stream/${fileId}`;
    }

    const newBook = await Book.create(parsedData);
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Error creating e-book:', err);
    res.status(500).json({ message: 'Error creating e-book', error: err.message });
  }
});

// @route   PUT /api/books/:id
// @desc    Update e-book metadata and optional file replacement (Admin)
router.put('/:id', auth, adminOnly, upload.single('ebookFile'), async (req, res) => {
  try {
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updateData = parseBookFields(req.body, req.file);

    if (req.file) {
      // Remove old file from GridFS if present
      if (existingBook.fileId) {
        await deleteFileFromGridFS(existingBook.fileId);
      }
      // Also remove old disk file if it was on disk
      if (existingBook.ebookFile && existingBook.ebookFile.startsWith('/uploads')) {
        const oldFilePath = path.join(__dirname, '..', existingBook.ebookFile);
        if (fs.existsSync(oldFilePath)) {
          try { fs.unlinkSync(oldFilePath); } catch (fErr) {}
        }
      }

      // Save new file into MongoDB GridFS
      const fileId = await saveFileToGridFS(req.file);
      updateData.fileId = fileId;
      updateData.ebookFile = `/api/books/stream/${fileId}`;
    } else {
      // Retain existing file if no new file uploaded
      updateData.fileId = existingBook.fileId;
      updateData.ebookFile = existingBook.ebookFile;
      updateData.fileOriginalName = existingBook.fileOriginalName;
      updateData.fileSize = existingBook.fileSize;
      updateData.fileMimeType = existingBook.fileMimeType;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedBook);
  } catch (err) {
    console.error('Error updating e-book:', err);
    res.status(500).json({ message: 'Error updating e-book', error: err.message });
  }
});

// @route   POST /api/books/:id/reviews
// @desc    Add review for a book (Authenticated user)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const existingReviewIndex = book.reviews.findIndex(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (existingReviewIndex >= 0) {
      book.reviews[existingReviewIndex].rating = rating;
      book.reviews[existingReviewIndex].comment = comment;
      book.reviews[existingReviewIndex].createdAt = new Date();
    } else {
      book.reviews.push({
        userId: req.user._id,
        userName: req.user.name,
        rating,
        comment,
        createdAt: new Date()
      });
    }

    // Recalculate average rating
    const totalRating = book.reviews.reduce((acc, item) => item.rating + acc, 0);
    book.rating = Number((totalRating / book.reviews.length).toFixed(1));

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Error submitting review', error: err.message });
  }
});

// @route   GET /api/books/:id/pdf
// @desc    Stream e-book/PDF file for reading in browser
router.get('/:id/pdf', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || (!book.fileId && !book.ebookFile)) {
      return res.status(404).json({ message: 'No digital file uploaded for this title' });
    }

    res.setHeader('Content-Type', book.fileMimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.fileOriginalName || book.title + '.pdf')}"`);

    // 1. Stream from permanent MongoDB GridFS storage
    if (book.fileId) {
      try {
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'ebooks' });
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(book.fileId));
        downloadStream.on('error', (err) => {
          console.error('[GridFS stream error]:', err.message);
          if (!res.headersSent) {
            res.status(404).json({ message: 'File not found in database storage. Please re-upload in Catalog Control.' });
          }
        });
        return downloadStream.pipe(res);
      } catch (gErr) {
        console.warn('GridFS stream error, falling back to disk:', gErr.message);
      }
    }

    // 2. Fallback to physical disk
    if (book.ebookFile) {
      const filePath = path.join(__dirname, '..', book.ebookFile);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }

    res.status(404).json({ message: 'E-Book file not found on server storage. Please re-upload in Catalog Control.' });
  } catch (err) {
    res.status(500).json({ message: 'Error reading e-book file', error: err.message });
  }
});

// @route   GET /api/books/:id/download
// @desc    Download genuine e-book file
router.get('/:id/download', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || (!book.fileId && !book.ebookFile)) {
      return res.status(404).json({ message: 'No digital file available for download' });
    }

    const downloadName = book.fileOriginalName || `${book.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`;
    res.setHeader('Content-Type', book.fileMimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);

    // 1. Stream from permanent MongoDB GridFS storage
    if (book.fileId) {
      try {
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'ebooks' });
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(book.fileId));
        downloadStream.on('error', (err) => {
          console.error('[GridFS download error]:', err.message);
          if (!res.headersSent) {
            res.status(404).json({ message: 'File not found in database storage. Please re-upload in Catalog Control.' });
          }
        });
        return downloadStream.pipe(res);
      } catch (gErr) {
        console.warn('GridFS download error, falling back to disk:', gErr.message);
      }
    }

    // 2. Fallback to physical disk
    if (book.ebookFile) {
      const filePath = path.join(__dirname, '..', book.ebookFile);
      if (fs.existsSync(filePath)) {
        return res.download(filePath, downloadName);
      }
    }

    res.status(404).json({ message: 'E-Book file not found on server storage. Please re-upload in Catalog Control.' });
  } catch (err) {
    res.status(500).json({ message: 'Error downloading e-book file', error: err.message });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete e-book (Admin)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Remove from MongoDB GridFS
    if (book.fileId) {
      await deleteFileFromGridFS(book.fileId);
    }

    // Remove physical file from disk if present
    if (book.ebookFile && book.ebookFile.startsWith('/uploads')) {
      const filePath = path.join(__dirname, '..', book.ebookFile);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fErr) {
          console.warn('Failed to delete file from storage:', fErr.message);
        }
      }
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'E-Book deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting e-book', error: err.message });
  }
});

module.exports = router;
